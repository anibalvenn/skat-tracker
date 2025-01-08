import React from 'react';
import { Game } from '@/types/index';
import { calculatePoints } from '@/utils/skatScoring';

interface GamesListProps {
  games: Game[];
  currentGame: Game;
}

export const GamesList: React.FC<GamesListProps> = ({ games, currentGame }) => {
  const getGameModifiers = (game: Game) => {
    const modifiers = [];
    if (game.hand) modifiers.push('Hand');
    if (game.schneider) modifiers.push('Schn');
    if (game.schwarz) modifiers.push('Schw');
    if (game.ouvert) modifiers.push('Ouvert');
    if (game.schneiderAnnounced) modifiers.push('Schn.A');
    if (game.schwarzAnnounced) modifiers.push('Schw.A');
    return modifiers.join(' ');
  };

  const getBaseValue = (game: Game) => {
    if (!game.played || !game.gameType || game.gameType === 'eingepasst') return 0;
    const { basePoints } = calculatePoints(game);
    // Return absolute value since we want to show base value regardless of win/loss
    return Math.abs(basePoints);
  };

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-1">
      {games.map((game, idx) => (
        <div
          key={idx}
          className={`p-2 rounded text-sm ${
            game.gameNumber === currentGame.gameNumber
              ? 'bg-white'
              : game.played
              ? 'bg-gray-100'
              : 'bg-white'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="font-medium">#{game.gameNumber}</span>
              {game.player !== null && (
                <span>
                  Player {game.player + 1}
                </span>
              )}
            </div>
            <div className="flex flex-col items-end">
              {game.gameType && (
                <span className={`${
                  (game.gameType === '♥' || game.gameType === '♦') 
                    ? 'text-red-600' 
                    : ''
                }`}>
                  {game.gameType}
                </span>
              )}
              {game.played && game.mitOhne && (
                <span className="text-xs text-gray-600">
                  {game.mitOhne} × {game.multiplier || 1}
                </span>
              )}
            </div>
          </div>
          
          {(game.played || game.gameNumber === currentGame.gameNumber) && (
            <div className="mt-1 flex justify-between text-xs">
              <span className="text-gray-600">
                {getGameModifiers(game)}
              </span>
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
  );
};

export default GamesList;