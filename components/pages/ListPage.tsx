"use client";

import { useSearchParams } from 'next/navigation';
import SkatListDisplay from '@/components/SkatListDisplay';

export default function List() {
  const searchParams = useSearchParams();
  
  // Get players from URL parameters
  const playersParam = searchParams.get('players');
  const players = playersParam ? JSON.parse(decodeURIComponent(playersParam)) : [];
  
  // Get mode from URL parameters
  const mode = searchParams.get('mode');
  const numPlayers = mode === '3er' ? 3 : 4;

  return (
    <main className="min-h-screen p-1">
      <SkatListDisplay 
        numPlayers={numPlayers}
        players={players}
      />
    </main>
  );
}