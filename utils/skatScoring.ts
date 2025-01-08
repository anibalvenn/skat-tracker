// src/utils/skatScoring.ts
import { Game, GameScore } from '../types';

interface GamePoints {
  basePoints: number;
  totalPoints: number;
  defendersPoints?: number;  // Points awarded to defenders when game is lost
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

// Base values for suit and grand games
const SUIT_GRAND_BASE = {
  '♦': 9,  // Diamonds (Karo)
  '♥': 10, // Hearts (Herz)
  '♠': 11, // Spades (Pik)
  '♣': 12, // Clubs (Kreuz)
  'G': 24  // Grand
};

// Game outcome modifiers
const GAME_OUTCOME = {
  WIN_BONUS: 50,     // Points added to winner when game is won
  DEFENDER_BONUS: 30 // Points given to each defender when they beat the player
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

  if (game.won) {
    // If game is won, player gets base points plus win bonus
    return {
      basePoints: basePoints,
      totalPoints: basePoints + GAME_OUTCOME.WIN_BONUS,
      defendersPoints: 0
    };
  } else {
    // If game is lost, player loses double points plus penalty and defenders get bonus
    return {
      basePoints: -basePoints * 2,
      totalPoints: (-basePoints * 2) - GAME_OUTCOME.WIN_BONUS, // Adding the -50 penalty
      defendersPoints: GAME_OUTCOME.DEFENDER_BONUS
    };
  }
};

export const calculateSuitPoints = (game: Game): GamePoints => {
  if (!game.gameType || game.gameType === 'N' || game.gameType === 'eingepasst') {
    return { basePoints: 0, totalPoints: 0, defendersPoints: 0 };
  }

  // Get base value for the game type
  const basePoints = SUIT_GRAND_BASE[game.gameType as keyof typeof SUIT_GRAND_BASE] || 0;
  
  // Start with base multiplier of 1 (minimum multiplier)
  let multiplier = 1;

  // Add the mit/ohne multiplier value from user input
  // This is in addition to the base multiplier of 1
  multiplier += (game.multiplier || 1);

  // Add modifiers (each adds 1 to multiplier)
  if (game.hand) multiplier++;
  if (game.schneider) multiplier++;
  if (game.schneiderAnnounced) multiplier++;
  if (game.schwarz) multiplier++;
  if (game.schwarzAnnounced) multiplier++;
  if (game.ouvert) multiplier++;

  // Calculate game value
  const gameValue = basePoints * multiplier;

  if (game.won) {
    // If game is won, player gets game value plus win bonus
    return {
      basePoints: gameValue,
      totalPoints: gameValue + GAME_OUTCOME.WIN_BONUS,
      defendersPoints: 0
    };
  } else {
    // If game is lost, player loses double points and defenders get bonus
    return {
      basePoints: -gameValue * 2,
      totalPoints: -gameValue * 2,
      defendersPoints: GAME_OUTCOME.DEFENDER_BONUS
    };
  }
};

export const calculatePoints = (game: Game): GamePoints => {
  if (!game.gameType || game.gameType === 'eingepasst' || !game.played) {
    return { basePoints: 0, totalPoints: 0, defendersPoints: 0 };
  }

  return game.gameType === 'N' ? 
    calculateNullPoints(game) : 
    calculateSuitPoints(game);
};