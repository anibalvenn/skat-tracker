// src/app/page.tsx

import SkatListDisplay from 'components/SkatListDisplay'

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <SkatListDisplay 
        numPlayers={4} 
        players={["Player 1", "Player 2", "Player 3", "Player 4"]}
      />
    </main>
  )
}