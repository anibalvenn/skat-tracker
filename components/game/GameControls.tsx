import React, { useEffect } from 'react';
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
  Volume1
} from 'lucide-react';

interface GameControlsProps {
  currentGame: Game;
  setCurrentGame: React.Dispatch<React.SetStateAction<Game>>;
  handleGameComplete: () => Promise<void>;
  handleGameTypeSelect: (type: GameType) => void;
  displayPlayers: string[];
}

export const GameControls: React.FC<GameControlsProps> = ({
  currentGame,
  setCurrentGame,
  handleGameComplete,
  handleGameTypeSelect,
  displayPlayers
}) => {
  const [showMitOhne, setShowMitOhne] = React.useState(false);

  useEffect(() => {
    if (currentGame.gameNumber === 1 || !currentGame.played) {
      setShowMitOhne(false);
    }
  }, [currentGame.gameNumber, currentGame.played]);

  const handleNextAfterModifiers = () => {
    setShowMitOhne(true);
  };

  const handleBack = () => {
    if (showMitOhne) {
      setShowMitOhne(false);
    } else if (currentGame.gameType) {
      setCurrentGame(prev => ({ ...prev, gameType: '' }));
    } else {
      setCurrentGame(prev => ({ ...prev, player: null }));
    }
  };

  const wrappedHandleGameComplete = async () => {
    try {
      await handleGameComplete();
    } catch (error) {
      console.error('Error completing game:', error);
    }
  };

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

  const BackButton = () => (
    <button
      onClick={handleBack}
      className="w-full p-2 bg-black text-white rounded text-sm hover:bg-gray-800 active:bg-gray-700 flex items-center justify-center gap-2"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
  );

  return (
    <div className="sticky bottom-0 bg-white border-t p-2">
      <div className="space-y-2">
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
                Summarizing {displayPlayers[currentGame.player] || `Player ${currentGame.player + 1}`}'s {currentGame.gameType}
              </span>
              <div className="flex gap-1 items-center">
                {getVisibleModifiers()}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {currentGame.player === null ? (
            <PlayerSelection
              currentGame={currentGame}
              setCurrentGame={setCurrentGame}
              handleGameComplete={wrappedHandleGameComplete}
              displayPlayers={displayPlayers}
            />
          ) : !currentGame.gameType ? (
            <>
              <GameTypeSelection
                currentGame={currentGame}
                setCurrentGame={setCurrentGame}
              />
              <div className="grid grid-cols-1 gap-2">
                <BackButton />
              </div>
            </>
          ) : showMitOhne ? (
            <MitOhneSelection
              currentGame={currentGame}
              setCurrentGame={setCurrentGame}
              handleGameComplete={wrappedHandleGameComplete}
              onBack={handleBack}
            />
          ) : (
            <>
              <GameModifiers
                currentGame={currentGame}
                setCurrentGame={setCurrentGame}
                handleGameComplete={wrappedHandleGameComplete}
              />
              <div className="grid grid-cols-2 gap-2">
                <BackButton />
                <button
                  onClick={handleNextAfterModifiers}
                  className="w-full p-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 active:bg-green-700 flex items-center justify-center gap-2"
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