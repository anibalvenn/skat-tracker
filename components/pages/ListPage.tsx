'use client';

import { useSearchParams } from 'next/navigation';
import SkatListDisplay from '@/components/SkatListDisplay';
import { Suspense } from 'react';

function ListContent() {
  const searchParams = useSearchParams();
  
  // Get players from URL parameters
  const playersParam = searchParams.get('players');
  const players = playersParam ? JSON.parse(decodeURIComponent(playersParam)) : [];
  
  // Get mode from URL parameters
  const mode = searchParams.get('mode');
  const numPlayers = mode === '3er' ? 3 : 4;

  return (
    <SkatListDisplay 
      numPlayers={numPlayers}
      players={players}
    />
  );
}

export default function List() {
  return (
    <main className="min-h-screen p-1">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      }>
        <ListContent />
      </Suspense>
    </main>
  );
}