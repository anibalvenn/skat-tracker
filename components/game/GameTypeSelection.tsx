// components/game/GameTypeSelection.tsx
import { Game, GameType } from '@/types/index';
import React from 'react';

interface GameTypeSelectionProps {
  currentGame: Game;
  setCurrentGame: React.Dispatch<React.SetStateAction<Game>>;
}

export const GameTypeSelection: React.FC<GameTypeSelectionProps> = ({ 
  currentGame,
  setCurrentGame
}) => {
  const handleTypeSelect = (type: GameType) => {
    setCurrentGame(prev => ({
      ...prev,
      gameType: type
    }));
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {['♣', '♠', '♥', '♦', 'G', 'N'].map((type) => (
        <button
          key={type}
          onClick={() => handleTypeSelect(type as GameType)}
          className={`p-2 text-xl rounded ${
            (type === '♥' || type === '♦') 
              ? 'bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600' 
              : 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300'
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
}