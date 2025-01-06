// src/services/skatApi.ts

import { ApiResponse } from "types";

interface UpdatePointsParams {
  playerId: number;
  seriesId: string;
  tischId?: string;
  totalPoints: number;
  wonGames: number;
  lostGames: number;
}

export const updatePlayerPoints = async ({
  playerId,
  seriesId,
  tischId,
  totalPoints,
  wonGames,
  lostGames
}: UpdatePointsParams): Promise<ApiResponse> => {
  try {
    const response = await fetch('/update_player_points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId,
        seriesId,
        total_points: totalPoints,
        won_games: wonGames,
        lost_games: lostGames
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update points');
    }
    
    return await response.json();
  } catch (err) {
    console.error('API Error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    };
  }
};