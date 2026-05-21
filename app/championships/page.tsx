"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plug, Trash2, Play, RefreshCw, PenLine, QrCode } from 'lucide-react';
import {
  getManagerConfig, saveManagerConfig, clearManagerConfig, ManagerConfig, StorageManager,
} from '@/utils/storage';
import {
  fetchChampionships, fetchSeries, fetchTische,
  fetchSeriesRanking, fetchChampionshipRanking, fetchSeriesTables,
  ChampionshipItem, SeriesItem, TischItem,
  SeriesRankingItem, ChampionshipRankingItem, SeriesTableItem,
} from '@/services/managerApi';

type View = 'connect' | 'setup_table' | 'hub';
type RankTab = 'tables' | 'series' | 'championship';

const FRACTIONS = [
  { label: 'Full list', value: 1 },
  { label: '3/4 list', value: 0.75 },
  { label: '2/3 list', value: 0.6667 },
  { label: '1/2 list', value: 0.5 },
  { label: '1/4 list', value: 0.25 },
  { label: '1/6 list', value: 0.1667 },
];

export default function ChampionshipsPage() {
  const router = useRouter();
  const [view, setView] = useState<View>('connect');

  // ── connect state ────────────────────────────────────────────────────────────
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState('');

  // ── table setup state ────────────────────────────────────────────────────────
  const [championships, setChampionships] = useState<ChampionshipItem[]>([]);
  const [seriesList, setSeriesList] = useState<SeriesItem[]>([]);
  const [tischeList, setTischeList] = useState<TischItem[]>([]);
  const [selectedChamp, setSelectedChamp] = useState<ChampionshipItem | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<SeriesItem | null>(null);
  const [selectedTisch, setSelectedTisch] = useState<TischItem | null>(null);
  const [pin, setPin] = useState('');
  const [tableError, setTableError] = useState('');
  const [savingTable, setSavingTable] = useState(false);

  // ── hub state ────────────────────────────────────────────────────────────────
  const [cfg, setCfg] = useState<ManagerConfig | null>(null);
  const [fraction, setFraction] = useState(1);

  // ── rankings state ───────────────────────────────────────────────────────────
  const [rankTab, setRankTab] = useState<RankTab>('tables');
  const [rankLoading, setRankLoading] = useState(false);
  const [rankError, setRankError] = useState('');
  const [tables, setTables] = useState<SeriesTableItem[]>([]);
  const [seriesRanking, setSeriesRanking] = useState<SeriesRankingItem[]>([]);
  const [champRanking, setChampRanking] = useState<ChampionshipRankingItem[]>([]);
  const [allSeries, setAllSeries] = useState<SeriesItem[]>([]);
  const [tablesSeriesId, setTablesSeriesId] = useState<number | null>(null);
  const [scanning, setScanning] = useState(false);

  // ── on mount: restore state from storage ────────────────────────────────────
  useEffect(() => {
    getManagerConfig().then(saved => {
      if (!saved) { setView('connect'); return; }
      setUrl(saved.url);
      setApiKey(saved.apiKey);
      if (saved.seriesId) {
        setCfg(saved);
        setView('hub');
      } else {
        // Connected but no table — reload championships
        fetchChampionships(saved.url, saved.apiKey)
          .then(list => setChampionships(list))
          .catch(() => {});
        setView('setup_table');
      }
    });
  }, []);

  // ── connect ──────────────────────────────────────────────────────────────────
  const normalizedUrl = url.replace(/\/$/, '');

  const handleConnect = async () => {
    setConnecting(true);
    setConnectError('');
    try {
      const list = await fetchChampionships(normalizedUrl, apiKey);
      setChampionships(list);
      await saveManagerConfig({
        url: normalizedUrl, apiKey,
        championshipId: null, championshipName: '',
        seriesId: null, seriesName: '',
        tischId: null, tischName: '',
        pin: '', players: [],
      });
      setView('setup_table');
    } catch (e) {
      setConnectError(e instanceof Error ? e.message : 'Connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const startScan = async () => {
    setScanning(true);
    const { Html5Qrcode } = await import('html5-qrcode');
    const scanner = new Html5Qrcode('qr-reader');
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText: string) => {
          scanner.stop().then(() => {
            setUrl(decodedText.replace(/\/$/, ''));
            setScanning(false);
          });
        },
        () => {}
      );
    } catch {
      setScanning(false);
    }
  };

  const handleDisconnect = async () => {
    await clearManagerConfig();
    setUrl(''); setApiKey('');
    setChampionships([]); setSeriesList([]); setTischeList([]);
    setSelectedChamp(null); setSelectedSeries(null); setSelectedTisch(null);
    setPin(''); setCfg(null);
    setAllSeries([]); setTablesSeriesId(null);
    setView('connect');
  };

  // ── table setup ──────────────────────────────────────────────────────────────
  const handleChampChange = async (id: number) => {
    const ch = championships.find(c => c.id === id) ?? null;
    setSelectedChamp(ch);
    setSelectedSeries(null); setSelectedTisch(null);
    setSeriesList([]); setTischeList([]);
    if (!ch) return;
    try {
      const sl = await fetchSeries(normalizedUrl, apiKey, ch.id);
      setSeriesList(sl);
    } catch { setTableError('Failed to load series'); }
  };

  const handleSeriesChange = async (id: number) => {
    const sr = seriesList.find(s => s.id === id) ?? null;
    setSelectedSeries(sr);
    setSelectedTisch(null); setTischeList([]);
    if (!sr) return;
    try {
      const tl = await fetchTische(normalizedUrl, apiKey, sr.id);
      setTischeList(tl);
    } catch { setTableError('Failed to load tische'); }
  };

  const handleTischChange = (id: number) => {
    setSelectedTisch(tischeList.find(t => t.id === id) ?? null);
  };

  const canSaveTable = selectedChamp && selectedSeries && selectedTisch && pin.trim().length > 0;

  const handleSaveTable = async () => {
    if (!canSaveTable) return;
    setSavingTable(true);
    setTableError('');
    try {
      const newCfg: ManagerConfig = {
        url: normalizedUrl, apiKey,
        championshipId: selectedChamp!.id, championshipName: selectedChamp!.name,
        seriesId: selectedSeries!.id, seriesName: selectedSeries!.name,
        tischId: selectedTisch!.id, tischName: selectedTisch!.name,
        pin: pin.trim(), players: selectedTisch!.players,
      };
      await saveManagerConfig(newCfg);
      setCfg(newCfg);
      setView('hub');
    } catch (e) {
      setTableError(e instanceof Error ? e.message : 'Failed to save table');
    } finally {
      setSavingTable(false);
    }
  };

  const handleChangeTable = async () => {
    const saved = await getManagerConfig();
    if (!saved) return;
    await saveManagerConfig({
      ...saved,
      championshipId: null, championshipName: '',
      seriesId: null, seriesName: '',
      tischId: null, tischName: '',
      pin: '', players: [],
    });
    setSelectedChamp(null); setSelectedSeries(null); setSelectedTisch(null);
    setPin(''); setSeriesList([]); setTischeList([]);
    if (championships.length === 0) {
      fetchChampionships(normalizedUrl, apiKey).then(setChampionships).catch(() => {});
    }
    setView('setup_table');
  };

  // ── start championship list ──────────────────────────────────────────────────
  const handleStartList = async () => {
    if (!cfg?.players?.length) return;
    const mode = cfg.players.length >= 4 ? '4er' : '3er';
    const baseGames = mode === '4er' ? 48 : 36;
    const totalGames = Math.floor(baseGames * fraction);
    const playerNames = cfg.players.map(p => p.name);
    const newList = await StorageManager.createList(playerNames, mode, totalGames);
    const path =
      `/list/${mode}` +
      `?players=${encodeURIComponent(JSON.stringify(playerNames))}` +
      `&totalGames=${totalGames}` +
      `&listId=${newList.id}` +
      `&seriesId=${cfg.seriesId}` +
      `&tischId=${cfg.tischId}` +
      `&back=championships`;
    router.push(path);
  };

  // ── rankings ─────────────────────────────────────────────────────────────────
  const loadRankings = useCallback(async (tab: RankTab) => {
    if (!cfg) return;
    setRankLoading(true);
    setRankError('');
    try {
      if (tab === 'tables') {
        const sid = tablesSeriesId ?? cfg.seriesId!;
        const data = await fetchSeriesTables(cfg.url, cfg.apiKey, sid);
        setTables(data);
      } else if (tab === 'series') {
        const data = await fetchSeriesRanking(cfg.url, cfg.apiKey, cfg.seriesId!);
        setSeriesRanking(data);
      } else {
        if (!cfg.championshipId) { setRankError('No championship configured.'); return; }
        const data = await fetchChampionshipRanking(cfg.url, cfg.apiKey, cfg.championshipId);
        setChampRanking(data);
      }
    } catch (e) {
      setRankError(e instanceof Error ? e.message : 'Failed to load rankings');
    } finally {
      setRankLoading(false);
    }
  }, [cfg, tablesSeriesId]);

  useEffect(() => {
    if (view === 'hub') loadRankings(rankTab);
  }, [view, rankTab, loadRankings]);

  useEffect(() => {
    if (view === 'hub' && cfg?.championshipId) {
      fetchSeries(cfg.url, cfg.apiKey, cfg.championshipId)
        .then(setAllSeries)
        .catch(() => {});
    }
  }, [view, cfg]);

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-[calc(100dvh-50px)] flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex items-center gap-3">
        <button onClick={() => router.push('/')} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex-1">Championships</h1>
        {view !== 'connect' && (
          <button onClick={handleDisconnect} className="text-red-400 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </header>

      {/* ── VIEW: connect ── */}
      {view === 'connect' && (
        <div className="flex-1 p-4 space-y-4 max-w-md mx-auto w-full">
          <p className="text-sm text-gray-500">Connect to a Skat Manager to track your championship table and see live rankings.</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager URL</label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="http://192.168.1.10:5000"
                className="w-full p-3 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={startScan}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                title="Scan QR code"
              >
                <QrCode className="w-5 h-5" />
              </button>
            </div>
          </div>

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

          {connectError && <p className="text-red-500 text-sm">{connectError}</p>}

          <button
            onClick={handleConnect}
            disabled={!url || connecting}
            className={`w-full p-3 rounded-lg flex items-center justify-center gap-2 transition-colors
              ${url && !connecting ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <Plug className="w-4 h-4" />
            {connecting ? 'Connecting…' : 'Connect'}
          </button>
        </div>
      )}

      {/* ── VIEW: setup_table ── */}
      {view === 'setup_table' && (
        <div className="flex-1 p-4 space-y-4 max-w-md mx-auto w-full">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
            Connected to <span className="font-medium">{normalizedUrl}</span>
          </div>

          <p className="text-sm text-gray-500">Select your table for this session.</p>

          {championships.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Championship</label>
              <select
                value={selectedChamp?.id ?? ''}
                onChange={e => handleChampChange(Number(e.target.value))}
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— select —</option>
                {championships.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                {seriesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                {tischeList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}

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

          {selectedTisch && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Table PIN <span className="text-gray-400 font-normal text-xs">(printed on your paper list)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit PIN"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg tracking-widest"
              />
            </div>
          )}

          {tableError && <p className="text-red-500 text-sm">{tableError}</p>}

          {canSaveTable && (
            <button
              onClick={handleSaveTable}
              disabled={savingTable}
              className="w-full p-3 bg-green-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-green-600"
            >
              <Plug className="w-4 h-4" />
              {savingTable ? 'Saving…' : 'Save Table'}
            </button>
          )}
        </div>
      )}

      {/* ── VIEW: hub ── */}
      {view === 'hub' && cfg && (
        <div className="flex-1 flex flex-col">
          {/* Table info card */}
          <div className="bg-white border-b px-4 py-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">{cfg.championshipName}</p>
                <p className="font-semibold text-gray-800">{cfg.seriesName} · {cfg.tischName}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {cfg.players.map(p => p.name).join(' · ')}
                </p>
              </div>
              <button
                onClick={handleChangeTable}
                className="text-gray-400 hover:text-gray-600 mt-0.5"
                title="Change table"
              >
                <PenLine className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Start list */}
          <div className="bg-white border-b px-4 py-4 flex items-center gap-3">
            <select
              value={fraction}
              onChange={e => setFraction(Number(e.target.value))}
              className="flex-1 p-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {FRACTIONS.map(f => {
                const base = cfg.players.length >= 4 ? 48 : 36;
                return (
                  <option key={f.value} value={f.value}>
                    {f.label} ({Math.floor(base * f.value)} games)
                  </option>
                );
              })}
            </select>
            <button
              onClick={handleStartList}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors font-medium text-sm whitespace-nowrap"
            >
              <Play className="w-4 h-4" />
              Start List
            </button>
          </div>

          {/* Rankings tabs */}
          <div className="flex border-b bg-white">
            {(['tables', 'series', 'championship'] as RankTab[]).map(t => (
              <button
                key={t}
                onClick={() => setRankTab(t)}
                className={`flex-1 py-3 text-sm font-medium capitalize transition-colors
                  ${rankTab === t
                    ? 'border-b-2 border-purple-500 text-purple-600'
                    : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t === 'tables' ? 'Tables' : t === 'series' ? 'Series' : 'Overall'}
              </button>
            ))}
            <button onClick={() => loadRankings(rankTab)} className="px-3 text-gray-400 hover:text-gray-600">
              <RefreshCw className={`w-4 h-4 ${rankLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Rankings content */}
          <div className="flex-1 overflow-auto p-4">
            {rankError && <p className="text-red-500 text-sm mb-3">{rankError}</p>}
            {rankLoading && <p className="text-gray-400 text-sm text-center mt-8">Loading…</p>}

            {!rankLoading && rankTab === 'tables' && (
              <div className="space-y-4">
                {allSeries.length > 1 && (
                  <div className="overflow-x-auto -mx-4 px-4">
                    <div className="flex gap-2 pb-1 w-max">
                      {allSeries.map(s => {
                        const isSelected = (tablesSeriesId ?? cfg.seriesId) === s.id;
                        const isOwn = s.id === cfg.seriesId;
                        return (
                          <button
                            key={s.id}
                            onClick={() => setTablesSeriesId(s.id)}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors
                              ${isSelected
                                ? 'bg-purple-100 border-purple-400 text-purple-700 font-medium'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}
                          >
                            {s.is_open && <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />}
                            {s.name}
                            {isOwn && <span className="text-xs opacity-60">·yours</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {tables.length === 0 && !rankError && <p className="text-gray-400 text-sm">No tables yet.</p>}
                {tables.map(tisch => {
                  const isOwnTisch = (tablesSeriesId === null || tablesSeriesId === cfg.seriesId) && tisch.id === cfg.tischId;
                  return (
                  <div key={tisch.id} className={`bg-white rounded-lg border p-3 ${isOwnTisch ? 'border-purple-300' : 'border-gray-200'}`}>
                    <p className="font-semibold text-gray-800 mb-2 text-sm">
                      {tisch.name}
                      {isOwnTisch && <span className="ml-2 text-xs text-purple-500 font-normal">your table</span>}
                    </p>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-400 text-xs">
                          <th className="text-left font-medium pb-1">Player</th>
                          <th className="text-right font-medium pb-1">W</th>
                          <th className="text-right font-medium pb-1">L</th>
                          <th className="text-right font-medium pb-1">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tisch.players.map(p => (
                          <tr key={p.id} className="border-t border-gray-100">
                            <td className="py-1 text-gray-700">{p.name}</td>
                            <td className="py-1 text-right text-gray-500">{p.won_games ?? '–'}</td>
                            <td className="py-1 text-right text-gray-500">{p.lost_games ?? '–'}</td>
                            <td className="py-1 text-right font-semibold text-gray-800">{p.total_points ?? '–'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  );
                })}
              </div>
            )}

            {!rankLoading && rankTab === 'series' && (
              <div>
                {seriesRanking.length === 0 && !rankError && <p className="text-gray-400 text-sm">No results yet.</p>}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-gray-400 text-xs">
                        <th className="text-left font-medium p-3">#</th>
                        <th className="text-left font-medium p-3">Player</th>
                        <th className="text-right font-medium p-3">W</th>
                        <th className="text-right font-medium p-3">L</th>
                        <th className="text-right font-medium p-3">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seriesRanking.map(item => (
                        <tr key={item.player_id} className={`border-t border-gray-100 ${cfg.players.some(p => p.id === item.player_id) ? 'bg-purple-50' : ''}`}>
                          <td className="p-3 text-gray-400 font-mono">{item.rank}</td>
                          <td className="p-3 text-gray-700">{item.player_name}</td>
                          <td className="p-3 text-right text-gray-500">{item.won_games ?? '–'}</td>
                          <td className="p-3 text-right text-gray-500">{item.lost_games ?? '–'}</td>
                          <td className="p-3 text-right font-semibold text-gray-800">{item.total_points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!rankLoading && rankTab === 'championship' && (
              <div>
                {champRanking.length === 0 && !rankError && <p className="text-gray-400 text-sm">No results yet.</p>}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-gray-400 text-xs">
                        <th className="text-left font-medium p-3">#</th>
                        <th className="text-left font-medium p-3">Player</th>
                        <th className="text-right font-medium p-3">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {champRanking.map(item => (
                        <tr key={item.player_id} className={`border-t border-gray-100 ${cfg.players.some(p => p.id === item.player_id) ? 'bg-purple-50' : ''}`}>
                          <td className="p-3 text-gray-400 font-mono">{item.rank}</td>
                          <td className="p-3 text-gray-700">{item.player_name}</td>
                          <td className="p-3 text-right font-semibold text-gray-800">{item.total_points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {scanning && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
          <div id="qr-reader" className="w-72 h-72" />
          <button
            onClick={() => setScanning(false)}
            className="mt-6 px-6 py-2 bg-white text-black rounded-lg text-sm"
          >
            Cancel
          </button>
        </div>
      )}
    </main>
  );
}
