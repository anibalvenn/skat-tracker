"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plug, PlugZap, Trash2 } from 'lucide-react';
import {
  getManagerConfig,
  saveManagerConfig,
  clearManagerConfig,
  ManagerConfig,
} from '@/utils/storage';
import {
  fetchChampionships,
  fetchSeries,
  fetchTische,
  ChampionshipItem,
  SeriesItem,
  TischItem,
} from '@/services/managerApi';

export default function ConnectPage() {
  const router = useRouter();

  // Connection fields
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');

  // Dropdown data
  const [championships, setChampionships] = useState<ChampionshipItem[]>([]);
  const [seriesList, setSeriesList] = useState<SeriesItem[]>([]);
  const [tischeList, setTischeList] = useState<TischItem[]>([]);

  // Selected values
  const [selectedChamp, setSelectedChamp] = useState<ChampionshipItem | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<SeriesItem | null>(null);
  const [selectedTisch, setSelectedTisch] = useState<TischItem | null>(null);

  // UI state
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState('');
  const [connected, setConnected] = useState(false);

  // Load existing config on mount
  useEffect(() => {
    getManagerConfig().then(cfg => {
      if (!cfg) return;
      setUrl(cfg.url);
      setApiKey(cfg.apiKey);
      if (cfg.seriesId) {
        setConnected(true);
        // Re-fetch dropdowns so they render the saved selection
        const base = cfg.url.replace(/\/$/, '');
        fetchChampionships(base, cfg.apiKey).then(list => {
          setChampionships(list);
          const ch = list.find(c => c.id === cfg.championshipId) ?? null;
          setSelectedChamp(ch);
          if (ch) {
            fetchSeries(base, cfg.apiKey, ch.id).then(sl => {
              setSeriesList(sl);
              const sr = sl.find(s => s.id === cfg.seriesId) ?? null;
              setSelectedSeries(sr);
              if (sr) {
                fetchTische(base, cfg.apiKey, sr.id).then(tl => {
                  setTischeList(tl);
                  const ti = tl.find(t => t.id === cfg.tischId) ?? null;
                  setSelectedTisch(ti);
                });
              }
            });
          }
        }).catch(() => {});
      }
    });
  }, []);

  const normalizedUrl = url.replace(/\/$/, '');

  const handleTest = async () => {
    setTesting(true);
    setTestError('');
    setChampionships([]);
    setSeriesList([]);
    setTischeList([]);
    setSelectedChamp(null);
    setSelectedSeries(null);
    setSelectedTisch(null);
    try {
      const list = await fetchChampionships(normalizedUrl, apiKey);
      setChampionships(list);
    } catch (e: unknown) {
      setTestError(e instanceof Error ? e.message : 'Connection failed');
    } finally {
      setTesting(false);
    }
  };

  const handleChampChange = async (id: number) => {
    const ch = championships.find(c => c.id === id) ?? null;
    setSelectedChamp(ch);
    setSelectedSeries(null);
    setSelectedTisch(null);
    setSeriesList([]);
    setTischeList([]);
    if (!ch) return;
    try {
      const sl = await fetchSeries(normalizedUrl, apiKey, ch.id);
      setSeriesList(sl);
    } catch {
      setTestError('Failed to load series');
    }
  };

  const handleSeriesChange = async (id: number) => {
    const sr = seriesList.find(s => s.id === id) ?? null;
    setSelectedSeries(sr);
    setSelectedTisch(null);
    setTischeList([]);
    if (!sr) return;
    try {
      const tl = await fetchTische(normalizedUrl, apiKey, sr.id);
      setTischeList(tl);
    } catch {
      setTestError('Failed to load tische');
    }
  };

  const handleTischChange = (id: number) => {
    const ti = tischeList.find(t => t.id === id) ?? null;
    setSelectedTisch(ti);
  };

  const canSave = selectedChamp && selectedSeries && selectedTisch;

  const handleSave = async () => {
    if (!canSave) return;
    const cfg: ManagerConfig = {
      url: normalizedUrl,
      apiKey,
      championshipId: selectedChamp!.id,
      championshipName: selectedChamp!.name,
      seriesId: selectedSeries!.id,
      seriesName: selectedSeries!.name,
      tischId: selectedTisch!.id,
      tischName: selectedTisch!.name,
      players: selectedTisch!.players,
    };
    await saveManagerConfig(cfg);
    setConnected(true);
  };

  const handleDisconnect = async () => {
    await clearManagerConfig();
    setConnected(false);
    setChampionships([]);
    setSeriesList([]);
    setTischeList([]);
    setSelectedChamp(null);
    setSelectedSeries(null);
    setSelectedTisch(null);
    setUrl('');
    setApiKey('');
  };

  return (
    <main className="min-h-[calc(100dvh-50px)] flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex items-center gap-3">
        <button onClick={() => router.push('/')} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex-1">Connect to Manager</h1>
        {connected && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            Connected
          </span>
        )}
      </header>

      <div className="flex-1 p-4 space-y-4 max-w-md mx-auto w-full">
        {/* URL input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Manager URL</label>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="http://192.168.1.10:5000"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* API Key (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Leave empty if no key set"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Test button */}
        <button
          onClick={handleTest}
          disabled={!url || testing}
          className={`w-full p-3 rounded-lg flex items-center justify-center gap-2 transition-colors
            ${url && !testing
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          <Plug className="w-4 h-4" />
          {testing ? 'Testing…' : 'Test Connection'}
        </button>

        {testError && (
          <p className="text-red-500 text-sm">{testError}</p>
        )}

        {/* Cascading dropdowns */}
        {championships.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Championship</label>
            <select
              value={selectedChamp?.id ?? ''}
              onChange={e => handleChampChange(Number(e.target.value))}
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— select —</option>
              {championships.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {seriesList.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Series</label>
            <select
              value={selectedSeries?.id ?? ''}
              onChange={e => handleSeriesChange(Number(e.target.value))}
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— select —</option>
              {seriesList.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {tischeList.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tisch</label>
            <select
              value={selectedTisch?.id ?? ''}
              onChange={e => handleTischChange(Number(e.target.value))}
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— select —</option>
              {tischeList.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Players preview */}
        {selectedTisch && selectedTisch.players.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Players at this Tisch</p>
            <ul className="space-y-1">
              {selectedTisch.players.map((p, i) => (
                <li key={p.id} className="text-sm text-gray-600">
                  <span className="font-mono text-gray-400 mr-2">{i + 1}.</span>{p.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Save / Disconnect */}
        <div className="flex gap-3 pt-2">
          {canSave && (
            <button
              onClick={handleSave}
              className="flex-1 p-3 bg-green-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-green-600"
            >
              <PlugZap className="w-4 h-4" />
              Save
            </button>
          )}
          {connected && (
            <button
              onClick={handleDisconnect}
              className="flex-1 p-3 bg-red-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4" />
              Disconnect
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
