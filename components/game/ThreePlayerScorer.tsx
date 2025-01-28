import { useThreePlayerGameState } from 'hooks/useThreePlayerGameState';
import React from 'react';
import { GameControls } from './GameControls';
import { GameHeader } from './GameHeader';
import ScrollableGamesList from './ScrollableGamesList';
import { ThreePlayersList } from './ThreePlayersList';

interface ThreePlayerScorerProps {
  players: string[];
  totalGames?: number;
  seriesId?: string | null;
  tischId?: string | null;
}

const ThreePlayerScorer: React.FC<ThreePlayerScorerProps> = ({
  players,
  totalGames = 36,
  seriesId = null,
  tischId = null
}) => {
  const displayPlayers = players.length > 0 ? players : Array(3).fill('');

  const {
    currentGame,
    setCurrentGame,
    games,
    playerCounts,
    handleGameTypeSelect,
    handleGameComplete,
    startEditingGame,
    cancelEditing,
    isEditing
  } = useThreePlayerGameState({
    numPlayers: 3,
    totalGames,
    seriesId,
    tischId
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Fixed Header Section */}
      <div className="flex-none bg-white border-b">
        <GameHeader seriesId={seriesId} tischId={tischId} />
        <div className="px-2 py-1">
          <ThreePlayersList 
            players={displayPlayers} 
            playerCounts={playerCounts}
            currentDealer={currentGame.dealer}
          />
        </div>
      </div>
      
      {/* Scrollable Games List */}
      <div className="flex-1 overflow-hidden">
        <ScrollableGamesList 
          games={games}
          currentGame={currentGame}
          displayPlayers={displayPlayers}
          onEditGame={startEditingGame}
          isThreePlayerMode={true}
          onCancelEdit={cancelEditing}  // Pass it here
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
          isThreePlayerMode={true}
        />
      </div>
    </div>
  );
};

export default ThreePlayerScorer;