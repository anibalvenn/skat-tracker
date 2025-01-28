import React, { useEffect, useState } from 'react';
import { Game, GameType } from '@/types/index';
import { GameModifiers } from './GameModifiers';
import { GameTypeSelection } from './GameTypeSelection';
import { ThreePlayerSelection } from './ThreePlayerSelection';
import { FourPlayerSelection } from './FourPlayerSelection';
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
  isThreePlayerMode: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  currentGame,
  setCurrentGame,
  handleGameComplete,
  handleGameTypeSelect,
  displayPlayers,
  onCancelEdit,
  isEditing,
  isThreePlayerMode
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
      modifiers.push(
        <div key="schwarz-announced" className="flex items-center">
          <Volume1 className="w-4 h-4" />
          <PaintBucket className="w-4 h-4" />
        </div>
      );
    } else if (currentGame.schneiderAnnounced) {
      modifiers.push(
        <div key="schneider-announced" className="flex items-center">
          <Volume1 className="w-4 h-4" />
          <Scissors className="w-4 h-4" />
        </div>
      );
    } else {
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

  // Select appropriate player selection component based on game mode
  const PlayerSelectionComponent = isThreePlayerMode ? ThreePlayerSelection : FourPlayerSelection;

  return (
    <div className="relative bg-white border-t p-2">
      {/* Edit Mode Header */}
  

      <div className="space-y-2">
        {/* Header Text */}
        <div className="text-center text-sm font-medium mb-3">
          {currentGame.player === null ? (
            isThreePlayerMode ? (
              <> Who plays? </>
            ) : (
              <>{displayPlayers[currentGame.dealer] || `Player ${currentGame.dealer + 1}`} deals. Who plays?</>
            )
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
            <PlayerSelectionComponent
              currentGame={currentGame}
              setCurrentGame={setCurrentGame}
              handleGameComplete={handleGameComplete}
              displayPlayers={displayPlayers}
            />
          ) : !currentGame.gameType ? (
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
            <MitOhneSelection
              currentGame={currentGame}
              setCurrentGame={setCurrentGame}
              handleGameComplete={handleGameComplete}
              onBack={handleBack}
              isEditing={isEditing}
              isThreePlayerMode={isThreePlayerMode}
            />
          ) : (
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