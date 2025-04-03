"use client";

import { useSearchParams } from 'next/navigation';
import ThreePlayerList from '@/components/list/ThreePlayerList';
import ProtectedList from '@/components/list/ProtectedList';
import { Suspense } from 'react';

function ThreePlayerListContent() {
  const searchParams = useSearchParams();

  // Get players from URL parameters
  const playersParam = searchParams.get('players');
  const totalGamesParam = searchParams.get('totalGames');
  const players = playersParam ? JSON.parse(decodeURIComponent(playersParam)) : [];
  const totalGames = totalGamesParam ? parseInt(totalGamesParam, 10) : 36;
  const listId = searchParams.get('listId');



  return (
    <ProtectedList mode="3er">
      <ThreePlayerList
        players={players}
        numPlayers={3}
        totalGames={totalGames}
        listId={listId ? parseInt(listId, 10) : undefined}

      />
    </ProtectedList>
  );
}

export default function ThreePlayerListPage() {
  return (
    <main className="min-h-[100dvh] p-1">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[100dvh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      }>
        <ThreePlayerListContent />
      </Suspense>
    </main>
  );
}