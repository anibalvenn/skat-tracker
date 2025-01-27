import { Game, GameType } from '@/types/index';
import React, { useState, useEffect } from 'react';
import PlayerName from '../style/PlayerName';

interface ThreePlayerSelectionProps {
  currentGame: Game;
  setCurrentGame: React.Dispatch<React.SetStateAction<Game>>;
  handleGameComplete: () => Promise<void>;
  displayPlayers: string[];
}

export const ThreePlayerSelection: React.FC<ThreePlayerSelectionProps> = ({
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
    <div className="grid grid-cols-1 gap-2">
      {displayPlayers.map((player, index) => (
        <button
          key={index}
          onClick={() => setCurrentGame(prev => ({
            ...prev,
            player: index
          }))}
          className="p-3 rounded text-sm flex items-center justify-center hover:opacity-80 active:opacity-70"
        >
          <PlayerName 
            name={player} 
            index={index} 
            isDealer={index === currentGame.dealer}
          />
        </button>
      ))}
      
      <button
        onClick={handleEingepasst}
        className="p-3 bg-yellow-50 rounded text-sm hover:bg-yellow-100 
                 active:bg-yellow-200 text-yellow-800 border border-yellow-200"
      >
        Eingepasst
      </button>
    </div>
  );
};