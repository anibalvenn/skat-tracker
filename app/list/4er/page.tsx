"use client";

import FourPlayerList from '@/components/list/FourPlayerList';
import ProtectedList from '@/components/list/ProtectedList';
import { useSearchParams } from 'next/navigation';

export default function FourPlayerListPage() {
  const searchParams = useSearchParams();
  
  // Get players from URL parameters
  const playersParam = searchParams.get('players');
  const players = playersParam ? JSON.parse(decodeURIComponent(playersParam)) : [];

  return (
    <ProtectedList mode="4er">
      <main className="min-h-screen p-1">
        <FourPlayerList 
          players={players}
          numPlayers={4}
          totalGames={48}  // Standard number of games for 4-player Skat
        />
      </main>
    </ProtectedList>
  );
}