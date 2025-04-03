// src/hooks/useBackButton.ts
import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useRouter } from 'next/navigation';

interface BackButtonOptions {
  backPaths?: Record<string, string>;
  exitPaths?: string[];
  showExitPrompt?: boolean;
}

/**
 * Custom hook to handle Android back button presses
 * 
 * @param options Configuration options for back button behavior
 * - backPaths: Map of current paths to destination paths for back navigation
 * - exitPaths: Paths where back button should show exit prompt (typically home screen)
 * - showExitPrompt: Whether to show an exit confirmation prompt on exit paths
 */
export function useBackButton({
  backPaths = {},
  exitPaths = ['/'],
  showExitPrompt = true
}: BackButtonOptions = {}) {
  const router = useRouter();

  useEffect(() => {
    // Initialize the back button listener
    const initBackButton = async () => {
      await App.addListener('backButton', ({ canGoBack }) => {
        // Get current path (without query parameters)
        const currentPath = window.location.pathname;

        // If we have a specific back path for this route, navigate to it
        if (backPaths[currentPath]) {
          router.push(backPaths[currentPath]);
          return;
        }

        // If we're on an exit path (like home screen), show exit prompt or exit
        if (exitPaths.includes(currentPath)) {
          if (showExitPrompt) {
            const wantToExit = window.confirm('Do you want to exit the app?');
            if (wantToExit) {
              App.exitApp();
            }
          } else {
            App.exitApp();
          }
          return;
        }

        // Default behavior: go back if possible, otherwise go to home
        if (canGoBack) {
          window.history.back();
        } else {
          router.push('/');
        }
      });
    };

    initBackButton();

    // Clean up listener when component unmounts
    return () => {
      App.removeAllListeners();
    };
  }, [router, backPaths, exitPaths, showExitPrompt]);
}