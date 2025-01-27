import { Game } from '../types';

interface GamePoints {
  basePoints: number;
  totalPoints: number;
  defendersPoints?: number;  // Points awarded to defenders when game is lost (40 in 3-player mode)
}

// Base points for different game types remain the same
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

// Updated game outcome modifiers for 3-player mode
const GAME_OUTCOME = {
  WIN_BONUS: 50,      // Points added when game is won
  LOSS_PENALTY: 50,   // Points subtracted when game is lost
  DEFENDER_BONUS: 40  // Points given to each defender in 3-player mode (changed from 30)
};

export const calculateThreePlayerNullPoints = (game: Game): GamePoints => {
  let basePoints = BASE_POINTS.NULL;
  
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
    // If game is lost, player loses double points plus loss penalty
    return {
      basePoints: -basePoints * 2,
      totalPoints: (-basePoints * 2) - GAME_OUTCOME.LOSS_PENALTY,
      defendersPoints: GAME_OUTCOME.DEFENDER_BONUS
    };
  }
};

export const calculateThreePlayerSuitPoints = (game: Game): GamePoints => {
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
    // If game is lost, player loses double points plus loss penalty
    return {
      basePoints: -gameValue * 2,
      totalPoints: (-gameValue * 2) - GAME_OUTCOME.LOSS_PENALTY,
      defendersPoints: GAME_OUTCOME.DEFENDER_BONUS  // 40 points for each defender in 3-player mode
    };
  }
};

export const calculateThreePlayerPoints = (game: Game): GamePoints => {
  if (!game.gameType || game.gameType === 'eingepasst' || !game.played) {
    return { basePoints: 0, totalPoints: 0, defendersPoints: 0 };
  }

  return game.gameType === 'N' ? 
    calculateThreePlayerNullPoints(game) : 
    calculateThreePlayerSuitPoints(game);
};