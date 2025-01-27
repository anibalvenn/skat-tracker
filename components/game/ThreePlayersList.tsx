import React from 'react';
import { Layers } from 'lucide-react';

interface PlayerStats {
  wonCount: number;
  lostCount: number;
  basePoints: number;
  totalPoints: number;
}

interface ThreePlayersListProps {
  players: string[];
  playerCounts: PlayerStats[];
  currentDealer: number;
}

export const ThreePlayersList: React.FC<ThreePlayersListProps> = ({ 
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
    {players.slice(0, 3).map((player, idx) => (
      <div 
        key={idx} 
        className={`grid border-b last:border-b-0 text-sm ${
          idx === currentDealer ? 'bg-blue-50' : 'bg-white'
        }`}
        style={{ gridTemplateColumns: 'minmax(112px, 1.6fr) repeat(4, minmax(35px, 0.6fr))' }}
      >
        {/* Player Name with Dealer Indicator */}
        <div className="py-1 font-medium truncate flex items-center gap-1">
          {idx === currentDealer && (
            <Layers className="w-4 h-4 text-blue-500" />
          )}
          <span className={idx === currentDealer ? 'text-blue-700' : ''}>
            {player || `Player ${idx + 1}`}
          </span>
        </div>
        
        {/* Base Points */}
        <div className="text-center py-1">
          {playerCounts[idx]?.basePoints || 0}
        </div>
        
        {/* Won Games (G) */}
        <div className="text-center py-1 text-green-600">
          {playerCounts[idx]?.wonCount || 0}
        </div>
        
        {/* Lost Games (V) */}
        <div className="text-center py-1 text-red-600">
          {playerCounts[idx]?.lostCount || 0}
        </div>
        
        {/* Total Points */}
        <div className="text-center py-1 font-semibold">
          {playerCounts[idx]?.totalPoints || 0}
        </div>
      </div>
    ))}
  </div>
);