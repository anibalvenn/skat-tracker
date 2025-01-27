"use client";

import ThreePlayerScorer from '@/components/game/ThreePlayerScorer';
import ProtectedList from '@/components/list/ProtectedList';
import { useSearchParams } from 'next/navigation';


export default function ThreePlayerListPage() {
  const searchParams = useSearchParams();
  
  // Get players from URL parameters
  const playersParam = searchParams.get('players');
  const players = playersParam ? JSON.parse(decodeURIComponent(playersParam)) : [];

  return (
    <ProtectedList mode="3er">
      <main className="min-h-screen p-1">
        <ThreePlayerScorer 
          players={players}
          totalGames={36}
        />
      </main>
    </ProtectedList>
  );
}