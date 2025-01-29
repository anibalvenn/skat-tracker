"use client";

import { useSearchParams } from 'next/navigation';
import FourPlayerList from '@/components/list/FourPlayerList';
import { Suspense } from 'react';

function FourPlayerListContent() {
  const searchParams = useSearchParams();
  
  // Get players from URL parameters
  const playersParam = searchParams.get('players');
  const players = playersParam ? JSON.parse(decodeURIComponent(playersParam)) : [];

  return (
    <FourPlayerList 
      players={players}
      numPlayers={4}
      totalGames={36}
    />
  );
}

export default function FourPlayerListPage() {
  return (
    <main className="min-h-screen p-1">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      }>
        <FourPlayerListContent />
      </Suspense>
    </main>
  );
}