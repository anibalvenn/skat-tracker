"use client";

import { Trophy, List, FolderOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getManagerConfig } from '@/utils/storage';

export default function HomePage() {
  const router = useRouter();
  const [champLabel, setChampLabel] = useState<string | null>(null);

  useEffect(() => {
    getManagerConfig().then(cfg => {
      if (cfg?.seriesId && cfg.tischName) {
        setChampLabel(`${cfg.seriesName} · ${cfg.tischName}`);
      } else if (cfg?.url) {
        setChampLabel('Connected');
      }
    });
  }, []);

  return (
    <main className="min-h-[calc(100dvh-50px)] flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-center">Skat Tracker</h1>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <button
            onClick={() => router.push('/setup')}
            className="w-full p-4 bg-green-500 text-white rounded-lg shadow-sm
                     hover:bg-green-600 active:bg-green-700 transition-colors
                     flex items-center justify-center gap-2"
          >
            <List className="w-5 h-5" />
            New List
          </button>

          <button
            onClick={() => router.push('/yourlists')}
            className="w-full p-4 bg-blue-500 text-white rounded-lg shadow-sm
                     hover:bg-blue-600 active:bg-blue-700 transition-colors
                     flex items-center justify-center gap-2"
          >
            <FolderOpen className="w-5 h-5" />
            Your Lists
          </button>

          <button
            onClick={() => router.push('/championships')}
            className={`w-full p-4 rounded-lg shadow-sm transition-colors
                     flex items-center justify-center gap-2
                     ${champLabel
                       ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300'
                       : 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'}`}
          >
            <Trophy className="w-5 h-5" />
            Championships
            {champLabel
              ? <span className="text-xs font-normal opacity-75">· {champLabel}</span>
              : <span className="text-xs bg-white text-purple-500 px-2 py-0.5 rounded-full">Optional</span>}
          </button>
        </div>
      </div>
    </main>
  );
}
