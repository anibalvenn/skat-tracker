import React, { useEffect } from 'react';
import { Plus, Minus, ThumbsUp, ThumbsDown, ArrowLeft } from 'lucide-react';

interface Game {
  gameNumber: number;
  dealer: number;
  player: number | null;
  gameType: string;
  hand: boolean;
  schneider: boolean;
  schwarz: boolean;
  played: boolean;
  won: boolean;
  points?: number;
  mitOhne?: 'mit' | 'ohne';
  multiplier?: number;
}

interface MitOhneSelectionProps {
  currentGame: Game;
  setCurrentGame: React.Dispatch<React.SetStateAction<Game>>;
  handleGameComplete: () => Promise<void>;
  onBack: () => void;
}

export const MitOhneSelection: React.FC<MitOhneSelectionProps> = ({
  currentGame,
  setCurrentGame,
  handleGameComplete,
  onBack,
}) => {
  useEffect(() => {
    if (currentGame.played) {
      handleGameComplete();
    }
  }, [currentGame.played, handleGameComplete]);

  const handleIncrement = () => {
    setCurrentGame(prev => ({
      ...prev,
      multiplier: (prev.multiplier || 1) + 1
    }));
  };

  const handleDecrement = () => {
    setCurrentGame(prev => ({
      ...prev,
      multiplier: Math.max((prev.multiplier || 1) - 1, 1)
    }));
  };

  const handleWinLoss = (won: boolean) => {
    setCurrentGame(prev => ({ 
      ...prev, 
      won,
      played: true
    }));
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-start items-center gap-1">
        <button
          onClick={() => setCurrentGame(prev => ({ ...prev, mitOhne: 'mit' }))}
          className={`w-16 h-8 rounded text-center ${
            currentGame.mitOhne === 'mit' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300'
          }`}
        >
          Mit
        </button>

        <button
          onClick={() => setCurrentGame(prev => ({ ...prev, mitOhne: 'ohne' }))}
          className={`w-16 h-8 rounded text-center ${
            currentGame.mitOhne === 'ohne'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300'
          }`}
        >
          Ohne
        </button>

        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={handleDecrement}
            className="p-1 rounded bg-gray-100 hover:bg-gray-200 active:bg-gray-300"
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <div className="w-8 text-center text-lg font-semibold">
            {currentGame.multiplier || 1}
          </div>

          <button
            onClick={handleIncrement}
            className="p-1 rounded bg-gray-100 hover:bg-gray-200 active:bg-gray-300"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => handleWinLoss(false)}
            className="w-full py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 active:bg-red-700 flex items-center justify-center gap-2"
          >
            <ThumbsDown className="w-4 h-4" />
            Lost
          </button>
          <button
            onClick={() => handleWinLoss(true)}
            className="w-full py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 active:bg-green-700 flex items-center justify-center gap-2"
          >
            Won
            <ThumbsUp className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onBack}
          className="w-full py-2 bg-black text-white rounded text-sm hover:bg-gray-800 active:bg-gray-700 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );
};