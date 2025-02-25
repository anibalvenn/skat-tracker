// src/components/game/CompletionFooter.tsx
import React from 'react';
import { FolderOpen, ListPlus, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
// Note: You'll need to install react-confetti:
// npm install react-confetti
import dynamic from 'next/dynamic';
import useWindowSize from 'hooks/useWindowSize';
const Confetti = dynamic(() => import('react-confetti'), {
  ssr: false
});

interface CompletionFooterProps {
  players: string[];
  listId?: number;
  totalGames: number;
  playedGames: number;
}

export const CompletionFooter: React.FC<CompletionFooterProps> = ({
  players,
  listId,
  totalGames,
  playedGames
}) => {
  const router = useRouter();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = React.useState(true);

  React.useEffect(() => {
    // Disable confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleViewLists = () => {
    router.push('/yourlists');
  };

  const handleNewList = () => {
    // Go to setup page with the same players pre-filled
    const playersParam = encodeURIComponent(JSON.stringify(players));
    router.push(`/setup?players=${playersParam}`);
  };

  return (
    <div className="bg-white border-t p-4">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Trophy className="w-12 h-12 mx-auto text-yellow-500" />
          <h2 className="text-xl font-bold">List Completed!</h2>
          <p className="text-gray-600">
            Congratulations! You've finished list #{listId}.
          </p>
          <p className="text-sm text-gray-500">
            {playedGames}/{totalGames} games completed
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleViewLists}
            className="p-4 bg-blue-500 text-white rounded-lg shadow-sm 
                     hover:bg-blue-600 active:bg-blue-700 transition-colors 
                     flex items-center justify-center gap-2"
          >
            <FolderOpen className="w-5 h-5" />
            Your Lists
          </button>
          
          <button
            onClick={handleNewList}
            className="p-4 bg-green-500 text-white rounded-lg shadow-sm 
                     hover:bg-green-600 active:bg-green-700 transition-colors 
                     flex items-center justify-center gap-2"
          >
            <ListPlus className="w-5 h-5" />
            New List
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionFooter;