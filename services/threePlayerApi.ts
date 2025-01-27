import { Game, ApiResponse } from "../types";


interface UpdateThreePlayerPointsParams {
  playerId: number;
  seriesId: string;
  tischId?: string;
  game: Game;
  totalPoints: number;
  wonGames: number;
  lostGames: number;
}

class ThreePlayerApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'ThreePlayerApiError';
  }
}

export const updateThreePlayerPoints = async ({
  playerId,
  seriesId,
  tischId,
  game,
  totalPoints,
  wonGames,
  lostGames
}: UpdateThreePlayerPointsParams): Promise<ApiResponse> => {
  try {
    // Validate game data
    if (game.player === null) {
      throw new ThreePlayerApiError('Invalid game data: No player specified');
    }

    // Special validation for 3-player mode
    if (game.played && !game.gameType) {
      throw new ThreePlayerApiError('Invalid game data: No game type specified');
    }

    const response = await fetch('/api/update_three_player_points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId,
        seriesId,
        tischId,
        game_data: {
          game_number: game.gameNumber,
          dealer: game.dealer,
          player: game.player,
          game_type: game.gameType,
          modifiers: {
            hand: game.hand,
            schneider: game.schneider,
            schwarz: game.schwarz,
            ouvert: game.ouvert,
            schneider_announced: game.schneiderAnnounced,
            schwarz_announced: game.schwarzAnnounced
          },
          mit_ohne: game.mitOhne,
          multiplier: game.multiplier,
          won: game.won
        },
        total_points: totalPoints,
        won_games: wonGames,
        lost_games: lostGames
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ThreePlayerApiError(
        'Failed to update points',
        response.status.toString(),
        errorData
      );
    }
    
    return await response.json();
  } catch (err) {
    console.error('API Error:', err);
    
    if (err instanceof ThreePlayerApiError) {
      throw err;
    }
    
    throw new ThreePlayerApiError(
      err instanceof Error ? err.message : 'Unknown error occurred'
    );
  }
};

export const getThreePlayerGameHistory = async (
  seriesId: string,
  tischId?: string
): Promise<Game[]> => {
  try {
    const response = await fetch(
      `/api/three_player_games?seriesId=${seriesId}${tischId ? `&tischId=${tischId}` : ''}`
    );
    
    if (!response.ok) {
      throw new ThreePlayerApiError('Failed to fetch game history');
    }
    
    return await response.json();
  } catch (err) {
    console.error('Error fetching game history:', err);
    throw new ThreePlayerApiError(
      'Failed to load game history. Please try again later.'
    );
  }
};