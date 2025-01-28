import React, { useState, useEffect } from 'react';
import { Game, GameType } from '@/types/index';
import PlayerName from '../style/PlayerName';

interface FourPlayerSelectionProps {
  currentGame: Game;
  setCurrentGame: React.Dispatch<React.SetStateAction<Game>>;
  handleGameComplete: () => Promise<void>;
  displayPlayers: string[];
}

export const FourPlayerSelection: React.FC<FourPlayerSelectionProps> = ({
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
        className={`p-3 h-12 w-full rounded text-sm flex items-center justify-center
                   ${index === 0 ? 'bg-blue-50 text-blue-800' : 
                     index === 1 ? 'bg-green-50 text-green-800' : 
                     index === 2 ? 'bg-yellow-50 text-yellow-800' :
                     'bg-orange-50 text-orange-800'}
                   hover:opacity-90 active:opacity-80`}
      >
        {player || `Player ${index + 1}`}
      </button>
    );
  })}
  
  <button
    onClick={handleEingepasst}
    className="p-3 h-12 w-full bg-gray-100 rounded text-sm hover:bg-gray-200 
               active:bg-gray-300 text-gray-800"
  >
    Eingepasst
  </button>
</div>
  );
};