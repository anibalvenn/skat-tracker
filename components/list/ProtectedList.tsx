import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { validateListAccess } from '@/utils/validation';

interface ProtectedListProps {
  mode: '3er' | '4er';
  children: React.ReactNode;
}

const ProtectedList: React.FC<ProtectedListProps> = ({ mode, children }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Get and parse players data
    const playersParam = searchParams.get('players');
    let players: string[] = [];
    
    try {
      players = playersParam ? JSON.parse(decodeURIComponent(playersParam)) : [];
    } catch (error) {
      console.error('Error parsing players data:', error);
      router.replace('/setup');
      return;
    }

    // Validate access
    const validation = validateListAccess(players, mode);
    
    if (!validation.isValid) {
      // Show error message
      alert(validation.error);
      // Redirect to setup
      router.replace('/setup');
    }
  }, [mode, router, searchParams]);

  return <>{children}</>;
};

export default ProtectedList;