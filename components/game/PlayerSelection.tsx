import { Game, GameType } from '@/types/index';
import React, { useState, useEffect } from 'react';

interface PlayerSelectionProps {
  currentGame: Game;
  setCurrentGame: React.Dispatch<React.SetStateAction<Game>>;
  handleGameComplete: () => Promise<void>;
  displayPlayers: string[];
}

export const PlayerSelection: React.FC<PlayerSelectionProps> = ({
  currentGame,
  setCurrentGame,
  handleGameComplete,
  displayPlayers
}) => {
  const [shouldComplete, setShouldComplete] = useState(false);

  useEffect(() => {
    const completeGame = async () => {
      if (shouldComplete && currentGame.played) {
        try {
          await handleGameComplete();
        } catch (error) {
          console.error('Error completing game:', error);
        }
        setShouldComplete(false);
      }
    };
    
    completeGame();
  }, [shouldComplete, currentGame.played, handleGameComplete]);

  const handleEingepasst = () => {
    setCurrentGame(prev => ({
      ...prev,
      gameType: 'eingepasst' as GameType,
      played: true
    }));
    setShouldComplete(true);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {displayPlayers.map((player, index) => {
        if (index === currentGame.dealer) return null;
        return (
          <button
            key={index}
            onClick={() => setCurrentGame(prev => ({
              ...prev,
              player: index
            }))}
            className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 active:bg-gray-300"
          >
            {player || `Player ${index + 1}`}
          </button>
        );
      })}
      <button
        onClick={handleEingepasst}
        className="p-2 bg-yellow-50 rounded text-sm hover:bg-yellow-100 active:bg-yellow-200 text-yellow-800 border border-yellow-200"
      >
        Eingepasst
      </button>
    </div>
  );
};