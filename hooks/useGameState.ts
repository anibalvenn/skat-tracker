// src/hooks/useGameState.ts
import { useState } from 'react';
import { Game, PlayerCount } from '../types';
import { calculatePoints } from '../utils/skatScoring';
import { updatePlayerPoints } from '../services/skatApi';

interface GameStateProps {
  numPlayers: number;
  totalGames: number;
  seriesId: string | null;
  tischId: string | null;
}

export const useGameState = ({
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
    won: true,
    mitOhne: 'mit',
    multiplier: 1
  };

  const [currentGame, setCurrentGame] = useState<Game>(initialGameState);
  const [games, setGames] = useState<Game[]>(
    Array(totalGames).fill(null).map((_, index) => ({
      ...initialGameState,
      gameNumber: index + 1,
      played: false
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

  const handleGameComplete = async (): Promise<void> => {
    if (!currentGame.played && currentGame.gameType !== 'eingepasst') return;

    const gameIndex = currentGame.gameNumber - 1;
    const newGames = [...games];
    const newPlayerCounts = [...playerCounts];

    // Update the completed game in the games array
    newGames[gameIndex] = {
      ...currentGame,
      played: true
    };

    // Calculate points if applicable
    if (currentGame.player !== null && currentGame.gameType !== 'eingepasst') {
      const { basePoints, totalPoints, defendersPoints } = calculatePoints(currentGame);

      // Update playing player's statistics
      const playerStats = newPlayerCounts[currentGame.player];
      if (currentGame.won) {
        playerStats.wonCount += 1;
        playerStats.basePoints += basePoints;
        playerStats.totalPoints += totalPoints;
      } else {
        playerStats.lostCount += 1;
        playerStats.basePoints += basePoints;
        playerStats.totalPoints += totalPoints;

        // When game is lost, update defenders' points
        // All players except the one who lost get defender bonus
        for (let i = 0; i < numPlayers; i++) {
          if (i !== currentGame.player) {
            newPlayerCounts[i].totalPoints += defendersPoints;
          }
        }
      }

      // Update API if seriesId exists
      if (seriesId) {
        try {
          // Update playing player's points
          await updatePlayerPoints({
            playerId: currentGame.player,
            seriesId,
            tischId: tischId || undefined,
            totalPoints: playerStats.totalPoints,
            wonGames: playerStats.wonCount,
            lostGames: playerStats.lostCount
          });

          // If game was lost, update defenders' points
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

    // Update state
    setGames(newGames);
    setPlayerCounts(newPlayerCounts);

    // Move to next game
    const nextGameNumber = currentGame.gameNumber + 1;
    if (nextGameNumber <= totalGames) {
      setCurrentGame({
        ...initialGameState,
        gameNumber: nextGameNumber,
        dealer: (currentGame.dealer + 1) % numPlayers
      });
    }
  };

  const handleGameTypeSelect = (gameType: Game['gameType']) => {
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
  };

  return {
    currentGame,
    setCurrentGame,
    games,
    playerCounts,
    handleGameComplete,
    handleGameTypeSelect
  };
};