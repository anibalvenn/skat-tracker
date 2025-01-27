// src/hooks/useFourPlayerGameState.ts
import { useState, useCallback } from 'react';
import { Game, PlayerCount, GameType } from '../types';
import { calculateFourPlayerPoints } from '../utils/fourPlayerScoring';
import { updatePlayerPoints } from '../services/skatApi';

interface GameStateProps {
  numPlayers: number;
  totalGames: number;
  seriesId: string | null;
  tischId: string | null;
}

export const useFourPlayerGameState = ({
  numPlayers,
  totalGames,
  seriesId,
  tischId
}: GameStateProps) => {
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

  const [currentGame, setCurrentGame] = useState<Game>(initialGameState);
  const [games, setGames] = useState<Game[]>(
    Array(totalGames).fill(null).map((_, index) => ({
      ...initialGameState,
      gameNumber: index + 1,
      dealer: Math.floor(index / (numPlayers - 1)) % numPlayers
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
  } | null>(null);

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
      updatedStats[originalGame.player!].basePoints += Math.abs(points.basePoints);
      updatedStats[originalGame.player!].totalPoints += Math.abs(points.totalPoints);

      // Remove defender points from all non-playing players (including dealer)
      for (let i = 0; i < numPlayers; i++) {
        if (i !== originalGame.player) {
          updatedStats[i].totalPoints -= points.defendersPoints || 0;
        }
      }
    }
    
    return updatedStats;
  };

  // Helper function to apply points for a player
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
    } else {
      updatedStats[game.player!].lostCount++;
      updatedStats[game.player!].basePoints -= Math.abs(points.basePoints);
      updatedStats[game.player!].totalPoints -= Math.abs(points.totalPoints);

      // Add defender points to all non-playing players (including dealer)
      for (let i = 0; i < numPlayers; i++) {
        if (i !== game.player) {
          updatedStats[i].totalPoints += points.defendersPoints || 0;
        }
      }
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
        const originalPoints = calculateFourPlayerPoints(originalGame);
        newPlayerCounts = revertPlayerPoints(originalGame, originalPoints, newPlayerCounts);
      }
    }

    // Apply new/updated game points
    if (currentGame.player !== null && currentGame.gameType !== 'eingepasst') {
      const points = calculateFourPlayerPoints(currentGame);
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
              if (i !== currentGame.player && i !== currentGame.dealer) {
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

    // Update games array
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
      playerCounts: playerCounts.map(count => ({ ...count }))
    });
    
    const updatedGames = games.map(game => ({
      ...game,
      isEditing: game.gameNumber === gameNumber
    }));

    setGames(updatedGames);
    setCurrentGame({ ...gameToEdit, isEditing: true });
  }, [games, currentGame, playerCounts]);

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
    isEditing: !!currentGame.isEditing
  };
};