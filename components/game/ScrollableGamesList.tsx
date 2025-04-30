import React, { useRef, useEffect } from 'react';
import { Game } from '@/types/index';
import { calculateThreePlayerPoints } from '@/utils/threePlayerScoring';
import { calculatePoints } from '@/utils/skatScoring';
import { Hand, Scissors, PaintBucket, Eye, Edit2, X, Layers, User } from 'lucide-react';
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
          {games.map((game, idx) => {
            // Determine which game data to use (current editing data or stored data)
            const gameData = (game.gameNumber === currentGame.gameNumber && !game.played) 
              ? currentGame 
              : game;

            return (
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
                  className={`p-2 rounded text-sm transition-colors duration-200 border border-black ${getGameStyle(game)}`}
                >
                  {/* LINE 1: Game number and dealer */}
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${
                      game.gameNumber === currentGame.gameNumber && !game.played
                        ? 'text-white'
                        : 'text-gray-600'
                    }`}>
                      #{game.gameNumber}
                    </span>
                    
                    <div className={`flex items-center gap-1 text-xs ${
                      game.gameNumber === currentGame.gameNumber && !game.played
                        ? 'text-gray-300'
                        : 'text-gray-500'
                    }`}>
                      <Layers className="w-3 h-3" />
                      <span>Dealer:</span>
                      <PlayerName
                        name={displayPlayers[game.dealer]}
                        index={game.dealer}
                        isDealer={true}
                        className="text-xs py-0 px-1"
                      />
                    </div>
                  </div>

                  {/* LINE 2: Game type, modifiers, and value (moved up) */}
                  {(gameData.gameType || gameData.played) && (
                    <div className="mt-1 flex items-center gap-2">
                      {/* Game type */}
                      {gameData.gameType && (
                        <span className={`font-medium ${
                          game.gameNumber === currentGame.gameNumber && !game.played
                            ? 'text-white'
                            : (gameData.gameType === '♥' || gameData.gameType === '♦')
                              ? 'text-red-600'
                              : gameData.gameType === 'eingepasst'
                                ? 'text-yellow-700'
                                : 'text-gray-900'
                        }`}>
                          {gameData.gameType === 'eingepasst'
                            ? 'EINGEPASST'
                            : gameData.gameType}
                        </span>
                      )}

                      {/* Mit/Ohne multiplier */}
                      {gameData.gameType && gameData.gameType !== 'N' && gameData.gameType !== 'eingepasst' && gameData.mitOhne && (
                        <span className={`text-xs ${
                          game.gameNumber === currentGame.gameNumber && !game.played
                            ? 'text-gray-300'
                            : 'text-gray-500'
                        }`}>
                          {gameData.mitOhne} ×{gameData.multiplier || 1}
                        </span>
                      )}

                      {/* Game modifiers */}
                      {gameData.gameType !== 'eingepasst' && (
                        <div className={`flex gap-1 ${
                          game.gameNumber === currentGame.gameNumber && !game.played
                            ? 'text-gray-300'
                            : 'text-gray-500'
                        }`}>
                          {getGameModifiers(gameData)}
                        </div>
                      )}

                      {/* Game value (for played games) */}
                      {game.played && gameData.gameType !== 'eingepasst' && (
                        <>
                          {/* Game value */}
                          <span className={`font-medium ${game.won ? 'text-green-600' : 'text-red-600'}`}>
                            {game.won 
                              ? getBaseValue(game) 
                              : `-${Math.abs(getBaseValue(game))}`
                            }
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* LINE 3: Player information, player stats, and Edit button */}
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center gap-1">
                      {gameData.player !== null && gameData.gameType !== 'eingepasst' && (
                        <>
                          <User className={`w-3 h-3 ${
                            game.gameNumber === currentGame.gameNumber && !game.played
                              ? 'text-gray-300'
                              : 'text-gray-500'
                          }`} />
                          <span className={`text-xs ${
                            game.gameNumber === currentGame.gameNumber && !game.played
                              ? 'text-gray-300'
                              : 'text-gray-500'
                          }`}>
                            Player:
                          </span>
                          <PlayerName
                            name={displayPlayers[gameData.player]}
                            index={gameData.player}
                            isDealer={isThreePlayerMode && gameData.player === game.dealer}
                            className="ml-1"
                          />
                          
                          {/* Player stats - only show for played games */}
                          {game.played && (
                            <div className="flex items-center gap-2 ml-2 text-xs">
                              {/* Base points - sum of base points for this player up to this game */}
                              <span className="text-gray-600">
                                {games
                                  .filter(g => 
                                    g.played && 
                                    g.player === game.player && 
                                    g.gameNumber <= game.gameNumber
                                  )
                                  .reduce((sum, g) => {
                                    // Calculate base points for each game
                                    const points = isThreePlayerMode
                                      ? calculateThreePlayerPoints(g)
                                      : calculatePoints(g);
                                    
                                    // For won games, add the base points; for lost games, subtract
                                    return sum + (g.won ? points.basePoints : -Math.abs(points.basePoints));
                                  }, 0)
                                }
                              </span>
                              
                              {/* Won:Lost record with appropriate highlighting */}
                              <div className="flex items-center">
                                {/* Won count in green, underlined if this game was a win */}
                                <span className={`text-green-600 ${
                                  game.won ? 'underline decoration-green-600 decoration-2' : ''
                                }`}>
                                  {/* Calculate won count up to this game */}
                                  {games.filter(g => 
                                    g.played && 
                                    g.player === game.player && 
                                    g.won && 
                                    g.gameNumber <= game.gameNumber
                                  ).length}
                                </span>
                                <span className="mx-0.5">:</span>
                                {/* Lost count in red, underlined if this game was a loss */}
                                <span className={`text-red-600 ${
                                  game.played && !game.won ? 'underline decoration-red-600 decoration-2' : ''
                                }`}>
                                  {/* Calculate lost count up to this game */}
                                  {games.filter(g => 
                                    g.played && 
                                    g.player === game.player && 
                                    !g.won && 
                                    g.gameNumber <= game.gameNumber
                                  ).length}
                                </span>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Edit button */}
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
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="h-2 bg-gradient-to-t from-gray-50 to-transparent sticky bottom-0 z-10" />
    </div>
  );
};

export default ScrollableGamesList;