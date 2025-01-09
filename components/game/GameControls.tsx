import React, { useEffect, useState } from 'react';
import { Game, GameType } from '@/types/index';
import { GameModifiers } from './GameModifiers';
import { GameTypeSelection } from './GameTypeSelection';
import { PlayerSelection } from './PlayerSelection';
import { MitOhneSelection } from './MitOhneSelection';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Hand,
  PaintBucket,
  Scissors,
  Volume1,
  X
} from 'lucide-react';

interface GameControlsProps {
  currentGame: Game;
  setCurrentGame: React.Dispatch<React.SetStateAction<Game>>;
  handleGameComplete: () => Promise<void>;
  handleGameTypeSelect: (type: GameType) => void;
  displayPlayers: string[];
  onCancelEdit?: () => void;
  isEditing: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  currentGame,
  setCurrentGame,
  handleGameComplete,
  handleGameTypeSelect,
  displayPlayers,
  onCancelEdit,
  isEditing
}) => {
  const [showMitOhne, setShowMitOhne] = useState(false);
  
  // Reset MitOhne view when game changes
  useEffect(() => {
    if (currentGame.gameNumber === 1 || !currentGame.played) {
      setShowMitOhne(false);
    }
  }, [currentGame.gameNumber, currentGame.played]);

  // If editing and game has mitOhne set, show that screen
  useEffect(() => {
    if (isEditing && currentGame.mitOhne) {
      setShowMitOhne(true);
    }
  }, [isEditing, currentGame.mitOhne]);

  // Helper function to determine which modifiers to show
  const getVisibleModifiers = () => {
    const modifiers = [];

    if (currentGame.schwarzAnnounced) {
      // If schwarz is announced, only show that icon as it implies all other modifiers
      modifiers.push(
        <div key="schwarz-announced" className="flex items-center">
          <Volume1 className="w-4 h-4" />
          <PaintBucket className="w-4 h-4" />
        </div>
      );
    } else if (currentGame.schneiderAnnounced) {
      // If schneider is announced, it implies hand, so only show schneider announced
      modifiers.push(
        <div key="schneider-announced" className="flex items-center">
          <Volume1 className="w-4 h-4" />
          <Scissors className="w-4 h-4" />
        </div>
      );
    } else {
      // Otherwise show individual modifiers
      if (currentGame.hand) {
        modifiers.push(<Hand key="hand" className="w-4 h-4" />);
      }
      if (currentGame.schneider) {
        modifiers.push(<Scissors key="schneider" className="w-4 h-4" />);
      }
      if (currentGame.schwarz) {
        modifiers.push(<PaintBucket key="schwarz" className="w-4 h-4" />);
      }
    }

    // Ouvert is always shown independently
    if (currentGame.ouvert) {
      modifiers.push(<Eye key="ouvert" className="w-4 h-4" />);
    }

    return modifiers;
  };

  const handleNextAfterModifiers = () => {
    setShowMitOhne(true);
  };

  const handleBack = () => {
    if (showMitOhne) {
      setShowMitOhne(false);
    } else if (currentGame.gameType) {
      setCurrentGame(prev => ({ ...prev, gameType: '' }));
    } else if (currentGame.player !== null) {
      setCurrentGame(prev => ({ ...prev, player: null }));
    }
  };

  return (
    <div className="relative bg-white border-t p-2">
      {/* Edit Mode Header */}
      {isEditing && (
        <div className="absolute -top-8 left-0 right-0 bg-blue-500 text-white py-1.5 px-2 
                       flex items-center justify-between shadow-md">
          <span className="text-sm font-medium">
            Editing Game #{currentGame.gameNumber}
          </span>
          <button
            onClick={onCancelEdit}
            className="p-1 rounded-full hover:bg-blue-600 active:bg-blue-700
                     transition-colors duration-150"
            aria-label="Cancel editing"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-2">
        {/* Header Text */}
        <div className="text-center text-sm font-medium mb-3">
          {currentGame.player === null ? (
            <>{displayPlayers[currentGame.dealer] || `Player ${currentGame.dealer + 1}`} deals cards. Who plays?</>
          ) : !currentGame.gameType ? (
            <>{displayPlayers[currentGame.player] || `Player ${currentGame.player + 1}`} plays what?</>
          ) : !showMitOhne ? (
            <>Details of {displayPlayers[currentGame.player] || `Player ${currentGame.player + 1}`}'s {currentGame.gameType}:</>
          ) : (
            <div className="break-words flex items-center gap-2 justify-center flex-wrap">
              <span>
                {isEditing ? 'Update' : 'Summarizing'} {displayPlayers[currentGame.player] || `Player ${currentGame.player + 1}`}'s {currentGame.gameType}
              </span>
              <div className="flex gap-1 items-center">
                {getVisibleModifiers()}
              </div>
            </div>
          )}
        </div>

        {/* Game Control Steps */}
        <div className="space-y-2">
          {currentGame.player === null ? (
            // Step 1: Player Selection
            <PlayerSelection
              currentGame={currentGame}
              setCurrentGame={setCurrentGame}
              handleGameComplete={handleGameComplete}
              displayPlayers={displayPlayers}
            />
          ) : !currentGame.gameType ? (
            // Step 2: Game Type Selection
            <>
              <GameTypeSelection
                currentGame={currentGame}
                setCurrentGame={setCurrentGame}
                onSelect={handleGameTypeSelect}
              />
              <div className="grid grid-cols-1 gap-2">
                <BackButton onClick={handleBack} />
              </div>
            </>
          ) : showMitOhne ? (
            // Step 4: Mit/Ohne and Win/Loss Selection
            <MitOhneSelection
              currentGame={currentGame}
              setCurrentGame={setCurrentGame}
              handleGameComplete={handleGameComplete}
              onBack={handleBack}
              isEditing={isEditing}
            />
          ) : (
            // Step 3: Game Modifiers
            <>
              <GameModifiers
                currentGame={currentGame}
                setCurrentGame={setCurrentGame}
              />
              <div className="grid grid-cols-2 gap-2">
                <BackButton onClick={handleBack} />
                <button
                  onClick={handleNextAfterModifiers}
                  className="w-full p-2 bg-green-500 text-white rounded text-sm 
                           hover:bg-green-600 active:bg-green-700 
                           flex items-center justify-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-full p-2 bg-black text-white rounded text-sm 
             hover:bg-gray-800 active:bg-gray-700 
             flex items-center justify-center gap-2"
  >
    <ArrowLeft className="w-4 h-4" />
    Back
  </button>
);