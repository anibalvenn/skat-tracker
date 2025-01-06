// src/types/skat.types.ts

// Game types and enums
export type GameType = '♣' | '♠' | '♥' | '♦' | 'G' | 'N' | 'eingepasst';

// Core game state interfaces
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
}

export interface PlayerCount {
  wonCount: number;
  lostCount: number;
  points: number;
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