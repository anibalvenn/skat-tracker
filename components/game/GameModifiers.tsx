import React from 'react';
import { 
  Hand, 
  Scissors, 
  PaintBucket, 
  Eye, 
  Volume1
} from 'lucide-react';
import { Game, GameType } from '@/types/index';  // Import both Game and GameType

interface GameModifiersProps {
  currentGame: Game;
  setCurrentGame: React.Dispatch<React.SetStateAction<Game>>;
  handleGameComplete?: () => Promise<void>;  // Made optional since it's not used
}

type ModifierConfig = {
  key: keyof Game;
  label: string;
  icons: React.ElementType[];
  available: (gameType: GameType | '') => boolean;  // Updated to match Game type
};

const modifiers: ModifierConfig[] = [
  { 
    key: 'hand', 
    label: 'Hand', 
    icons: [Hand],
    available: () => true  // Hand is always available
  },
  { 
    key: 'schneider', 
    label: 'Schneider', 
    icons: [Scissors],
    available: (gameType) => gameType !== 'N'  // Not available in Null games
  },
  { 
    key: 'schwarz', 
    label: 'Schwarz', 
    icons: [PaintBucket],
    available: (gameType) => gameType !== 'N'  // Not available in Null games
  },
  { 
    key: 'ouvert', 
    label: 'Ouvert', 
    icons: [Eye],
    available: () => true  // Ouvert is always available
  },
  { 
    key: 'schneiderAnnounced', 
    label: 'Schn ang.', 
    icons: [Volume1, Scissors],
    available: (gameType) => gameType !== 'N'  // Not available in Null games
  },
  { 
    key: 'schwarzAnnounced', 
    label: 'Schw ang.', 
    icons: [Volume1, PaintBucket],
    available: (gameType) => gameType !== 'N'  // Not available in Null games
  }
];

export const GameModifiers: React.FC<GameModifiersProps> = ({ 
  currentGame, 
  setCurrentGame
}) => {
  // Filter modifiers based on game type
  const availableModifiers = modifiers.filter(mod => mod.available(currentGame.gameType));

  return (
    <div className="grid grid-cols-2 gap-1">
      {availableModifiers.map(({ key, label, icons }) => (
        <button
          key={key}
          onClick={() => {
            setCurrentGame(prev => ({
              ...prev,
              [key]: !prev[key]
            }));
          }}
          className={`p-1 rounded text-sm flex items-center justify-center gap-1 ${
            currentGame[key]
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300'
          }`}
        >
          <div className="flex items-center gap-0">
            {icons.map((Icon, index) => (
              <Icon key={index} className="w-3 h-3" />
            ))}
          </div>
          {label}
        </button>
      ))}
    </div>
  );
};