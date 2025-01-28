import React from 'react';

const playerColors = {
  0: 'bg-blue-50 text-blue-800',
  1: 'bg-green-50 text-green-800',
  2: 'bg-yellow-50 text-yellow-800',
  3: 'bg-orange-50 text-orange-800'
};

interface PlayerNameProps {
  name: string;
  index: number;
  isDealer?: boolean;
  className?: string;
}

const PlayerName: React.FC<PlayerNameProps> = ({ 
  name, 
  index, 
  isDealer = false,
  className = ''
}) => {
  const displayName = name || `Player ${index + 1}`;
  const colorClass = playerColors[index as keyof typeof playerColors];
  
  return (
    <span className={`px-2 py-1 rounded ${colorClass} ${
      isDealer ? 'ring-2 ring-gray-400' : ''
    } ${className}`}>
      {displayName}
      {isDealer}
    </span>
  );
};

export default PlayerName;