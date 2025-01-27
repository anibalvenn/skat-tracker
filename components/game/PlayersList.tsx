import React from 'react';
import { Layers } from 'lucide-react';
import PlayerName from '../style/PlayerName';

interface PlayerStats {
  wonCount: number;
  lostCount: number;
  basePoints: number;
  totalPoints: number;
}

interface PlayersListProps {
  players: string[];
  playerCounts: PlayerStats[];
  currentDealer: number;
}

export const PlayersList: React.FC<PlayersListProps> = ({ 
  players, 
  playerCounts, 
  currentDealer 
}) => (
  <div className="w-full">
    <div className="grid bg-gray-100 text-xs border-b" 
         style={{ gridTemplateColumns: 'minmax(112px, 1.6fr) repeat(4, minmax(35px, 0.6fr))' }}>
      <div className="py-1">Name</div>
      <div className="text-center py-1">Base</div>
      <div className="text-center py-1">G</div>
      <div className="text-center py-1">V</div>
      <div className="text-center py-1">Total</div>
    </div>
    {players.map((player, idx) => (
      <div 
        key={idx} 
        className="grid border-b last:border-b-0 text-sm bg-white"
        style={{ gridTemplateColumns: 'minmax(112px, 1.6fr) repeat(4, minmax(35px, 0.6fr))' }}
      >
        {/* Player Name with Dealer Indicator */}
        <div className="py-1 font-medium truncate flex items-center gap-1">
          {idx === currentDealer && (
            <Layers className="w-4 h-4 text-gray-600" />
          )}
          <PlayerName 
            name={player} 
            index={idx} 
            isDealer={idx === currentDealer}
          />
        </div>
        
        {/* Stats remain unchanged */}
        <div className="text-center py-1">
          {playerCounts[idx]?.basePoints || 0}
        </div>
        <div className="text-center py-1 text-green-600">
          {playerCounts[idx]?.wonCount || 0}
        </div>
        <div className="text-center py-1 text-red-600">
          {playerCounts[idx]?.lostCount || 0}
        </div>
        <div className="text-center py-1 font-semibold">
          {playerCounts[idx]?.totalPoints || 0}
        </div>
      </div>
    ))}
  </div>
);