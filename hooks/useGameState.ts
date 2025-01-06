// src/hooks/useGameState.ts
import { useState } from 'react';
import { Game, PlayerCount } from '../types/index';
import { calculatePoints } from '../utils/skatScoring';
import { updatePlayerPoints } from '../services/skatApi';

interface GameStateProps {
  numPlayers: number;
  totalGames: number;
  seriesId: string | null;
  tischId: string | null;
}

interface GameState {
  currentGame: Game;
  setCurrentGame: React.Dispatch<React.SetStateAction<Game>>;
  games: Game[];
  playerCounts: PlayerCount[];
  handleGameComplete: () => Promise<void>;
}

export const useGameState = ({
  numPlayers,
  totalGames,
  seriesId,
  tischId
}: GameStateProps): GameState => {
  const [currentGame, setCurrentGame] = useState<Game>({
    gameNumber: 1,
    dealer: 0,
    player: null,
    gameType: '',
    hand: false,
    schneider: false,
    schwarz: false,
    played: false,
    won: false
  });

  const [games, setGames] = useState<Game[]>(
    Array(totalGames).fill(null).map(() => ({
      won: null,
      lost: null,
      gameType: '',
      hand: false,
      schneider: false,
      schwarz: false,
      points: 0,
      played: false
    } as unknown as Game))
  );

  const [playerCounts, setPlayerCounts] = useState<PlayerCount[]>(
    Array(numPlayers).fill(null).map(() => ({
      wonCount: 0,
      lostCount: 0,
      points: 0
    }))
  );

  const handleGameComplete = async (): Promise<void> => {
    if (!currentGame.player && currentGame.gameType !== 'eingepasst') return;

    const gameIndex = currentGame.gameNumber - 1;
    const newGames = [...games];
    const newPlayerCounts = [...playerCounts];

    if (currentGame.gameType !== 'eingepasst' && currentGame.player !== null) {
      const points = calculatePoints(currentGame);
      newPlayerCounts[currentGame.player].points += points;
      newPlayerCounts[currentGame.player].wonCount += 1;

      newGames[gameIndex] = {
        ...currentGame,
        points,
        played: true
      };

      if (seriesId) {
        await updatePlayerPoints({
          playerId: currentGame.player,
          seriesId,
          tischId: tischId || undefined,
          totalPoints: newPlayerCounts[currentGame.player].points,
          wonGames: newPlayerCounts[currentGame.player].wonCount,
          lostGames: newPlayerCounts[currentGame.player].lostCount
        });
      }
    }

    setGames(newGames);
    setPlayerCounts(newPlayerCounts);
    
    setCurrentGame({
      gameNumber: currentGame.gameNumber + 1,
      dealer: (currentGame.dealer + 1) % numPlayers,
      player: null,
      gameType: '',
      hand: false,
      schneider: false,
      schwarz: false,
      played: false,
      won: false
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