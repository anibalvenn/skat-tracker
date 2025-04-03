// src/components/providers/BackButtonProvider.tsx
import { useBackButton } from 'hooks/useBackButton';
import React from 'react';

interface BackButtonProviderProps {
  children: React.ReactNode;
}

export function BackButtonProvider({ children }: BackButtonProviderProps) {
  // Define navigation paths for back button
  useBackButton({
    // Map current paths to where back button should navigate
    backPaths: {
      '/list/3er': '/yourlists',
      '/list/4er': '/yourlists',
      '/setup': '/',
      '/yourlists': '/',
    },
    // Paths where back button should prompt to exit app
    exitPaths: ['/'],
    // Show confirmation before exiting
    showExitPrompt: true
  });

  return <>{children}</>;
}

export default BackButtonProvider;