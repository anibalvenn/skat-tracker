import React, { useRef, useEffect } from 'react';
import { Game } from '@/types/index';
import { calculateThreePlayerPoints } from '@/utils/threePlayerScoring';
import { calculatePoints } from '@/utils/skatScoring';
import { Hand, Scissors, PaintBucket, Eye, Edit2, X } from 'lucide-react';
import PlayerName from '../style/PlayerName';

interface ScrollableGamesListProps {
  games: Game[];
  currentGame: Game;
  displayPlayers: string[];
  onEditGame: (gameNumber: number) => void;
  onCancelEdit: () => void;
  isThreePlayerMode?: boolean;
}

const ScrollableGamesList: React.FC<ScrollableGamesListProps> = ({
  games,
  currentGame,
  displayPlayers,
  onEditGame,
  onCancelEdit,
  isThreePlayerMode = false
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const currentGameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentGameRef.current) {
      currentGameRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentGame.gameNumber, currentGame.played]);

  const getGameModifiers = (game: Game) => {
    const icons = [];
    if (game.hand) icons.push(<Hand key="hand" className="w-3 h-3" />);
    if (game.schneider) icons.push(<Scissors key="schneider" className="w-3 h-3" />);
    if (game.schwarz) icons.push(<PaintBucket key="schwarz" className="w-3 h-3" />);
    if (game.ouvert) icons.push(<Eye key="ouvert" className="w-3 h-3" />);
    return icons;
  };

  const getBaseValue = (game: Game) => {
    if (!game.played || !game.gameType || game.gameType === 'eingepasst') return 0;
    const { basePoints } = isThreePlayerMode
      ? calculateThreePlayerPoints(game)
      : calculatePoints(game);
    return game.won ? basePoints : -basePoints;
  };

  const getGameStyle = (game: Game) => {
    if (game.isEditing) {
      return 'bg-blue-50 ring-2 ring-blue-500'; // Editing state
    }
    if (game.gameNumber === currentGame.gameNumber && !game.played) {
      return 'bg-gray-900 text-white shadow-lg'; // Current game
    }
    if (game.played) {
      return 'bg-gray-50'; // Completed game
    }
    return 'bg-white';
  };

  return (
    <div className="h-full relative">
      <div className="h-2 bg-gradient-to-b from-gray-50 to-transparent sticky top-0 z-10" />

      <div ref={listRef} className="h-full overflow-y-auto px-2 pb-4">
        <div className="space-y-1">
          {games.map((game, idx) => (
            <React.Fragment key={idx}>
              {/* Show editing banner right before the edited game */}
              {game.isEditing && (
                <div className="bg-blue-500 text-white py-1.5 px-2 rounded-md mb-1
                             flex items-center justify-between shadow-sm">
                  <span className="font-medium">
                    Editing Game #{game.gameNumber}
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

              <div
                ref={game.gameNumber === currentGame.gameNumber ? currentGameRef : null}
                className={`p-2 rounded text-sm transition-colors duration-200 ${getGameStyle(game)}`}
              >
                {/* Rest of the game card content remains the same */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${game.gameNumber === currentGame.gameNumber && !game.played
                      ? 'text-white'
                      : 'text-gray-600'
                      }`}>
                      #{game.gameNumber}
                    </span>
                    {(game.gameNumber === currentGame.gameNumber && !game.played ? currentGame : game).player !== null && (
                      <PlayerName
                        name={displayPlayers[(game.gameNumber === currentGame.gameNumber && !game.played ? currentGame : game).player!]}
                        index={(game.gameNumber === currentGame.gameNumber && !game.played ? currentGame : game).player!}
                        isDealer={isThreePlayerMode && game.player === game.dealer}
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {game.played && !game.isEditing && (
                      <button
                        onClick={() => onEditGame(game.gameNumber)}
                        className="p-1 rounded-full bg-orange-200 
                                 transition-colors duration-150 flex items-center gap-1"
                        aria-label={`Edit game ${game.gameNumber}`}
                      >
                        <Edit2 className="w-3 h-3 text-gray-700" />
                        <span className="text-gray-700 text-xs">Edit</span>
                      </button>
                    )}
                    <div className="flex flex-col items-end">
                      {((game.gameNumber === currentGame.gameNumber && !game.played) ? currentGame : game).gameType && (
                        <span className={`font-medium ${game.gameNumber === currentGame.gameNumber && !game.played
                          ? 'text-white'
                          : (game.gameType === '♥' || game.gameType === '♦')
                            ? 'text-red-600'
                            : game.gameType === 'eingepasst'
                              ? 'text-yellow-700'
                              : 'text-gray-900'
                          }`}>
                          {(game.gameNumber === currentGame.gameNumber && !game.played)
                            ? currentGame.gameType
                            : game.gameType === 'eingepasst'
                              ? game.gameType.toUpperCase()
                              : game.gameType}
                        </span>
                      )}
                      {((game.played && game.mitOhne && game.gameType !== 'eingepasst') ||
                        (game.gameNumber === currentGame.gameNumber && !game.played && currentGame.gameType && currentGame.gameType !== 'N' &&
                          currentGame.gameType !== 'eingepasst' && currentGame.mitOhne)) && (
                          <span className={`text-xs ${game.gameNumber === currentGame.gameNumber && !game.played
                            ? 'text-gray-300'
                            : 'text-gray-500'
                            }`}>
                            {((game.gameNumber === currentGame.gameNumber && !game.played) ? currentGame : game).mitOhne} ×
                            {((game.gameNumber === currentGame.gameNumber && !game.played) ? currentGame : game).multiplier || 1}
                          </span>
                        )}
                    </div>
                  </div>
                </div>

                {((game.played || game.gameNumber === currentGame.gameNumber) &&
                  ((game.gameNumber === currentGame.gameNumber && !game.played) ? currentGame : game).gameType !== 'eingepasst') && (
                    <div className="mt-1 flex justify-between items-center">
                      <div className={`flex gap-1 ${game.gameNumber === currentGame.gameNumber && !game.played
                        ? 'text-gray-300'
                        : 'text-gray-500'
                        }`}>
                        {getGameModifiers(game.gameNumber === currentGame.gameNumber && !game.played ? currentGame : game)}
                      </div>
                      {game.played && (
                        <div className="flex items-center gap-2">
                          {isThreePlayerMode && !game.won && (
                            <span className="text-xs text-gray-500">
                              (+40)
                            </span>
                          )}
                          <span className={`font-medium ${game.won ? 'text-green-600' : 'text-red-600'}`}>
                            {game.won ? getBaseValue(game) : `-${Math.abs(getBaseValue(game))}`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="h-2 bg-gradient-to-t from-gray-50 to-transparent sticky bottom-0 z-10" />
    </div>
  );
};

export default ScrollableGamesList;