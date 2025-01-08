import React, { useEffect, useState } from 'react';
import { Plus, Minus, ThumbsUp, ThumbsDown, ArrowLeft } from 'lucide-react';
import { Game } from '@/types/index';
import { calculatePoints } from '@/utils/skatScoring';

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
  const [shouldComplete, setShouldComplete] = useState(false);
  
  // Calculate game points using the existing scoring function
  const points = calculatePoints({
    ...currentGame,
    played: true // Ensure played is true to get point calculation
  });

  useEffect(() => {
    const completeGame = async () => {
      if (shouldComplete && currentGame.played) {
        console.log('Completing game with updated state:', currentGame);
        try {
          await handleGameComplete();
        } catch (error) {
          console.error('Error completing game:', error);
        }
        setShouldComplete(false);
      }
    };
    
    completeGame();
  }, [shouldComplete, currentGame.played, handleGameComplete, currentGame]);

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

  const handleWinLoss = async (won: boolean) => {
    console.log('Before setCurrentGame - played:', currentGame.played);
    
    setCurrentGame(prev => {
      console.log('Inside setCurrentGame - prev played:', prev.played);
      const newState = { 
        ...prev, 
        won,
        played: true,
        points: points.totalPoints
      };
      console.log('Inside setCurrentGame - new played:', newState.played);
      return newState;
    });
    
    // Set flag to trigger game completion after state update
    setShouldComplete(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
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
          </div>

          <div className="flex items-center gap-1">
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

        <div className="text-center p-2 bg-gray-50 rounded">
          <span className="text-sm text-gray-600">Game Value:</span>
          <div className="text-2xl font-bold">{points.basePoints}</div>
          <div className="text-xs text-gray-500">
            Total with bonus/penalty: {points.totalPoints}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleWinLoss(false)}
          className="py-3 bg-red-500 text-white rounded text-sm hover:bg-red-600 active:bg-red-700 flex items-center justify-center gap-2"
        >
          <ThumbsDown className="w-4 h-4" />
          Lost
        </button>
        <button
          onClick={() => handleWinLoss(true)}
          className="py-3 bg-green-500 text-white rounded text-sm hover:bg-green-600 active:bg-green-700 flex items-center justify-center gap-2"
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
  );
};