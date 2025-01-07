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
    won: false,
    mitOhne: 'mit',
    multiplier: 1
  };

  const [currentGame, setCurrentGame] = useState<Game>(initialGameState);
  const [games, setGames] = useState<Game[]>(
    Array(totalGames).fill(null).map(() => ({
      ...initialGameState,
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
    if (!currentGame.played) return;

    const gameIndex = currentGame.gameNumber - 1;
    const newGames = [...games];
    const newPlayerCounts = [...playerCounts];

    // Update the completed game in the games array
    newGames[gameIndex] = currentGame;

    // Calculate points if applicable
    if (currentGame.player !== null && currentGame.gameType !== 'eingepasst') {
      const { basePoints, totalPoints } = calculatePoints(currentGame);

      // Update player statistics
      const playerStats = newPlayerCounts[currentGame.player];
      if (currentGame.won) {
        playerStats.wonCount += 1;
      } else {
        playerStats.lostCount += 1;
      }

      // Update points
      playerStats.basePoints += basePoints;
      playerStats.totalPoints += totalPoints;

      // Update API if seriesId exists
      if (seriesId) {
        await updatePlayerPoints({
          playerId: currentGame.player,
          seriesId,
          tischId: tischId || undefined,
          totalPoints: playerStats.totalPoints,
          wonGames: playerStats.wonCount,
          lostGames: playerStats.lostCount
        });
      }
    }

    // Update state
    setGames(newGames);
    setPlayerCounts(newPlayerCounts);

    // Reset for next game
    setCurrentGame({
      ...initialGameState,
      gameNumber: currentGame.gameNumber + 1,
      dealer: (currentGame.dealer + 1) % numPlayers
    });
  };

  return {
    currentGame,
    setCurrentGame,
    games,
    playerCounts,
    handleGameComplete
  };
};