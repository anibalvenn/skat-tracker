// services/managerApi.ts — HTTP client for the skat-manager integration API

import { getManagerConfig } from '@/utils/storage';

export interface ChampionshipItem {
  id: number;
  name: string;
  acronym: string;
}

export interface SeriesItem {
  id: number;
  name: string;
  is_open?: boolean;
}

export interface TischPlayer {
  id: number;
  name: string;
}

export interface TischItem {
  id: number;
  name: string;
  players: TischPlayer[];
}

async function buildHeaders(baseUrl: string, apiKey: string): Promise<HeadersInit> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['X-API-Key'] = apiKey;
  return headers;
}

export async function fetchChampionships(url: string, apiKey: string): Promise<ChampionshipItem[]> {
  const headers = await buildHeaders(url, apiKey);
  const res = await fetch(`${url}/api/championships`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchSeries(url: string, apiKey: string, championshipId: number): Promise<SeriesItem[]> {
  const headers = await buildHeaders(url, apiKey);
  const res = await fetch(`${url}/api/series/${championshipId}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchTische(url: string, apiKey: string, seriesId: number): Promise<TischItem[]> {
  const headers = await buildHeaders(url, apiKey);
  const res = await fetch(`${url}/api/tische/${seriesId}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Convenience: load config then test connectivity by fetching championships */
export async function testConnection(url: string, apiKey: string): Promise<ChampionshipItem[]> {
  return fetchChampionships(url.replace(/\/$/, ''), apiKey);
}

/** Returns connection base from saved config. */
export async function getApiBase(): Promise<{ baseUrl: string; apiKey: string; pin: string }> {
  const cfg = await getManagerConfig();
  return { baseUrl: cfg?.url ?? '', apiKey: cfg?.apiKey ?? '', pin: cfg?.pin ?? '' };
}

// ── Ranking / table endpoints ─────────────────────────────────────────────────

export interface SeriesRankingItem {
  rank: number;
  player_id: number;
  player_name: string;
  total_points: number;
  won_games: number | null;
  lost_games: number | null;
  table_points: number | null;
}

export interface ChampionshipRankingItem {
  rank: number;
  player_id: number;
  player_name: string;
  total_points: number;
  series_points: Record<number, number>;
}

export interface SeriesTablePlayer {
  id: number;
  name: string;
  total_points: number | null;
  won_games: number | null;
  lost_games: number | null;
  table_points: number | null;
}

export interface SeriesTableItem {
  id: number;
  name: string;
  players: SeriesTablePlayer[];
}

export async function fetchSeriesRanking(url: string, apiKey: string, seriesId: number): Promise<SeriesRankingItem[]> {
  const headers = await buildHeaders(url, apiKey);
  const res = await fetch(`${url}/api/series_ranking?series_id=${seriesId}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchChampionshipRanking(url: string, apiKey: string, championshipId: number): Promise<ChampionshipRankingItem[]> {
  const headers = await buildHeaders(url, apiKey);
  const res = await fetch(`${url}/api/championship_ranking?championship_id=${championshipId}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchSeriesTables(url: string, apiKey: string, seriesId: number): Promise<SeriesTableItem[]> {
  const headers = await buildHeaders(url, apiKey);
  const res = await fetch(`${url}/api/series_tables?series_id=${seriesId}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
