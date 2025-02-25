// src/hooks/useGameState.ts with lastUpdated tracking
import { useState, useCallback, useEffect } from 'react';
import { Game, PlayerCount, GameType } from '../types';
import { calculatePoints } from '../utils/skatScoring';
import { updatePlayerPoints } from '../services/skatApi';
import { StorageManager } from '@/utils/storage';

// Add lastUpdated to the return type
interface GameStateReturn {
  currentGame: Game;
  setCurrentGame: React.Dispatch<React.SetStateAction<Game>>;
  games: Game[];
  playerCounts: PlayerCount[];
  handleGameComplete: () => Promise<void>;
  handleGameTypeSelect: (type: GameType) => void;
  startEditingGame: (gameNumber: number) => void;
  cancelEditing: () => void;
  isEditing: boolean;
  isLoading?: boolean;
  lastUpdated: {
    playerId: number;
    statType: 'wonCount' | 'lostCount';
  } | null;
}

interface GameStateProps {
  numPlayers: number;
  totalGames: number;
  seriesId: string | null;
  tischId: string | null;
  listId?: number;
}

// Move initialGameState outside the hook
const initialGameState: Game = {
  gameNumber: 1,
  dealer: 0,
  player: null,
  gameType: '',
  hand: false,
  schneider: false,
  schwarz: false,
  ouvert: false,
  schneiderAnnounced: false,
  schwarzAnnounced: false,
  played: false,
  won: false,
  mitOhne: 'mit',
  multiplier: 1,
  isEditing: false
};

export const useGameState = ({
  numPlayers,
  totalGames,
  seriesId,
  tischId,
  listId
}: GameStateProps): GameStateReturn => {
  const [currentGame, setCurrentGame] = useState<Game>(initialGameState);
  const [games, setGames] = useState<Game[]>([]);
  const [playerCounts, setPlayerCounts] = useState<PlayerCount[]>([]);
  const [editingGameBackup, setEditingGameBackup] = useState<{
    game: Game;
    currentGame: Game;
    playerCounts: PlayerCount[];
    lastUpdated: {
      playerId: number;
      statType: 'wonCount' | 'lostCount';
    } | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add state for tracking last updated player and stat
  const [lastUpdated, setLastUpdated] = useState<{
    playerId: number;
    statType: 'wonCount' | 'lostCount';
  } | null>(null);

  // Create a memoized function to generate initial games
  const createInitialGames = useCallback(() => {
    return Array(totalGames).fill(null).map((_, index) => ({
      ...initialGameState,
      gameNumber: index + 1,
      dealer: Math.floor(index / (numPlayers - 1)) % numPlayers
    }));
  }, [totalGames, numPlayers]);

  // Create a memoized function to generate initial player counts
  const createInitialPlayerCounts = useCallback(() => {
    return Array(numPlayers).fill(null).map(() => ({
      wonCount: 0,
      lostCount: 0,
      basePoints: 0,
      totalPoints: 0
    }));
  }, [numPlayers]);

  // Load stored data on mount if listId is provided
  useEffect(() => {
    const loadStoredData = async () => {
      if (listId) {
        try {
          const lists = await StorageManager.getAllLists();
          const storedList = lists.find(list => list.id === listId);

          if (storedList) {
            // Create base games array
            const initialGames = Array(totalGames).fill(null).map((_, index) => ({
              ...initialGameState,
              gameNumber: index + 1,
              dealer: Math.floor(index / (numPlayers - 1)) % numPlayers
            }));

            // Merge stored games, preserving all game data
            storedList.games.forEach(storedGame => {
              const index = storedGame.gameNumber - 1;
              if (index >= 0 && index < initialGames.length) {
                // Ensure we copy all game properties
                initialGames[index] = {
                  ...storedGame,
                  isEditing: false  // Reset editing state on load
                };
              }
            });

            setGames(initialGames);
            setPlayerCounts(storedList.playerCounts);

            // Find next unplayed game or use last game
            const nextUnplayedGame = initialGames.find(game => !game.played);
            if (nextUnplayedGame) {
              setCurrentGame(nextUnplayedGame);
            } else {
              setCurrentGame(initialGames[initialGames.length - 1]);
            }
          }
        } catch (error) {
          console.error('Error loading stored list:', error);
        }
      } else {
        // Initialize fresh game state
        const freshGames = Array(totalGames).fill(null).map((_, index) => ({
          ...initialGameState,
          gameNumber: index + 1,
          dealer: Math.floor(index / (numPlayers - 1)) % numPlayers
        }));

        setGames(freshGames);
        setPlayerCounts(createInitialPlayerCounts());
        setCurrentGame({ ...initialGameState });
      }
      setIsLoading(false);
    };

    loadStoredData();
  }, [listId, createInitialGames, createInitialPlayerCounts, numPlayers, totalGames]);

  // Helper function to revert points for a player
  const revertPlayerPoints = (
    originalGame: Game,
    points: { basePoints: number; totalPoints: number; defendersPoints?: number },
    playerStats: PlayerCount[]
  ): PlayerCount[] => {
    const updatedStats = [...playerStats];

    if (originalGame.won) {
      updatedStats[originalGame.player!].wonCount--;
      updatedStats[originalGame.player!].basePoints -= points.basePoints;
      updatedStats[originalGame.player!].totalPoints -= points.totalPoints;
    } else {
      updatedStats[originalGame.player!].lostCount--;
      // For lost games, we need to add back the points since they were negative
      updatedStats[originalGame.player!].basePoints += Math.abs(points.basePoints);
      updatedStats[originalGame.player!].totalPoints += Math.abs(points.totalPoints);

      // Remove defender points from other players
      for (let i = 0; i < numPlayers; i++) {
        if (i !== originalGame.player) {
          updatedStats[i].totalPoints -= points.defendersPoints || 0;
        }
      }
    }

    return updatedStats;
  };


  const applyPlayerPoints = (
    game: Game,
    points: { basePoints: number; totalPoints: number; defendersPoints?: number },
    playerStats: PlayerCount[]
  ): PlayerCount[] => {
    const updatedStats = [...playerStats];

    if (game.won) {
      updatedStats[game.player!].wonCount++;
      updatedStats[game.player!].basePoints += points.basePoints;
      updatedStats[game.player!].totalPoints += points.totalPoints;

      // Update lastUpdated for the won game
      setLastUpdated({
        playerId: game.player!,
        statType: 'wonCount'
      });
    } else {
      updatedStats[game.player!].lostCount++;
      // For lost games, we subtract the points
      updatedStats[game.player!].basePoints -= Math.abs(points.basePoints);
      updatedStats[game.player!].totalPoints -= Math.abs(points.totalPoints);

      // Add defender points to other players
      for (let i = 0; i < numPlayers; i++) {
        if (i !== game.player) {
          updatedStats[i].totalPoints += points.defendersPoints || 0;
        }
      }

      // Update lastUpdated for the lost game
      setLastUpdated({
        playerId: game.player!,
        statType: 'lostCount'
      });
    }

    return updatedStats;
  };

  // Handle game type selection
  const handleGameTypeSelect = useCallback((gameType: GameType) => {
    setCurrentGame(prev => ({
      ...prev,
      gameType,
      // Reset modifiers when game type changes
      hand: false,
      schneider: false,
      schwarz: false,
      ouvert: false,
      schneiderAnnounced: false,
      schwarzAnnounced: false
    }));
  }, []);


  const cancelEditing = useCallback(() => {
    if (editingGameBackup) {
      // Restore all games to non-editing state
      const updatedGames = games.map(game =>
        game.gameNumber === editingGameBackup.game.gameNumber
          ? { ...editingGameBackup.game, isEditing: false }
          : { ...game, isEditing: false }
      );

      setGames(updatedGames);
      setCurrentGame(editingGameBackup.currentGame);
      setPlayerCounts(editingGameBackup.playerCounts);
      setLastUpdated(editingGameBackup.lastUpdated); // Restore lastUpdated state
      setEditingGameBackup(null);
    }
  }, [editingGameBackup, games]);

  const startEditingGame = useCallback((gameNumber: number) => {
    const gameToEdit = games[gameNumber - 1];

    // Store backup of current state including lastUpdated
    setEditingGameBackup({
      game: { ...gameToEdit },
      currentGame: { ...currentGame },
      playerCounts: playerCounts.map(count => ({ ...count })),
      lastUpdated // Store lastUpdated in backup
    });

    // Mark game as being edited and set it as current
    const updatedGames = games.map(game => ({
      ...game,
      isEditing: game.gameNumber === gameNumber
    }));

    setGames(updatedGames);
    setCurrentGame({ ...gameToEdit, isEditing: true });
  }, [games, currentGame, playerCounts, lastUpdated]);

  const handleGameComplete = useCallback(async (): Promise<void> => {
    if (!currentGame.played && currentGame.gameType !== 'eingepasst') return;

    const gameIndex = currentGame.gameNumber - 1;
    let newGames = [...games];
    let newPlayerCounts = [...playerCounts];

    // If we're editing, first revert the original game's points
    if (currentGame.isEditing && editingGameBackup) {
      const originalGame = editingGameBackup.game;
      if (originalGame.player !== null && originalGame.gameType !== 'eingepasst') {
        const originalPoints = calculatePoints(originalGame);
        newPlayerCounts = revertPlayerPoints(originalGame, originalPoints, newPlayerCounts);
      }
    }

    // For eingepasst games, clear any highlighting
    if (currentGame.gameType === 'eingepasst') {
      setLastUpdated(null);
    }
    // Apply the new/updated game points for non-eingepasst games
    else if (currentGame.player !== null) {
      const points = calculatePoints(currentGame);
      newPlayerCounts = applyPlayerPoints(currentGame, points, newPlayerCounts);

      // Update API if seriesId exists
      if (seriesId) {
        try {
          // Update current player's points
          await updatePlayerPoints({
            playerId: currentGame.player,
            seriesId,
            tischId: tischId || undefined,
            totalPoints: newPlayerCounts[currentGame.player].totalPoints,
            wonGames: newPlayerCounts[currentGame.player].wonCount,
            lostGames: newPlayerCounts[currentGame.player].lostCount
          });

          // Update other players' points if game was lost
          if (!currentGame.won) {
            for (let i = 0; i < numPlayers; i++) {
              if (i !== currentGame.player) {
                await updatePlayerPoints({
                  playerId: i,
                  seriesId,
                  tischId: tischId || undefined,
                  totalPoints: newPlayerCounts[i].totalPoints,
                  wonGames: newPlayerCounts[i].wonCount,
                  lostGames: newPlayerCounts[i].lostCount
                });
              }
            }
          }
        } catch (error) {
          console.error('Error updating player points:', error);
        }
      }

      // Update storage if listId exists
      // Update storage if listId exists
      if (listId) {
        try {
          const gameToStore = {
            ...currentGame,
            played: true,
            isEditing: false
          };

          // Check if this is the last game in the list
          const isLastGame = games.filter(g => g.played).length === totalGames - 1;

          // Update the game in the list
          await StorageManager.updateGameInList(
            listId,
            gameToStore,
            newPlayerCounts,
            isLastGame ? 'completed' : 'in_progress'
          );
        } catch (error) {
          console.error('Error updating stored list:', error);
        }
      }
    }

    // Update the completed game in the games array
    newGames[gameIndex] = {
      ...currentGame,
      played: true,
      isEditing: false
    };

    // After completing the edit, restore normal state or move to next game
    if (currentGame.isEditing && editingGameBackup) {
      setCurrentGame({
        ...editingGameBackup.currentGame,
        isEditing: false
      });
      setEditingGameBackup(null);
    } else {
      // Move to next game
      const nextGameNumber = currentGame.gameNumber + 1;
      if (nextGameNumber <= totalGames) {
        setCurrentGame({
          ...initialGameState,
          gameNumber: nextGameNumber,
          dealer: (currentGame.dealer + 1) % numPlayers
        });
      }
    }

    setGames(newGames);
    setPlayerCounts(newPlayerCounts);
  }, [currentGame, games, playerCounts, editingGameBackup, numPlayers, totalGames, seriesId, tischId, initialGameState, listId]);

  return {
    currentGame,
    setCurrentGame,
    games,
    playerCounts,
    handleGameComplete,
    handleGameTypeSelect,
    startEditingGame,
    cancelEditing,
    isEditing: !!currentGame.isEditing,
    isLoading,
    lastUpdated
  };
};