import { Game } from '@/types/index';
import React from 'react';

interface GamesListProps {
  games: Game[];
}

export const GamesList: React.FC<GamesListProps> = ({ games }) => (
  <div className="flex-1 overflow-y-auto p-2">
    <div className="space-y-2">
      {games.map((game, idx) => (
        game.played && (
          <div key={idx} className="p-2 bg-white rounded shadow-sm text-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium">Game {idx + 1}</span>
              <div className="flex items-center gap-1">
                <span className={`text-xl ${(game.gameType === '♥' || game.gameType === '♦') ? 'text-red-600' : ''}`}>
                  {game.gameType}
                </span>
                {game.hand && <span className="text-xs bg-blue-100 px-1 rounded">Hand</span>}
                {game.schneider && <span className="text-xs bg-blue-100 px-1 rounded">Schn</span>}
                {game.schwarz && <span className="text-xs bg-blue-100 px-1 rounded">Schw</span>}
              </div>
            </div>
          </div>
        )
      ))}
    </div>
  </div>
);