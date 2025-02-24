import React, { useEffect, useState } from 'react';
import { GameHeader } from '../game/GameHeader';
import { PlayersList } from '../game/PlayersList';
import { GameControls } from '../game/GameControls';
import ScrollableGamesList from '../game/ScrollableGamesList';
import { useGameState } from 'hooks/useGameState';
import { StorageManager, StoredList } from '@/utils/storage';

interface FourPlayerListProps {
  players: string[];
  numPlayers: number;
  totalGames: number;
  seriesId?: string | null;
  tischId?: string | null;
  listId?: number;
}

const FourPlayerList: React.FC<FourPlayerListProps> = ({
  players,
  numPlayers,
  totalGames,
  seriesId = null,
  tischId = null,
  listId
}) => {
  const [currentList, setCurrentList] = useState<StoredList | null>(null);
  const displayPlayers = players.length > 0 ? players : Array(numPlayers).fill('');

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
  } = useGameState({
    numPlayers,
    totalGames,
    seriesId,
    tischId,
    listId
  });

  useEffect(() => {
    const loadCurrentList = async () => {
      const list = await StorageManager.getCurrentList();
      setCurrentList(list);
    };
    loadCurrentList();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Fixed Header Section */}
      <div className="flex-none bg-white border-b">
        <GameHeader
          seriesId={seriesId}
          tischId={tischId}
          listId={currentList?.id || 0}
          totalGames={totalGames}
          playedGames={games.filter(g => g.played).length}
          date={currentList?.date || new Date().toISOString()}
        />
        <div className="px-2 py-1">
          <PlayersList
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
          isThreePlayerMode={false}
          onCancelEdit={cancelEditing}
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
          isThreePlayerMode={false}
        />
      </div>
    </div>
  );
};

export default FourPlayerList;