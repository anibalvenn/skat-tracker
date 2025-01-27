// src/utils/fourPlayerScoring.ts
import { Game } from '../types';

interface GamePoints {
  basePoints: number;
  totalPoints: number;
  defendersPoints?: number;  // Points awarded to defenders when game is lost (30 in 4-player mode)
}

// Base points for different game types
const BASE_POINTS = {
  CLUBS: 12,
  SPADES: 11,
  HEARTS: 10,
  DIAMONDS: 9,
  GRAND: 24,
  NULL: 23,
  NULL_HAND: 35,
  NULL_OUVERT: 46,
  NULL_HAND_OUVERT: 59
};

const SUIT_GRAND_BASE = {
  '♦': 9,
  '♥': 10,
  '♠': 11,
  '♣': 12,
  'G': 24
};

// Game outcome modifiers for 4-player mode
const GAME_OUTCOME = {
  WIN_BONUS: 50,      // Points added when game is won
  LOSS_PENALTY: 50,   // Points subtracted when game is lost
  DEFENDER_BONUS: 30  // Points given to each defender in 4-player mode
};

export const calculateFourPlayerNullPoints = (game: Game): GamePoints => {
  let basePoints = BASE_POINTS.NULL;
  
  if (game.hand && game.ouvert) {
    basePoints = BASE_POINTS.NULL_HAND_OUVERT;
  } else if (game.hand) {
    basePoints = BASE_POINTS.NULL_HAND;
  } else if (game.ouvert) {
    basePoints = BASE_POINTS.NULL_OUVERT;
  }

  if (game.won) {
    return {
      basePoints: basePoints,
      totalPoints: basePoints + GAME_OUTCOME.WIN_BONUS,
      defendersPoints: 0
    };
  } else {
    return {
      basePoints: -basePoints * 2,
      totalPoints: (-basePoints * 2) - GAME_OUTCOME.LOSS_PENALTY,
      defendersPoints: GAME_OUTCOME.DEFENDER_BONUS
    };
  }
};

export const calculateFourPlayerSuitPoints = (game: Game): GamePoints => {
  if (!game.gameType || game.gameType === 'N' || game.gameType === 'eingepasst') {
    return { basePoints: 0, totalPoints: 0, defendersPoints: 0 };
  }

  const basePoints = SUIT_GRAND_BASE[game.gameType as keyof typeof SUIT_GRAND_BASE] || 0;
  let multiplier = 1;
  multiplier += (game.multiplier || 1);

  if (game.hand) multiplier++;
  if (game.schneider) multiplier++;
  if (game.schneiderAnnounced) multiplier++;
  if (game.schwarz) multiplier++;
  if (game.schwarzAnnounced) multiplier++;
  if (game.ouvert) multiplier++;

  const gameValue = basePoints * multiplier;

  if (game.won) {
    return {
      basePoints: gameValue,
      totalPoints: gameValue + GAME_OUTCOME.WIN_BONUS,
      defendersPoints: 0
    };
  } else {
    return {
      basePoints: -gameValue * 2,
      totalPoints: (-gameValue * 2) - GAME_OUTCOME.LOSS_PENALTY,
      defendersPoints: GAME_OUTCOME.DEFENDER_BONUS
    };
  }
};

export const calculateFourPlayerPoints = (game: Game): GamePoints => {
  if (!game.gameType || game.gameType === 'eingepasst' || !game.played) {
    return { basePoints: 0, totalPoints: 0, defendersPoints: 0 };
  }

  return game.gameType === 'N' ? 
    calculateFourPlayerNullPoints(game) : 
    calculateFourPlayerSuitPoints(game);
};