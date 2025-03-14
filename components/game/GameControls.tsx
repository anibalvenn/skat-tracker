/* eslint-disable react/no-unescaped-entities */

import React, { useEffect, useState } from 'react';
import { Game, GameType } from '@/types/index';
import { GameModifiers } from './GameModifiers';
import { GameTypeSelection } from './GameTypeSelection';
import { ThreePlayerSelection } from './ThreePlayerSelection';
import { FourPlayerSelection } from './FourPlayerSelection';
import { MitOhneSelection } from './MitOhneSelection';
import { GameOutcomeSelection } from './GameOutcomeSelection';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Hand,
  PaintBucket,
  Scissors,
  Volume1
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
  totalGames?: number;
  playedGames?: number;
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
  // Step management: null means player selection, 
  // 'type' means game type selection
  // 'mitohne' means mitohne selection
  // 'modifiers' means game modifiers selection
  // 'outcome' means game outcome (won/lost) selection
  const [gameStep, setGameStep] = useState<'type' | 'mitohne' | 'modifiers' | 'outcome' | null>(null);

  // Helper function to determine which step we're on
  useEffect(() => {
    if (currentGame.player === null) {
      setGameStep(null);
    } else if (!currentGame.gameType) {
      setGameStep('type');
    } else if (currentGame.gameType !== 'N' && currentGame.gameType !== 'eingepasst' && gameStep === 'type') {
      // Only transition to mitohne from type selection, not automatically when mitOhne changes
      setGameStep('mitohne');
    } else if (currentGame.gameType === 'N' || currentGame.gameType === 'eingepasst' || gameStep === 'mitohne' || gameStep === 'modifiers') {
      if (!currentGame.played) {
        // Keep the current step (mitohne or modifiers) unless we're coming from type selection with N or eingepasst
        if ((currentGame.gameType === 'N' || currentGame.gameType === 'eingepasst') && gameStep === 'type') {
          setGameStep('modifiers');
        }
        // Otherwise, stay on the current step - we only move via Next/Back buttons
      } else {
        setGameStep('outcome');
      }
    } else {
      setGameStep('outcome');
    }
  }, [currentGame.player, currentGame.gameType, currentGame.played, gameStep]);

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
    setGameStep('outcome');
  };

  const handleNextAfterMitOhne = () => {
    setGameStep('modifiers');
  };

  const handleBack = () => {
    if (gameStep === 'outcome') {
      setGameStep('modifiers');
    } else if (gameStep === 'modifiers') {
      if (currentGame.gameType !== 'N' && currentGame.gameType !== 'eingepasst') {
        setGameStep('mitohne');
      } else {
        setGameStep('type');
      }
    } else if (gameStep === 'mitohne') {
      console.log('gamestep mit ohne')
      // Clear the game type, which will force a transition to the 'type' step
      setCurrentGame(prev => ({ ...prev, gameType: '' }));
      // No need to manually set gameStep
    } else if (gameStep === 'type') {
      setCurrentGame(prev => ({ ...prev, player: null }));
      setGameStep(null);
    } else {
      setCurrentGame(prev => ({ ...prev, player: null }));
    }
  };

  // Select appropriate player selection component based on game mode
  const PlayerSelectionComponent = isThreePlayerMode ? ThreePlayerSelection : FourPlayerSelection;

  return (
    <div className="relative bg-white border-t p-2">
      <div className="space-y-2">
        {/* Header Text */}
        <div className="text-center text-sm font-medium mb-3">
          {/* Step 1: Player Selection */}
          {gameStep === null && (
            isThreePlayerMode ? (
              <> Who plays? </>
            ) : (
              <>{displayPlayers[currentGame.dealer] || `Player ${currentGame.dealer + 1}`} deals. Who plays?</>
            )
          )}

          {/* Step 2: Game Type Selection */}
          {gameStep === 'type' && (
            <>{displayPlayers[currentGame.player!] || `Player ${currentGame.player! + 1}`} plays what?</>
          )}

          {/* Step 3: Mit/Ohne Selection (for non-Null games) */}
          {gameStep === 'mitohne' && (
            <>{displayPlayers[currentGame.player!] || `Player ${currentGame.player! + 1}`}'s {currentGame.gameType} - Mit or Ohne?</>
          )}

          {/* Step 4: Modifiers Selection */}
          {gameStep === 'modifiers' && (
            <>Details of {displayPlayers[currentGame.player!] || `Player ${currentGame.player! + 1}`}'s {currentGame.gameType}:</>
          )}

          {/* Step 5: Game Outcome Selection */}
          {gameStep === 'outcome' && (
            <div className="break-words flex items-center gap-2 justify-center flex-wrap">
              <span>
                {isEditing ? 'Update' : 'Outcome of'} {displayPlayers[currentGame.player!] || `Player ${currentGame.player! + 1}`}'s {currentGame.gameType}
              </span>
              <div className="flex gap-1 items-center">
                {getVisibleModifiers()}
              </div>
              {currentGame.mitOhne && currentGame.gameType !== 'N' && (
                <span className="text-xs text-gray-600">
                  {currentGame.mitOhne} × {currentGame.multiplier || 1}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Game Control Steps */}
        <div className="space-y-2">
          {/* Step 1: Player Selection */}
          {gameStep === null && (
            <PlayerSelectionComponent
              currentGame={currentGame}
              setCurrentGame={setCurrentGame}
              handleGameComplete={handleGameComplete}
              displayPlayers={displayPlayers}
            />
          )}

          {/* Step 2: Game Type Selection */}
          {gameStep === 'type' && (
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
          )}

          {/* Step 3: Mit/Ohne Selection */}
          {gameStep === 'mitohne' && (
            <div className="space-y-2">
              <MitOhneSelection
                currentGame={currentGame}
                setCurrentGame={setCurrentGame}
                showWinLoss={false}
                isEditing={false}
              />
              <div className="grid grid-cols-2 gap-2">
                <BackButton onClick={handleBack} />
                <button
                  onClick={handleNextAfterMitOhne}
                  className="w-full p-2 bg-green-500 text-white rounded text-sm 
                           hover:bg-green-600 active:bg-green-700 
                           flex items-center justify-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Game Modifiers */}
          {gameStep === 'modifiers' && (
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

          {/* Step 5: Game Outcome */}
          {gameStep === 'outcome' && (
            <GameOutcomeSelection
              currentGame={currentGame}
              setCurrentGame={setCurrentGame}
              handleGameComplete={handleGameComplete}
              onBack={handleBack}
              isThreePlayerMode={isThreePlayerMode}
            />
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