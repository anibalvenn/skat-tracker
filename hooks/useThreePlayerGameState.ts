import { useState, useCallback } from 'react';
import { Game, PlayerCount, GameType } from '../types';
import { updatePlayerPoints } from '../services/skatApi';
import { calculateThreePlayerPoints } from '@/utils/threePlayerScoring';

interface GameStateProps {
  numPlayers: number;
  totalGames: number;
  seriesId: string | null;
  tischId: string | null;
}

export const useThreePlayerGameState = ({
  numPlayers,
  totalGames,
  seriesId,
  tischId
}: GameStateProps) => {
  // Initial game state with three-player specific defaults
  const initialGameState: Game = {
    gameNumber: 1,
    dealer: 0,
    player: null,  // In 3-player mode, dealer can play
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

  const [currentGame, setCurrentGame] = useState<Game>(initialGameState);
  const [games, setGames] = useState<Game[]>(
    Array(totalGames).fill(null).map((_, index) => ({
      ...initialGameState,
      gameNumber: index + 1,
      dealer: index % numPlayers  // Simple rotation for 3 players
    }))
  );
  const [playerCounts, setPlayerCounts] = useState<PlayerCount[]>(
    Array(numPlayers).fill(null).map(() => ({
      wonCount: 0,
      lostCount: 0,
      basePoints: 0,
      totalPoints: 0
    }))
  );
  const [editingGameBackup, setEditingGameBackup] = useState<{
    game: Game;
    currentGame: Game;
    playerCounts: PlayerCount[];
    lastUpdated: {
      playerId: number;
      statType: 'wonCount' | 'lostCount';
    } | null;
  } | null>(null);
  
  // Add state for tracking last updated player and stat
  const [lastUpdated, setLastUpdated] = useState<{
    playerId: number;
    statType: 'wonCount' | 'lostCount';
  } | null>(null);

  // Helper function to revert points for a player in 3-player mode
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

      // Remove defender points (40 in 3-player mode) from other players
      for (let i = 0; i < numPlayers; i++) {
        if (i !== originalGame.player) {
          updatedStats[i].totalPoints -= points.defendersPoints || 0;
        }
      }
    }
    
    return updatedStats;
  };

  // Helper function to apply points for a player in 3-player mode
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
      updatedStats[game.player!].basePoints -= Math.abs(points.basePoints);
      updatedStats[game.player!].totalPoints -= Math.abs(points.totalPoints);

      // Add defender points (40 in 3-player mode) to other players
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

  const handleGameComplete = useCallback(async () => {
    if (!currentGame.played && currentGame.gameType !== 'eingepasst') return;

    const gameIndex = currentGame.gameNumber - 1;
    let newGames = [...games];
    let newPlayerCounts = [...playerCounts];

    // If editing, revert original game's points
    if (currentGame.isEditing && editingGameBackup) {
      const originalGame = editingGameBackup.game;
      if (originalGame.player !== null && originalGame.gameType !== 'eingepasst') {
        const originalPoints = calculateThreePlayerPoints(originalGame);
        newPlayerCounts = revertPlayerPoints(originalGame, originalPoints, newPlayerCounts);
      }
    }

    // For eingepasst games, clear any highlighting
    if (currentGame.gameType === 'eingepasst') {
      setLastUpdated(null);
    } 
    // Apply new/updated game points for non-eingepasst games
    else if (currentGame.player !== null) {
      const points = calculateThreePlayerPoints(currentGame);
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
    }

    // Update games array and handle state transitions
    newGames[gameIndex] = {
      ...currentGame,
      played: true,
      isEditing: false
    };

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
  }, [currentGame, games, playerCounts, editingGameBackup, numPlayers, totalGames, seriesId, tischId, initialGameState]);

  const handleGameTypeSelect = useCallback((gameType: GameType) => {
    setCurrentGame(prev => ({
      ...prev,
      gameType,
      hand: false,
      schneider: false,
      schwarz: false,
      ouvert: false,
      schneiderAnnounced: false,
      schwarzAnnounced: false
    }));
  }, []);

  const startEditingGame = useCallback((gameNumber: number) => {
    const gameToEdit = games[gameNumber - 1];
    setEditingGameBackup({
      game: { ...gameToEdit },
      currentGame: { ...currentGame },
      playerCounts: playerCounts.map(count => ({ ...count })),
      lastUpdated
    });
    
    const updatedGames = games.map(game => ({
      ...game,
      isEditing: game.gameNumber === gameNumber
    }));

    setGames(updatedGames);
    setCurrentGame({ ...gameToEdit, isEditing: true });
  }, [games, currentGame, playerCounts, lastUpdated]);

  const cancelEditing = useCallback(() => {
    if (editingGameBackup) {
      const updatedGames = games.map(game =>
        game.gameNumber === editingGameBackup.game.gameNumber
          ? { ...editingGameBackup.game, isEditing: false }
          : { ...game, isEditing: false }
      );

      setGames(updatedGames);
      setCurrentGame(editingGameBackup.currentGame);
      setPlayerCounts(editingGameBackup.playerCounts);
      setLastUpdated(editingGameBackup.lastUpdated);
      setEditingGameBackup(null);
    }
  }, [editingGameBackup, games]);

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
    lastUpdated
  };
};