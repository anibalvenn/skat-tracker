// src/utils/skatScoring.ts
import { Game, GameType } from '../types/index';

export const GAME_BASE_POINTS: Record<GameType | 'NH', number> = {
  '♣': 12,
  '♠': 11, 
  '♥': 10,
  '♦': 9,
  'G': 24,
  'N': 23,
  'NH': 35,
  'eingepasst': 0
};

interface ScoringModifiers {
  hand: boolean;
  schneider: boolean;
  schwarz: boolean;
}

export const calculatePoints = (game: Game): number => {
  if (!game.gameType || game.gameType === 'eingepasst') return 0;
  
  if (game.gameType === 'N') {
    return game.hand ? GAME_BASE_POINTS.NH : GAME_BASE_POINTS.N;
  }
  
  let points = GAME_BASE_POINTS[game.gameType];
  let multiplier = 1;
  
  if (game.hand) multiplier++;
  if (game.schneider) multiplier++;
  if (game.schwarz) multiplier++;
  
  return points * multiplier;
};