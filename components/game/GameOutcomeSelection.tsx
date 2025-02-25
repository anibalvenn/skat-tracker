import React, { useState, useEffect } from "react";
import { Game } from "@/types/index";
import { calculatePoints } from "@/utils/skatScoring";
import { calculateThreePlayerPoints } from "@/utils/threePlayerScoring";
import { ThumbsDown, ThumbsUp, ArrowLeft } from "lucide-react";

interface GameOutcomeSelectionProps {
  currentGame: Game;
  setCurrentGame: React.Dispatch<React.SetStateAction<Game>>;
  handleGameComplete: () => Promise<void>;
  onBack: () => void;
  isThreePlayerMode?: boolean;
  totalGames?: number;
  playedGames?: number;
}

export const GameOutcomeSelection: React.FC<GameOutcomeSelectionProps> = ({
  currentGame,
  setCurrentGame,
  handleGameComplete,
  onBack,
  isThreePlayerMode = false,
  totalGames,
  playedGames
}) => {
  const [shouldComplete, setShouldComplete] = useState(false);
  const [isLastGame, setIsLastGame] = useState(false);

  // Check if this is the last game in the list
  useEffect(() => {
    if (totalGames && playedGames) {
      setIsLastGame(playedGames === totalGames - 1);
    }
  }, [totalGames, playedGames]);

  // Calculate game points using the appropriate scoring function
  const points = isThreePlayerMode
    ? calculateThreePlayerPoints({
      ...currentGame,
      played: true,
      won: true
    })
    : calculatePoints({
      ...currentGame,
      played: true,
      won: true
    });

  useEffect(() => {
    const completeGame = async () => {
      if (shouldComplete) {
        try {
          await handleGameComplete();
        } catch (error) {
          console.error('Error completing game:', error);
        }
        setShouldComplete(false);
      }
    };

    completeGame();
  }, [shouldComplete, handleGameComplete]);

  const handleWinLoss = async (won: boolean) => {
    setCurrentGame(prev => ({
      ...prev,
      won,
      played: true,
      points: points.totalPoints
    }));

    setShouldComplete(true);
  };

  return (
    <div className="space-y-4">
      {/* Points Display */}
      <div className="p-2 bg-gray-50 rounded">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Game Value:</span>
          <span className="text-xl font-bold">{points.basePoints}</span>
        </div>

        {isThreePlayerMode && (
          <div className="text-xs text-gray-500 text-right mt-1">
            Defender bonus: {points.defendersPoints} each
          </div>
        )}
        
        {isLastGame && !currentGame.played && (
          <div className="text-xs text-green-600 text-center mt-2 font-medium">
            This is the last game in the list!
          </div>
        )}
      </div>

      {/* Win/Loss Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleWinLoss(false)}
          className={`py-3 rounded text-sm flex items-center justify-center gap-2 
                     ${currentGame.played && !currentGame.won
              ? 'bg-red-600 text-white'
              : 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'}`}
        >
          <ThumbsDown className="w-4 h-4" />
          Lost
        </button>
        <button
          onClick={() => handleWinLoss(true)}
          className={`py-3 rounded text-sm flex items-center justify-center gap-2
                     ${currentGame.played && currentGame.won
              ? 'bg-green-600 text-white'
              : 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700'}`}
        >
          Won
          <ThumbsUp className="w-4 h-4" />
        </button>
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="w-full py-2 bg-black text-white rounded text-sm 
                 hover:bg-gray-800 active:bg-gray-700 
                 flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
    </div>
  );
};