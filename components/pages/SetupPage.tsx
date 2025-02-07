"use client";

import { Triangle, Square, ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { StorageManager } from '@/utils/storage';

const LIST_FRACTIONS = [
  { label: 'Full List', value: 1 },
  { label: '3/4 List', value: 0.75 },
  { label: '2/3 List', value: 0.6667 },
  { label: '1/2 List', value: 0.5 },
  { label: '1/4 List', value: 0.25 },
  { label: '1/6 List', value: 0.1667 }
];

export default function SetupPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'3er' | '4er'>('3er');
  const [players, setPlayers] = useState<string[]>(() => 
    Array(mode === '3er' ? 3 : 4).fill('')
  );
  const [errors, setErrors] = useState<boolean[]>(() => 
    Array(mode === '3er' ? 3 : 4).fill(false)
  );
  const [selectedFraction, setSelectedFraction] = useState<number>(1);

  // Calculate total games based on mode and fraction
  const getTotalGames = () => {
    const baseGames = mode === '3er' ? 36 : 48;
    return Math.floor(baseGames * selectedFraction);
  };

  // Update players array when mode changes
  useEffect(() => {
    const newPlayerCount = mode === '3er' ? 3 : 4;
    setPlayers(prev => {
      if (prev.length === newPlayerCount) return prev;
      if (prev.length < newPlayerCount) {
        return [...prev, ''];
      }
      return prev.slice(0, newPlayerCount);
    });
    setErrors(prev => {
      if (prev.length === newPlayerCount) return prev;
      if (prev.length < newPlayerCount) {
        return [...prev, false];
      }
      return prev.slice(0, newPlayerCount);
    });
  }, [mode]);

  // Validate input length >= 3
  const validateInput = (value: string) => value.length >= 3;

  // Check if all required inputs are valid
  const isFormValid = () => {
    const requiredCount = mode === '3er' ? 3 : 4;
    return players.slice(0, requiredCount).every(player => validateInput(player));
  };

  // Handle input change with validation
  const handleInputChange = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);

    const newErrors = [...errors];
    newErrors[index] = value.length > 0 && !validateInput(value);
    setErrors(newErrors);
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      alert('All players must have at least 3 characters');
      return;
    }
  
    try {
      // Create new list in storage and get the new list with its ID
      const totalGames = getTotalGames();
      const finalPlayers = players.map((player, index) => 
        player || `Player ${index + 1}`
      );
      
      // Get the newly created list which includes its ID
      const newList = await StorageManager.createList(finalPlayers, mode, totalGames);
      
      // Navigate to list page WITH the listId
      router.push(
        `/list/${mode}?players=${encodeURIComponent(JSON.stringify(finalPlayers))}` +
        `&totalGames=${totalGames}&listId=${newList.id}`
      );
    } catch (error) {
      console.error('Error creating list:', error);
      alert('Failed to create list. Please try again.');
    }
};

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-center">Player Setup</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4">
        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setMode('3er')}
            className={`p-4 rounded-lg flex items-center justify-center gap-2 transition-all
              ${mode === '3er' 
                ? 'bg-blue-500 text-white shadow-md scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Triangle className="w-5 h-5" />
            3er
          </button>

          <button
            onClick={() => setMode('4er')}
            className={`p-4 rounded-lg flex items-center justify-center gap-2 transition-all
              ${mode === '4er' 
                ? 'bg-blue-500 text-white shadow-md scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Square className="w-5 h-5" />
            4er
          </button>
        </div>

        {/* List Size Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            List Size
          </label>
          <select
            value={selectedFraction}
            onChange={(e) => setSelectedFraction(Number(e.target.value))}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LIST_FRACTIONS.map((fraction) => (
              <option key={fraction.value} value={fraction.value}>
                {fraction.label} - {Math.floor((mode === '3er' ? 36 : 48) * fraction.value)} games
              </option>
            ))}
          </select>
        </div>

        {/* Total Games Display */}
        <div className="text-center mb-6">
          <span className="text-sm text-gray-600">Total Games:</span>
          <span className="ml-2 font-medium">{getTotalGames()}</span>
        </div>

        {/* Player Inputs */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 max-w-md mx-auto">
            {players.slice(0, mode === '3er' ? 3 : 4).map((player, index) => (
              <div key={index} className="relative">
                <input
                  type="text"
                  value={player}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder={`Player ${index + 1}`}
                  className={`w-full p-3 rounded-lg border ${
                    errors[index]
                      ? 'border-red-500 bg-red-50'
                      : player && validateInput(player)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors[index] && (
                  <p className="text-red-500 text-sm mt-1">
                    Minimum 3 characters required
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            onClick={() => router.push('/')}
            className="p-4 bg-red-500 text-white rounded-lg flex items-center justify-center gap-2
                     hover:bg-red-600 active:bg-red-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className={`p-4 rounded-lg flex items-center justify-center gap-2 transition-colors
              ${isFormValid()
                ? 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            Start List
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </main>
  );
}