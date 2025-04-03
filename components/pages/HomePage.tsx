"use client";

import { Trophy, List, FolderOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const handleChampionshipClick = () => {
    alert("Feature not implemented");
  };

  const handleNewListClick = () => {
    router.push('/setup');
  };

  const handleYourListsClick = () => {
    router.push('/yourlists');
  };

  return (
    <main className="min-h-[100dvh] flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-center">Skat Tracker</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <button
            onClick={handleNewListClick}
            className="w-full p-4 bg-green-500 text-white rounded-lg shadow-sm 
                     hover:bg-green-600 active:bg-green-700 transition-colors 
                     flex items-center justify-center gap-2"
          >
            <List className="w-5 h-5" />
            New List
          </button>

          <button
            onClick={handleYourListsClick}
            className="w-full p-4 bg-blue-500 text-white rounded-lg shadow-sm 
                     hover:bg-blue-600 active:bg-blue-700 transition-colors 
                     flex items-center justify-center gap-2"
          >
            <FolderOpen className="w-5 h-5" />
            Your Lists
          </button>

          <button
            onClick={handleChampionshipClick}
            className="w-full p-4 bg-gray-500 text-white rounded-lg shadow-sm 
                     hover:bg-gray-600 active:bg-gray-700 transition-colors 
                     flex items-center justify-center gap-2 opacity-50"
          >
            <Trophy className="w-5 h-5" />
            Championship List
            <span className="text-xs bg-white text-gray-500 px-2 py-0.5 rounded-full">
              Coming Soon
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}