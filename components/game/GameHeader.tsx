// src/components/game/GameHeader.tsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GameHeaderProps {
  seriesId: string | null;
  tischId: string | null;
}

export const GameHeader: React.FC<GameHeaderProps> = () => {
  const router = useRouter();

  const handleBack = () => {
    router.push('/yourlists');
  };

  return (
    <div className="sticky top-0 bg-white z-10 px-2 shadow-sm">
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Back to Your Lists"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center flex-1">
          Placeholder String
        </div>
        {/* Empty div to maintain centering */}
        <div className="w-9"></div>
      </div>
    </div>
  );
};