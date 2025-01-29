// src/types/skat.types.ts

// Game types and enums
// src/types/index.ts

// Game types and enums
export type GameType = '♣' | '♠' | '♥' | '♦' | 'G' | 'N' | 'eingepasst';
export type MitOhneType = 'mit' | 'ohne' | null;  // Changed from undefined to null

export interface Game {
  gameNumber: number;
  dealer: number;
  player: number | null;
  gameType: GameType | '';
  hand: boolean;
  schneider: boolean;
  schwarz: boolean;
  played: boolean;
  won: boolean;
  points?: number;
  mitOhne: MitOhneType;
  multiplier: number;
  ouvert: boolean;
  schneiderAnnounced: boolean;
  schwarzAnnounced: boolean;
  isEditing: boolean;
}


export interface PlayerCount {
  wonCount: number;
  lostCount: number;
  basePoints: number;
  totalPoints: number;
}

// API related interfaces
export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface PlayerResult {
  playerId: number;
  seriesId: string;
  tischId?: string;
  totalPoints: number;
  wonGames: number;
  lostGames: number;
}

// Component props interfaces
export interface SkatListProps {
  numPlayers?: number;
  players?: string[];
  totalGames?: number;
  seriesId?: string | null;
  tischId?: string | null;
}

export interface GameStateProps {
  numPlayers: number;
  totalGames: number;
  seriesId: string | null;
  tischId: string | null;
}

// Scoring related interfaces
export interface ScoringModifiers {
  hand: boolean;
  schneider: boolean;
  schwarz: boolean;
  schneiderAnnounced?: boolean;
  schwarzAnnounced?: boolean;
}

export interface GameScore {
  basePoints: number;
  multiplier: number;
  totalPoints: number;
  modifiers: ScoringModifiers;
}

// State management interfaces
export interface GameAction {
  type: string;
  payload?: any;
}

export interface GameState {
  currentGame: Game;
  games: Game[];
  playerCounts: PlayerCount[];
  totalScore: number;
}

export interface MitOhneSelectionProps {
  currentGame: Game;
  setCurrentGame: React.Dispatch<React.SetStateAction<Game>>;
  handleGameComplete: () => Promise<void>;
  onBack: () => void;
  isEditing: boolean;
  isThreePlayerMode?: boolean;
}