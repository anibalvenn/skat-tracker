"use client";

import { useSearchParams } from 'next/navigation';
import FourPlayerList from '@/components/list/FourPlayerList';
import { Suspense } from 'react';

function FourPlayerListContent() {
  const searchParams = useSearchParams();

  // Get players from URL parameters
  const playersParam = searchParams.get('players');
  const totalGamesParam = searchParams.get('totalGames');
  const players = playersParam ? JSON.parse(decodeURIComponent(playersParam)) : [];
  const totalGames = totalGamesParam ? parseInt(totalGamesParam, 10) : 48;
  const listId = searchParams.get('listId');
  const seriesId = searchParams.get('seriesId');
  const tischId = searchParams.get('tischId');
  const back = searchParams.get('back');
  const backTo = back === 'championships' ? '/championships' : '/yourlists';

  return (
    <FourPlayerList
      players={players}
      numPlayers={4}
      totalGames={totalGames}
      listId={listId ? parseInt(listId, 10) : undefined}
      seriesId={seriesId}
      tischId={tischId}
      backTo={backTo}
    />
  );
}

export default function FourPlayerListPage() {
  return (
    <main className="min-h-[calc(100dvh-50px)] p-1">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[calc(100dvh-50px)]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      }>
        <FourPlayerListContent />
      </Suspense>
    </main>
  );
}