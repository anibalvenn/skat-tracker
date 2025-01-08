import React, { useRef, useEffect } from 'react';
import { Game } from '@/types/index';
import { calculatePoints } from '@/utils/skatScoring';
import { Hand, Scissors, PaintBucket, Eye } from 'lucide-react';

interface ScrollableGamesListProps {
  games: Game[];
  currentGame: Game;
  displayPlayers: string[];
}

const ScrollableGamesList: React.FC<ScrollableGamesListProps> = ({ 
  games, 
  currentGame, 
  displayPlayers 
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
    const { basePoints } = calculatePoints(game);
    return Math.abs(basePoints);
  };

  return (
    <div className="h-full relative">
      <div className="h-2 bg-gradient-to-b from-gray-50 to-transparent sticky top-0 z-10" />
      
      <div ref={listRef} className="h-full overflow-y-auto px-2 pb-4">
        <div className="space-y-1">
          {games.map((game, idx) => (
            <div
              key={idx}
              ref={game.gameNumber === currentGame.gameNumber ? currentGameRef : null}
              className={`p-2 rounded text-sm transition-colors duration-200 ${
                game.gameNumber === currentGame.gameNumber
                  ? 'bg-white shadow-sm ring-1 ring-blue-100'
                  : game.played && game.gameType === 'eingepasst'
                  ? 'bg-yellow-50'
                  : game.played
                  ? 'bg-gray-50'
                  : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">#{game.gameNumber}</span>
                  {game.player !== null && (
                    <span className="text-gray-900">
                      {displayPlayers[game.player] || `Player ${game.player + 1}`}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  {game.gameType && (
                    <span className={`font-medium ${
                      (game.gameType === '♥' || game.gameType === '♦') 
                        ? 'text-red-600' 
                        : game.gameType === 'eingepasst'
                        ? 'text-yellow-700'
                        : 'text-gray-900'
                    }`}>
                      {game.gameType}
                    </span>
                  )}
                  {game.played && game.gameType !== 'N' && game.gameType !== 'eingepasst' && game.mitOhne && (
                    <span className="text-xs text-gray-500">
                      {game.mitOhne} × {game.multiplier || 1}
                    </span>
                  )}
                </div>
              </div>
              
              {(game.played || game.gameNumber === currentGame.gameNumber) && game.gameType !== 'eingepasst' && (
                <div className="mt-1 flex justify-between items-center">
                  <div className="flex gap-1 text-gray-500">
                    {getGameModifiers(game)}
                  </div>
                  {game.played && (
                    <span className={`font-medium ${
                      game.won ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {getBaseValue(game)} 
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="h-2 bg-gradient-to-t from-gray-50 to-transparent sticky bottom-0 z-10" />
    </div>
  );
};

export default ScrollableGamesList;