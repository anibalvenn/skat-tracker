'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StorageManager, StoredList } from '@/utils/storage';
import { Triangle, Square, Trash2, Edit, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';


export default function YourListsPage() {
  const router = useRouter();
  const [lists, setLists] = useState<StoredList[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load lists on mount
  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const storedLists = await StorageManager.getAllLists();
      setLists(storedLists);
    } catch (error) {
      console.error('Error loading lists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await StorageManager.deleteList(id);
      await loadLists(); // Refresh the list
    } catch (error) {
      console.error('Error deleting list:', error);
    }
    setDeleteId(null);
  };

  const handleOpen = (list: StoredList) => {
    const mode = list.mode;
    const playersParam = encodeURIComponent(JSON.stringify(list.players));
    console.log('Opening list with data:', {
      id: list.id,
      mode: list.mode,
      totalGames: list.totalGames,
      games: list.games
    });

    router.push(
      `/list/${mode}?players=${playersParam}&listId=${list.id}&totalGames=${list.totalGames}`
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl font-bold">Your Lists</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* List Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {lists.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Lists Found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Create a new list to get started.
            </p>
          </div>
        ) : (
          lists.map((list) => (
            <div
              key={list.id}
              className={`bg-white rounded-lg shadow-sm p-4 
                ${list.status === 'in_progress' ? 'ring-2 ring-green-500' : 
                  list.status === 'completed' ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {/* List ID with custom styling */}
                    <div className="flex-shrink-0 w-16 h-6 rounded-lg bg-gray-900 text-white 
                  flex flex-col items-center justify-center leading-tight">
                      <span className="text-lg font-bold">#{list.id}</span>
                    </div>

                    {/* Mode icon */}
                    {list.mode === '3er' ? (
                      <Triangle className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Square className="w-4 h-4 text-green-500" />
                    )}
                    <span className="text-sm text-gray-500">
                      {formatDate(list.date)}
                    </span>
                    
                    {/* Completed indicator */}
                    {list.status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="font-medium">
                    {list.players.join(' • ')}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className={`px-2 py-0.5 rounded-full text-xs 
                      ${list.status === 'in_progress'
                        ? 'bg-green-100 text-green-800'
                        : list.status === 'completed'
                          ? 'bg-blue-100 text-blue-800 font-medium'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                      {list.status === 'completed' 
                        ? 'Completed' 
                        : list.status === 'in_progress' 
                          ? 'In Progress'
                          : 'Abandoned'}
                    </span>
                    <div className={`flex items-center ${
                      list.status === 'completed' ? 'font-semibold' : ''
                    }`}>
                      <span>
                        {list.playedGames}/{list.totalGames} games
                      </span>
                      {list.status === 'completed' && (
                        <span className="ml-1 text-blue-600">
                          (100%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpen(list)}
                    className={`p-2 rounded-full ${
                      list.status === 'completed' 
                        ? 'text-blue-600 hover:bg-blue-100' 
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setDeleteId(list.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This list will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}