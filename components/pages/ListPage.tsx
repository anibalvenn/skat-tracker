'use client';

import { useSearchParams } from 'next/navigation';
import SkatListDisplay from '@/components/SkatListDisplay';
import { Suspense } from 'react';

function ListContent() {
  const searchParams = useSearchParams();

  // To this:
  const playersParam = searchParams.get('players');
  const players = playersParam ? JSON.parse(decodeURIComponent(playersParam)) : [];
  const mode = searchParams.get('mode');
  const totalGamesParam = searchParams.get('totalGames');
  const totalGames = totalGamesParam ? parseInt(totalGamesParam, 10) : (mode === '3er' ? 36 : 48);
  const numPlayers = mode === '3er' ? 3 : 4;


  return (
    <SkatListDisplay
      numPlayers={numPlayers}
      players={players}
      totalGames={totalGames}
    />
  );
}

export default function List() {
  return (
    <main className="min-h-[100dvh] p-1">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[100dvh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      }>
        <ListContent />
      </Suspense>
    </main>
  );
}