"use client";

import React from 'react';
import { useGameState } from '../hooks/useGameState';
import { GameHeader, PlayersList, GamesList, GameControls } from './game';


const SkatListDisplay: React.FC<{
  numPlayers?: number;
  players?: string[];
  totalGames?: number;
  seriesId?: string | null;
  tischId?: string | null;
}> = ({
  numPlayers = 4,
  players = [],
  totalGames = 48,
  seriesId = null,
  tischId = null
}) => {
    const displayPlayers = players.length > 0 ? players : Array(numPlayers).fill('');

    const {
      currentGame,
      setCurrentGame,
      games,
      playerCounts,
      handleGameTypeSelect,
      handleGameComplete
    } = useGameState({
      numPlayers,
      totalGames,
      seriesId,
      tischId
    });

    return (
      <div className="flex flex-col min-h-screen max-w-screen overflow-x-hidden bg-gray-50">
        <GameHeader seriesId={seriesId} tischId={tischId} />
        <PlayersList players={displayPlayers} playerCounts={playerCounts} />
        <GamesList games={games} />
        <GameControls
          currentGame={currentGame}
          setCurrentGame={setCurrentGame}
          handleGameComplete={handleGameComplete}
          handleGameTypeSelect={handleGameTypeSelect}
          displayPlayers={displayPlayers}
        />
      </div>
    );
  };

export default SkatListDisplay;