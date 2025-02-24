"use client"
import React from 'react';
import { useGameState } from '../hooks/useGameState';
import { GameHeader, PlayersList, GameControls } from './game';
import ScrollableGamesList from './game/ScrollableGamesList';
import { ThreePlayersList } from './game/ThreePlayersList';

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
    const isThreePlayerMode = numPlayers === 3;

    const {
      currentGame,
      setCurrentGame,
      games,
      playerCounts,
      handleGameTypeSelect,
      handleGameComplete,
      startEditingGame,
      cancelEditing,
      isEditing,
      lastUpdated
    } = useGameState({
      numPlayers,
      totalGames,
      seriesId,
      tischId
    });

    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Fixed Header Section */}
        <div className="flex-none bg-white border-b">
          <GameHeader seriesId={seriesId} tischId={tischId} listId={0} totalGames={totalGames} playedGames={games.filter(g => g.played).length} date={new Date().toISOString()} />
          <div className="px-2 py-1">
            {isThreePlayerMode ? (
              <ThreePlayersList
                players={displayPlayers}
                playerCounts={playerCounts}
                currentDealer={currentGame.dealer}
                lastUpdated={lastUpdated}
              />
            ) : (
              <PlayersList
                players={displayPlayers}
                playerCounts={playerCounts}
                currentDealer={currentGame.dealer}
                lastUpdated={lastUpdated}
              />
            )}
          </div>
        </div>

        {/* Scrollable Games List with Safe Areas */}
        <div className="flex-1 overflow-hidden">
          <ScrollableGamesList 
            games={games}
            currentGame={currentGame}
            displayPlayers={displayPlayers}
            onEditGame={startEditingGame}
            onCancelEdit={cancelEditing}
            isThreePlayerMode={isThreePlayerMode}
          />
        </div>

        {/* Fixed Footer Section */}
        <div className="flex-none bg-white border-t">
          <GameControls
            currentGame={currentGame}
            setCurrentGame={setCurrentGame}
            handleGameComplete={handleGameComplete}
            handleGameTypeSelect={handleGameTypeSelect}
            displayPlayers={displayPlayers}
            isEditing={isEditing}
            onCancelEdit={cancelEditing}
            isThreePlayerMode={isThreePlayerMode}
          />
        </div>
      </div>
    );
  };

export default SkatListDisplay;