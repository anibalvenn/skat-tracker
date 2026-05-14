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

/** Returns { baseUrl, apiKey } from saved config, or empty strings if none. */
export async function getApiBase(): Promise<{ baseUrl: string; apiKey: string }> {
  const cfg = await getManagerConfig();
  return { baseUrl: cfg?.url ?? '', apiKey: cfg?.apiKey ?? '' };
}
