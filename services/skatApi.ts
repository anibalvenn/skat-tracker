// src/services/skatApi.ts

import { ApiResponse } from "types";
import { getApiBase } from "./managerApi";

interface UpdatePointsParams {
  playerId: number;       // real PlayerID (already mapped from index before calling)
  seriesId: string;
  tischId?: string;
  totalPoints: number;
  basePoints?: number;    // sent as table_points (Tisch Points column in manager)
  wonGames: number;
  lostGames: number;
  mode?: 'three' | 'four'; // selects the correct manager endpoint
}

export const updatePlayerPoints = async ({
  playerId,
  seriesId,
  tischId,
  totalPoints,
  basePoints,
  wonGames,
  lostGames,
  mode = 'three',
}: UpdatePointsParams): Promise<ApiResponse> => {
  try {
    const { baseUrl, apiKey } = await getApiBase();
    const endpoint = mode === 'four'
      ? '/api/update_four_player_points'
      : '/api/update_three_player_points';

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) headers['X-API-Key'] = apiKey;

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        playerId,
        seriesId,
        tischId,
        total_points: totalPoints,
        table_points: basePoints,
        won_games: wonGames,
        lost_games: lostGames,
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
