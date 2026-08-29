import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  runStockScreener,
  fetchScreenerPresets,
  fetchMarketHeatmap,
  fetchSectors
} from '../services/api';
import { MarketHeatmap } from '../components/MarketHeatmap';

export const Screener = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState('table'); // 'table' | 'heatmap'

  // Data States
  const [stocks, setStocks] = useState([]);
  const [presets, setPresets] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [heatmapSectors, setHeatmapSectors] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });

  // Loading & Error
  const [isLoading, setIsLoading] = useState(true);
  const [isHeatmapLoading, setIsHeatmapLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter Form State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sector, setSector] = useState(searchParams.get('sector') || '');
  const [minMarketCap, setMinMarketCap] = useState(searchParams.get('minMarketCap') || '');
  const [maxMarketCap, setMaxMarketCap] = useState(searchParams.get('maxMarketCap') || '');
  const [minPe, setMinPe] = useState(searchParams.get('minPe') || '');
  const [maxPe, setMaxPe] = useState(searchParams.get('maxPe') || '');
  const [minDividend, setMinDividend] = useState(searchParams.get('minDividend') || '');
  const [near52wHigh, setNear52wHigh] = useState(searchParams.get('near52wHigh') === 'true');
  const [near52wLow, setNear52wLow] = useState(searchParams.get('near52wLow') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'marketCap');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const [activePresetSlug, setActivePresetSlug] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);

  // Fetch presets and sectors on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [presetsRes, sectorsRes] = await Promise.all([
          fetchScreenerPresets(),
          fetchSectors()
        ]);
        if (presetsRes.success) setPresets(presetsRes.data || []);
        if (sectorsRes.success) setSectors(sectorsRes.data || []);
      } catch (err) {
        console.error('Failed to load screener metadata:', err);
      }
    };
    loadInitialData();
  }, []);

  // Fetch stocks based on current filters
  const loadScreenerResults = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 25,
        search: search.trim() || undefined,
        sector: sector || undefined,
        minMarketCap: minMarketCap !== '' ? minMarketCap : undefined,
        maxMarketCap: maxMarketCap !== '' ? maxMarketCap : undefined,
        minPe: minPe !== '' ? minPe : undefined,
        maxPe: maxPe !== '' ? maxPe : undefined,
        minDividend: minDividend !== '' ? minDividend : undefined,
        near52wHigh: near52wHigh ? 'true' : undefined,
        near52wLow: near52wLow ? 'true' : undefined,
        sortBy,
        sortOrder
      };

      const res = await runStockScreener(params);
      if (res.success) {
        setStocks(res.data || []);
        setPagination(res.pagination || { page: 1, limit: 25, total: 0, pages: 1 });
      } else {
        setError('Failed to fetch screener results');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while screening stocks');
    } finally {
      setIsLoading(false);
    }
  }, [search, sector, minMarketCap, maxMarketCap, minPe, maxPe, minDividend, near52wHigh, near52wLow, sortBy, sortOrder]);

  // Load heatmap data when view changes
  const loadHeatmapData = useCallback(async () => {
    if (heatmapSectors.length > 0) return;
    setIsHeatmapLoading(true);
    try {
      const res = await fetchMarketHeatmap();
      if (res.success) {
        setHeatmapSectors(res.data || []);
      }
    } catch (err) {
      console.error('Heatmap load error:', err);
    } finally {
      setIsHeatmapLoading(false);
    }
  }, [heatmapSectors.length]);

  useEffect(() => {
    if (activeView === 'table') {
      loadScreenerResults(1);
    } else {
      loadHeatmapData();
    }
  }, [activeView, loadScreenerResults, loadHeatmapData]);

  // Handle Preset Click
  const applyPreset = (preset) => {
    setActivePresetSlug(preset.slug);
    const f = preset.filters || {};
    setSector(f.sector || '');
    setMinMarketCap(f.minMarketCap !== null && f.minMarketCap !== undefined ? String(f.minMarketCap) : '');
    setMaxMarketCap(f.maxMarketCap !== null && f.maxMarketCap !== undefined ? String(f.maxMarketCap) : '');
    setMinPe(f.minPe !== null && f.minPe !== undefined ? String(f.minPe) : '');
    setMaxPe(f.maxPe !== null && f.maxPe !== undefined ? String(f.maxPe) : '');
    setMinDividend(f.minDividend !== null && f.minDividend !== undefined ? String(f.minDividend) : '');
    setNear52wHigh(Boolean(f.near52wHigh));
    setNear52wLow(Boolean(f.near52wLow));
    setSortBy(preset.sortBy || 'marketCap');
    setSortOrder(preset.sortOrder || 'desc');
  };

  // Reset Filters
  const resetFilters = () => {
    setActivePresetSlug('');
    setSearch('');
    setSector('');
    setMinMarketCap('');
    setMaxMarketCap('');
    setMinPe('');
    setMaxPe('');
    setMinDividend('');
    setNear52wHigh(false);
    setNear52wLow(false);
    setSortBy('marketCap');
    setSortOrder('desc');
    setSearchParams({});
  };

  // Toggle Table Sort Column
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Export Results to CSV
  const exportToCSV = () => {
    if (!stocks || stocks.length === 0) return;
    const headers = ['Symbol', 'Company Name', 'Sector', 'Price (INR)', 'Day Change (%)', 'Market Cap (Cr)', 'P/E Ratio', 'Div Yield (%)'];
    const rows = stocks.map(s => [
      `"${s.symbol}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.sector || ''}"`,
      s.currentPrice || 0,
      s.dayChangePercent || 0,
      s.marketCap || 0,
      s.peRatio || 0,
      s.dividendYield || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JodhpurTraders_Screener_Results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Stock Screener & Market Heatmap | JodhpurTraders',
    description: 'Filter Indian stocks by P/E ratio, market cap, dividend yield, and technical breakouts with our advanced stock screener and sector heatmap.',
    url: window.location.href
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Stock Screener & Market Heatmap | JodhpurTraders</title>
        <meta
          name="description"
          content="Filter Indian stocks by P/E ratio, market cap, dividend yield, and 52-week highs with JodhpurTraders Stock Screener and interactive sector heatmap."
        />
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-navy-900 via-navy-850 to-indigo-950 border border-navy-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              ⚡ Advanced Analytics & Discovery
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Stock Screener <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">& Market Heatmap</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Screen NSE & BSE listings using fundamental and technical filters. Find value bargains, high-dividend stocks, market titans, or explore real-time sector performance heatmaps.
            </p>
          </div>

          {/* View Switcher Tabs */}
          <div className="mt-8 flex items-center justify-between border-t border-navy-800/80 pt-6">
            <div className="flex items-center gap-2 bg-navy-950/80 p-1.5 rounded-2xl border border-navy-800">
              <button
                onClick={() => setActiveView('table')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeView === 'table'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900'
                }`}
              >
                📋 Screener Table
              </button>
              <button
                onClick={() => setActiveView('heatmap')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeView === 'heatmap'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900'
                }`}
              >
                📊 Sector Heatmap
              </button>
            </div>

            {activeView === 'table' && (
              <button
                onClick={exportToCSV}
                disabled={stocks.length === 0}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-slate-300 hover:text-white hover:border-cyan-500/50 text-xs font-semibold transition-all disabled:opacity-50"
              >
                📥 Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Screener View */}
        {activeView === 'table' ? (
          <div className="space-y-6">
            {/* Quick Presets Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  🔍 Popular Screener Presets
                </span>
                {activePresetSlug && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
                  >
                    Clear Preset
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {presets.map(preset => {
                  const isActive = activePresetSlug === preset.slug;
                  return (
                    <button
                      key={preset.slug}
                      onClick={() => applyPreset(preset)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border flex items-center gap-2 ${
                        isActive
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                          : 'bg-navy-900 border-navy-800 text-slate-300 hover:border-navy-700 hover:text-white'
                      }`}
                    >
                      ✨ {preset.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Toggle Panel */}
            <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-navy-800 pb-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-bold text-slate-200 text-base">Custom Screener Filters</h2>
                  <span className="text-xs bg-navy-950 text-slate-400 px-2.5 py-1 rounded-full border border-navy-800">
                    {pagination.total} Stocks Found
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={resetFilters}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-navy-800 hover:bg-navy-850 transition-colors"
                  >
                    Reset
                  </button>

                  <button
                    onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg border border-navy-800 text-xs font-bold"
                  >
                    {isFilterPanelOpen ? 'Collapse ▲' : 'Expand ▼'}
                  </button>
                </div>
              </div>

              {isFilterPanelOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Search Symbol or Name</label>
                    <input
                      type="text"
                      placeholder="e.g. RELIANCE, TCS..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Sector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Sector</label>
                    <select
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">All Sectors</option>
                      {sectors.map(s => (
                        <option key={s._id || s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Market Cap Range */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Market Cap (₹ Cr)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min Cr"
                        value={minMarketCap}
                        onChange={(e) => setMinMarketCap(e.target.value)}
                        className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="number"
                        placeholder="Max Cr"
                        value={maxMarketCap}
                        onChange={(e) => setMaxMarketCap(e.target.value)}
                        className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* P/E Ratio Range */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">P/E Ratio Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min PE"
                        value={minPe}
                        onChange={(e) => setMinPe(e.target.value)}
                        className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="number"
                        placeholder="Max PE"
                        value={maxPe}
                        onChange={(e) => setMaxPe(e.target.value)}
                        className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Dividend Yield */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Min Dividend Yield (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 2.0"
                      value={minDividend}
                      onChange={(e) => setMinDividend(e.target.value)}
                      className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Sort Results By</label>
                    <div className="flex items-center gap-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="marketCap">Market Cap</option>
                        <option value="currentPrice">Stock Price</option>
                        <option value="dayChangePercent">Day Change %</option>
                        <option value="peRatio">P/E Ratio</option>
                        <option value="dividendYield">Dividend Yield</option>
                        <option value="weekHigh52">52W High</option>
                      </select>
                      <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="px-2.5 py-2 bg-navy-950 border border-navy-800 rounded-xl text-slate-300 hover:text-cyan-400 text-xs font-bold"
                      >
                        {sortOrder === 'asc' ? 'ASC ▲' : 'DESC ▼'}
                      </button>
                    </div>
                  </div>

                  {/* Checkboxes: 52W High / Low */}
                  <div className="sm:col-span-2 flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={near52wHigh}
                        onChange={(e) => {
                          setNear52wHigh(e.target.checked);
                          if (e.target.checked) setNear52wLow(false);
                        }}
                        className="rounded border-navy-800 bg-navy-950 text-cyan-500 focus:ring-cyan-500"
                      />
                      Near 52-Week High (Within 5%)
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={near52wLow}
                        onChange={(e) => {
                          setNear52wLow(e.target.checked);
                          if (e.target.checked) setNear52wHigh(false);
                        }}
                        className="rounded border-navy-800 bg-navy-950 text-cyan-500 focus:ring-cyan-500"
                      />
                      Near 52-Week Low (Within 5%)
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Results Table */}
            <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
              {isLoading ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-400 font-medium">Screening stocks across database...</p>
                </div>
              ) : error ? (
                <div className="py-12 text-center text-rose-400 text-sm font-semibold">{error}</div>
              ) : stocks.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <p className="text-base font-semibold text-slate-300">No stocks match these screen criteria</p>
                  <p className="text-xs text-slate-400">Try broadening your search or resetting filters.</p>
                  <button
                    onClick={resetFilters}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-navy-800">
                          <th className="pb-3 pl-2">#</th>
                          <th className="pb-3 cursor-pointer" onClick={() => handleSort('symbol')}>
                            Company {sortBy === 'symbol' && (sortOrder === 'asc' ? '▲' : '▼')}
                          </th>
                          <th className="pb-3 cursor-pointer text-right" onClick={() => handleSort('currentPrice')}>
                            Price {sortBy === 'currentPrice' && (sortOrder === 'asc' ? '▲' : '▼')}
                          </th>
                          <th className="pb-3 cursor-pointer text-right" onClick={() => handleSort('dayChangePercent')}>
                            24h Change {sortBy === 'dayChangePercent' && (sortOrder === 'asc' ? '▲' : '▼')}
                          </th>
                          <th className="pb-3 cursor-pointer text-right hidden md:table-cell" onClick={() => handleSort('marketCap')}>
                            Market Cap {sortBy === 'marketCap' && (sortOrder === 'asc' ? '▲' : '▼')}
                          </th>
                          <th className="pb-3 cursor-pointer text-right hidden lg:table-cell" onClick={() => handleSort('peRatio')}>
                            P/E Ratio {sortBy === 'peRatio' && (sortOrder === 'asc' ? '▲' : '▼')}
                          </th>
                          <th className="pb-3 cursor-pointer text-right hidden lg:table-cell" onClick={() => handleSort('dividendYield')}>
                            Div Yield {sortBy === 'dividendYield' && (sortOrder === 'asc' ? '▲' : '▼')}
                          </th>
                          <th className="pb-3 pr-2 text-right">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-800/60 text-sm">
                        {stocks.map((stock, idx) => {
                          const isPositive = stock.dayChangePercent >= 0;
                          const rank = (pagination.page - 1) * pagination.limit + idx + 1;
                          return (
                            <tr key={stock._id || stock.symbol} className="hover:bg-navy-800/50 transition-colors group">
                              <td className="py-3.5 pl-2 text-xs font-mono text-slate-500">{rank}</td>
                              <td className="py-3.5">
                                <Link to={`/stocks/${stock.symbol}`} className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-navy-800 border border-navy-700 flex items-center justify-center font-bold text-xs text-cyan-400 group-hover:border-cyan-500 transition-colors">
                                    {stock.symbol.slice(0, 3)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                                      {stock.symbol}
                                      <span className="text-[10px] bg-navy-800 px-1.5 py-0.5 rounded text-slate-400 font-normal">
                                        {stock.exchange || 'NSE'}
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-400 truncate max-w-[160px] sm:max-w-[240px]">
                                      {stock.name} • {stock.sector}
                                    </div>
                                  </div>
                                </Link>
                              </td>

                              <td className="py-3.5 text-right font-semibold text-slate-100">
                                ₹{Number(stock.currentPrice).toLocaleString('en-IN')}
                              </td>

                              <td className="py-3.5 text-right font-semibold">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                                  isPositive
                                    ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/50'
                                    : 'bg-rose-950/70 text-rose-400 border border-rose-800/50'
                                }`}>
                                  {isPositive ? '+' : ''}{stock.dayChangePercent?.toFixed(2)}%
                                </span>
                              </td>

                              <td className="py-3.5 text-right text-xs font-medium text-slate-300 hidden md:table-cell">
                                ₹{Number(stock.marketCap || 0).toLocaleString('en-IN')} Cr
                              </td>

                              <td className="py-3.5 text-right text-xs font-medium text-slate-300 hidden lg:table-cell">
                                {stock.peRatio ? stock.peRatio.toFixed(2) : '-'}
                              </td>

                              <td className="py-3.5 text-right text-xs font-medium text-slate-300 hidden lg:table-cell">
                                {stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : '-'}
                              </td>

                              <td className="py-3.5 pr-2 text-right">
                                <Link
                                  to={`/stocks/${stock.symbol}`}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
                                >
                                  Analyze →
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-navy-800">
                      <span className="text-xs text-slate-400">
                        Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          disabled={pagination.page <= 1}
                          onClick={() => loadScreenerResults(pagination.page - 1)}
                          className="px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-800 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40"
                        >
                          Previous
                        </button>
                        <button
                          disabled={pagination.page >= pagination.pages}
                          onClick={() => loadScreenerResults(pagination.page + 1)}
                          className="px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-800 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          /* Sector Heatmap View */
          <MarketHeatmap sectors={heatmapSectors} isLoading={isHeatmapLoading} error={error} />
        )}
      </div>
    </div>
  );
};
