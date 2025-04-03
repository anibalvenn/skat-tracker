// src/hooks/useHistoryState.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook to manage browser history state for preventing immediate app exit
 * Ensures 'back' navigation works properly with confirmation where needed
 */
export function useHistoryState(confirmExit: boolean = false) {
  const router = useRouter();

  useEffect(() => {
    // Push current route to history stack again to create a duplicate entry
    // This way when back is pressed, we're still on the same page
    window.history.pushState(null, '', window.location.href);

    // Listen for popstate (back button) events
    const handlePopState = (event: PopStateEvent) => {
      // Cancel the navigation
      event.preventDefault();
      
      // If confirmation is needed, ask before proceeding
      if (confirmExit) {
        const shouldExit = window.confirm('Are you sure you want to go back?');
        if (shouldExit) {
          router.back();
        } else {
          // Re-add the history entry if user cancels
          window.history.pushState(null, '', window.location.href);
        }
      } else {
        // Add the history state back to prevent leaving the app immediately
        window.history.pushState(null, '', window.location.href);
        // Navigate programmatically
        router.back();
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router, confirmExit]);
}