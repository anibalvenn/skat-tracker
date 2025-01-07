import { Game, GameType } from '@/types/index';
import React from 'react';

interface PlayerSelectionProps {
  currentGame: Game;
  setCurrentGame: React.Dispatch<React.SetStateAction<Game>>;
  handleGameComplete: () => Promise<void>;
  displayPlayers: string[];
}

export const PlayerSelection: React.FC<PlayerSelectionProps> = ({
  currentGame,
  setCurrentGame,
  handleGameComplete,
  displayPlayers
}) => (
  <div className="grid grid-cols-2 gap-2">
    {displayPlayers.map((player, index) => {
      if (index === currentGame.dealer) return null;
      return (
        <button
          key={index}
          onClick={() => setCurrentGame(prev => ({
            ...prev,
            player: index
          }))}
          className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 active:bg-gray-300"
        >
          {player || `Player ${index + 1}`}
        </button>
      );
    })}
    <button
      onClick={() => {
        setCurrentGame(prev => ({
          ...prev,
          gameType: 'eingepasst' as GameType
        }));
        handleGameComplete();
      }}
      className="p-2 bg-yellow-100 rounded text-sm hover:bg-yellow-200 active:bg-yellow-300"
    >
      Eingepasst
    </button>
  </div>
);