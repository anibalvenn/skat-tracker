// src/utils/skatScoring.ts
import { Game, GameScore } from '../types';

interface GamePoints {
  basePoints: number;
  totalPoints: number;
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

// Game outcome modifiers
const GAME_OUTCOME = {
  WIN_BONUS: 50,
  LOSS_PENALTY: -50
};

export const calculateNullPoints = (game: Game): GamePoints => {
  let basePoints = BASE_POINTS.NULL;
  
  // Determine base points for the Null game
  if (game.hand && game.ouvert) {
    basePoints = BASE_POINTS.NULL_HAND_OUVERT;
  } else if (game.hand) {
    basePoints = BASE_POINTS.NULL_HAND;
  } else if (game.ouvert) {
    basePoints = BASE_POINTS.NULL_OUVERT;
  }

  // Calculate total points including win/loss bonus/penalty
  const totalWithBonus = game.won ? 
    basePoints + GAME_OUTCOME.WIN_BONUS : 
    (-basePoints * 2) + GAME_OUTCOME.LOSS_PENALTY;

  return {
    basePoints: game.won ? basePoints : -basePoints * 2,
    totalPoints: totalWithBonus
  };
};

export const calculateSuitPoints = (game: Game): GamePoints => {
  let basePoints = 0;
  
  // Determine base points for suit games
  switch (game.gameType) {
    case '♣':
      basePoints = BASE_POINTS.CLUBS;
      break;
    case '♠':
      basePoints = BASE_POINTS.SPADES;
      break;
    case '♥':
      basePoints = BASE_POINTS.HEARTS;
      break;
    case '♦':
      basePoints = BASE_POINTS.DIAMONDS;
      break;
    case 'G':
      basePoints = BASE_POINTS.GRAND;
      break;
  }

  // Calculate multiplier
  let multiplier = game.multiplier || 1;
  if (game.hand) multiplier++;
  if (game.schneider) multiplier++;
  if (game.schneiderAnnounced) multiplier++;
  if (game.schwarz) multiplier++;
  if (game.schwarzAnnounced) multiplier++;
  if (game.ouvert) multiplier++;

  const gameValue = basePoints * multiplier;
  const totalWithBonus = game.won ? 
    gameValue + GAME_OUTCOME.WIN_BONUS : 
    (-gameValue * 2) + GAME_OUTCOME.LOSS_PENALTY;

  return {
    basePoints: game.won ? gameValue : -gameValue * 2,
    totalPoints: totalWithBonus
  };
};

export const calculatePoints = (game: Game): GamePoints => {
  if (!game.gameType || game.gameType === 'eingepasst' || !game.played) {
    return { basePoints: 0, totalPoints: 0 };
  }

  return game.gameType === 'N' ? 
    calculateNullPoints(game) : 
    calculateSuitPoints(game);
};