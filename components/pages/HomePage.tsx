"use client";

import { Trophy, List } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleChampionshipClick = () => {
    alert("Feature not implemented");
  };

  const handleSingleListClick = () => {
    router.push('/setup');
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-center">List Tracker</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <button
            onClick={handleChampionshipClick}
            className="w-full p-4 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 
                     active:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            Championship List
          </button>

          <button
            onClick={handleSingleListClick}
            className="w-full p-4 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 
                     active:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <List className="w-5 h-5" />
            Single List
          </button>
        </div>
      </div>
    </main>
  );
}