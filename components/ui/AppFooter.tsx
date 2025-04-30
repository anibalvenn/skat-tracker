'use client'

// src/components/ui/AppFooter.tsx
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import Chronometer from './Chronometer';
import { StorageManager, StoredList } from '@/utils/storage';

interface AppFooterProps {
  companyName?: string;
  logoUrl?: string;
}

// Custom hook to listen for list completion - optimized to only poll frequently on the last game
function useListCompletion() {
  const [isListJustCompleted, setIsListJustCompleted] = useState(false);
  const [completedList, setCompletedList] = useState<StoredList | null>(null);
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const previousStatusRef = useRef<string>('');
  
  useEffect(() => {
    // Check if we're on a list page
    if (!pathName.includes('/list/')) return;
    
    // Get list ID from URL if available
    const listIdParam = searchParams.get('listId');
    if (!listIdParam) return;
    
    const listId = parseInt(listIdParam, 10);
    let checkInterval: NodeJS.Timeout;
    let slowCheckInterval: NodeJS.Timeout;
    
    // Function to check list status
    const checkListStatus = async () => {
      try {
        const allLists = await StorageManager.getAllLists();
        const list = allLists.find(l => l.id === listId);
        
        if (!list) return;
        
        // Check if status just changed to completed
        if (previousStatusRef.current === 'in_progress' && list.status === 'completed') {
          console.log('List just completed! Showing animation.', list);
          setIsListJustCompleted(true);
          setCompletedList(list);
          
          // Reset after a short delay
          setTimeout(() => {
            setIsListJustCompleted(false);
          }, 6000); // Slightly longer than confetti duration
          
          // Clear both intervals since we detected completion
          if (checkInterval) clearInterval(checkInterval);
          if (slowCheckInterval) clearInterval(slowCheckInterval);
        }
        
        previousStatusRef.current = list.status;
        
        // Check if this is the last game - if so, start frequent polling
        if (list.status === 'in_progress') {
          const isOnLastGame = list.playedGames >= list.totalGames - 1;
          
          if (isOnLastGame && !checkInterval) {
            // We're on the last game - start frequent polling
            console.log('Last game detected - starting frequent polling');
            checkInterval = setInterval(checkListStatus, 200);
          } else if (!isOnLastGame && checkInterval) {
            // We were on the last game but aren't anymore
            console.log('No longer on last game - stopping frequent polling');
            clearInterval(checkInterval);
            checkInterval = undefined;
          }
        }
      } catch (error) {
        console.error('Error checking list status:', error);
      }
    };
    
    // Get initial status
    const initStatus = async () => {
      const allLists = await StorageManager.getAllLists();
      const list = allLists.find(l => l.id === listId);
      if (list) {
        previousStatusRef.current = list.status;
        
        // If already completed, set the completed list
        if (list.status === 'completed') {
          setCompletedList(list);
        }
        
        // Check if this is the last game - if so, start frequent polling
        if (list.status === 'in_progress') {
          const isOnLastGame = list.playedGames >= list.totalGames - 1;
          
          if (isOnLastGame) {
            // We're on the last game - start frequent polling
            console.log('Last game detected - starting frequent polling');
            checkInterval = setInterval(checkListStatus, 200);
          }
        }
      }
    };
    
    initStatus();
    
    // Always maintain a slow check interval for general updates
    slowCheckInterval = setInterval(checkListStatus, 2000);
    
    return () => {
      // Clean up all intervals
      if (checkInterval) clearInterval(checkInterval);
      if (slowCheckInterval) clearInterval(slowCheckInterval);
      
      // Reset everything when unmounting or changing pages
      setIsListJustCompleted(false);
      setCompletedList(null);
      previousStatusRef.current = '';
    };
  }, [pathName, searchParams]);
  
  return { isListJustCompleted, completedList };
}

const AppFooter: React.FC<AppFooterProps> = ({
  companyName = "Bali Code",
  logoUrl = "/logo_bali_code.jpg",
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentList, setCurrentList] = useState<StoredList | null>(null);
  const { isListJustCompleted, completedList } = useListCompletion();
  
  // Determine if we're on a list page and get the listId
  const isListPage = pathname.includes('/list/');
  const listIdParam = searchParams.get('listId');
  const currentListId = listIdParam ? parseInt(listIdParam, 10) : null;
  
  // Fetch current list data when on a list page
  useEffect(() => {
    if (!isListPage) {
      setCurrentList(null);
      return;
    }
    
    // Reset when URL changes
    setCurrentList(null);
    
    const fetchListData = async () => {
      try {
        let list: StoredList | null = null;
        
        if (currentListId) {
          // If listId is in URL, fetch that specific list
          const allLists = await StorageManager.getAllLists();
          list = allLists.find(l => l.id === currentListId) || null;
        } else {
          // Otherwise, try to get the current in-progress list
          list = await StorageManager.getCurrentList();
        }
        
        // Update only if the list ID matches our current view
        if (list && (!currentListId || list.id === currentListId)) {
          setCurrentList(list);
        }
      } catch (error) {
        console.error('Error fetching list data for chronometer:', error);
      }
    };
    
    fetchListData();
    
    // Poll for updates
    const intervalId = setInterval(fetchListData, 2000);
    
    return () => clearInterval(intervalId);
  }, [pathname, isListPage, currentListId]);
  
  // Determine which list to show based on current context
  const listToShow = isListJustCompleted && completedList ? completedList : currentList;
  
  return (
    <footer className="w-full border-t border-gray-200 h-10 flex items-center">
      {/* Left side with chronometer */}
      <div className="w-1/3 h-full flex items-center justify-center">
        {isListPage && listToShow && listToShow.startTime && (
          <div className={`transform scale-105 transition-all duration-500 ${
            isListJustCompleted ? 'scale-125' : ''
          }`}>
            <Chronometer 
              startTime={listToShow.startTime}
              endTime={listToShow.endTime}
              isCompleted={listToShow.status === 'completed'}
              isJustCompleted={isListJustCompleted}
            />
          </div>
        )}
      </div>

      {/* Right side with logo */}
      <div className="w-2/3 bg-white h-full flex items-center justify-end px-4">
        <div className="flex items-center gap-2">
          {logoUrl && (
            <div className="relative w-7 h-7 flex-shrink-0">
              <Image
                src={logoUrl}
                alt={`${companyName} logo`}
                fill
                className="object-contain"
              />
            </div>
          )}
          <span className="text-gray-500">© {new Date().getFullYear()} {companyName}</span>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;