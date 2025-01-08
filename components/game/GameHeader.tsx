import React from 'react';

interface GameHeaderProps {
  seriesId: string | null;
  tischId: string | null;
}

export const GameHeader: React.FC<GameHeaderProps> = () => (
  <div className="sticky top-0 bg-white z-10 px-2 shadow-sm">
    <div className="text-center">
      Placeholder String
    </div>
  </div>
);