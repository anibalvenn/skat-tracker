import React from "react";
import { Game } from "@/types/index";
import { Minus, Plus } from "lucide-react";

interface MitOhneSelectionProps {
  currentGame: Game;
  setCurrentGame: React.Dispatch<React.SetStateAction<Game>>;
  showWinLoss?: boolean;
  handleGameComplete?: () => Promise<void>;
  onBack?: () => void;
  isThreePlayerMode?: boolean;
  isEditing: boolean

}

export const MitOhneSelection: React.FC<MitOhneSelectionProps> = ({
  currentGame,
  setCurrentGame,
  onBack,
}) => {
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

  // Log when component renders to verify props
  console.log('[MitOhneSelection] Rendering with onBack:', !!onBack);

  return (
    <div className="flex flex-col gap-2">
      {/* Mit/Ohne selection for non-Null games */}
      {currentGame.gameType !== 'N' && (
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentGame(prev => ({ ...prev, mitOhne: 'mit' }))}
              className={`w-16 h-8 rounded text-center ${currentGame.mitOhne === 'mit'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300'
                }`}
            >
              Mit
            </button>

            <button
              onClick={() => setCurrentGame(prev => ({ ...prev, mitOhne: 'ohne' }))}
              className={`w-16 h-8 rounded text-center ${currentGame.mitOhne === 'ohne'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300'
                }`}
            >
              Ohne
            </button>
          </div>

          {/* Multiplier Controls */}
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
      )}
    </div>
  );
};