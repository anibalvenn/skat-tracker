import React from 'react';

interface GameHeaderProps {
  seriesId: string | null;
  tischId: string | null;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ seriesId, tischId }) => (
  <div className="sticky top-0 bg-white z-10 p-2 shadow-sm">
    <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
      <div className="truncate">
        {new Date().toLocaleDateString()}
      </div>
      <div className="text-right md:text-center">
        Series: {seriesId || '-'}
      </div>
      <div className="text-right col-span-2 md:col-span-1">
        Table: {tischId || '-'}
      </div>
    </div>
  </div>
);