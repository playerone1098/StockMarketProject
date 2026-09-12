import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  runStockScreener,
  fetchScreenerPresets,
  fetchMarketHeatmap,
  fetchMarketMovers,
  fetchSectors
} from '../services/api';
import { MarketHeatmap } from '../components/MarketHeatmap';
import { MarketMovers } from '../components/MarketMovers';

export const Screener = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState(searchParams.get('view') || 'table'); // 'table' | 'technical' | 'movers' | 'heatmap'

  // Data States
  const [stocks, setStocks] = useState([]);
  const [presets, setPresets] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [heatmapSectors, setHeatmapSectors] = useState([]);
  const [moversData, setMoversData] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isHeatmapLoading, setIsHeatmapLoading] = useState(false);
  const [isMoversLoading, setIsMoversLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter Form State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sector, setSector] = useState(searchParams.get('sector') || '');
  const [minMarketCap, setMinMarketCap] = useState(searchParams.get('minMarketCap') || '');
  const [maxMarketCap, setMaxMarketCap] = useState(searchParams.get('maxMarketCap') || '');
  const [minPe, setMinPe] = useState(searchParams.get('minPe') || '');
  const [maxPe, setMaxPe] = useState(searchParams.get('maxPe') || '');
  const [minPb, setMinPb] = useState(searchParams.get('minPb') || '');
  const [maxPb, setMaxPb] = useState(searchParams.get('maxPb') || '');
  const [minDividend, setMinDividend] = useState(searchParams.get('minDividend') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minChange, setMinChange] = useState(searchParams.get('minChange') || '');
  const [maxChange, setMaxChange] = useState(searchParams.get('maxChange') || '');
  const [near52wHigh, setNear52wHigh] = useState(searchParams.get('near52wHigh') === 'true');
  const [near52wLow, setNear52wLow] = useState(searchParams.get('near52wLow') === 'true');
  const [rsiFilter, setRsiFilter] = useState(searchParams.get('rsiFilter') || '');
  const [maFilter, setMaFilter] = useState(searchParams.get('maFilter') || '');
  const [technicalSignal, setTechnicalSignal] = useState(searchParams.get('technicalSignal') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'marketCap');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const [activePresetSlug, setActivePresetSlug] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);

  // Load presets & sectors on initial mount
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
        console.error('Failed to load initial screener data:', err);
      }
    };
    loadInitialData();
  }, []);

  // Load main screener results based on current filters
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
        minPb: minPb !== '' ? minPb : undefined,
        maxPb: maxPb !== '' ? maxPb : undefined,
        minDividend: minDividend !== '' ? minDividend : undefined,
        minPrice: minPrice !== '' ? minPrice : undefined,
        maxPrice: maxPrice !== '' ? maxPrice : undefined,
        minChange: minChange !== '' ? minChange : undefined,
        maxChange: maxChange !== '' ? maxChange : undefined,
        near52wHigh: near52wHigh ? 'true' : undefined,
        near52wLow: near52wLow ? 'true' : undefined,
        rsiFilter: rsiFilter || undefined,
        maFilter: maFilter || undefined,
        technicalSignal: technicalSignal || undefined,
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
  }, [
    search, sector, minMarketCap, maxMarketCap, minPe, maxPe, minPb, maxPb,
    minDividend, minPrice, maxPrice, minChange, maxChange, near52wHigh, near52wLow,
    rsiFilter, maFilter, technicalSignal, sortBy, sortOrder
  ]);

  // Load heatmap data
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

  // Load movers data
  const loadMoversData = useCallback(async () => {
    if (moversData) return;
    setIsMoversLoading(true);
    try {
      const res = await fetchMarketMovers(15);
      if (res.success) {
        setMoversData(res.data || null);
      }
    } catch (err) {
      console.error('Movers load error:', err);
    } finally {
      setIsMoversLoading(false);
    }
  }, [moversData]);

  // Trigger data fetching on view or filter change
  useEffect(() => {
    if (activeView === 'table' || activeView === 'technical') {
      loadScreenerResults(1);
    } else if (activeView === 'heatmap') {
      loadHeatmapData();
    } else if (activeView === 'movers') {
      loadMoversData();
    }
  }, [activeView, loadScreenerResults, loadHeatmapData, loadMoversData]);

  // Apply Preset
  const applyPreset = (preset) => {
    setActivePresetSlug(preset.slug);
    const f = preset.filters || {};
    setSector(f.sector || '');
    setMinMarketCap(f.minMarketCap !== undefined && f.minMarketCap !== null ? String(f.minMarketCap) : '');
    setMaxMarketCap(f.maxMarketCap !== undefined && f.maxMarketCap !== null ? String(f.maxMarketCap) : '');
    setMinPe(f.minPe !== undefined && f.minPe !== null ? String(f.minPe) : '');
    setMaxPe(f.maxPe !== undefined && f.maxPe !== null ? String(f.maxPe) : '');
    setMinPb(f.minPb !== undefined && f.minPb !== null ? String(f.minPb) : '');
    setMaxPb(f.maxPb !== undefined && f.maxPb !== null ? String(f.maxPb) : '');
    setMinDividend(f.minDividend !== undefined && f.minDividend !== null ? String(f.minDividend) : '');
    setNear52wHigh(Boolean(f.near52wHigh));
    setNear52wLow(Boolean(f.near52wLow));
    setRsiFilter(f.rsiFilter || '');
    setMaFilter(f.maFilter || '');
    setTechnicalSignal(f.technicalSignal || '');
    setSortBy(preset.sortBy || 'marketCap');
    setSortOrder(preset.sortOrder || 'desc');
  };

  // Preset Shortcuts for Technicals & Fundamentals
  const quickTechnicalPresets = [
    {
      title: 'Golden Cross Breakouts',
      filters: { maFilter: 'goldenCross', near52wHigh: true },
      sortBy: 'dayChangePercent',
      sortOrder: 'desc'
    },
    {
      title: 'Oversold Rebound (RSI < 30)',
      filters: { rsiFilter: 'oversold' },
      sortBy: 'rsi',
      sortOrder: 'asc'
    },
    {
      title: 'Bullish Momentum (RSI > 50)',
      filters: { rsiFilter: 'bullish', technicalSignal: 'BUY' },
      sortBy: 'dayChangePercent',
      sortOrder: 'desc'
    },
    {
      title: 'Deep Value (P/E < 15 & Div > 2%)',
      filters: { maxPe: 15, minDividend: 2 },
      sortBy: 'peRatio',
      sortOrder: 'asc'
    }
  ];

  // Reset Filters
  const resetFilters = () => {
    setActivePresetSlug('');
    setSearch('');
    setSector('');
    setMinMarketCap('');
    setMaxMarketCap('');
    setMinPe('');
    setMaxPe('');
    setMinPb('');
    setMaxPb('');
    setMinDividend('');
    setMinPrice('');
    setMaxPrice('');
    setMinChange('');
    setMaxChange('');
    setNear52wHigh(false);
    setNear52wLow(false);
    setRsiFilter('');
    setMaFilter('');
    setTechnicalSignal('');
    setSortBy('marketCap');
    setSortOrder('desc');
    setSearchParams({});
  };

  // Handle Sort Column
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Sector Heatmap Selection Callback
  const handleHeatmapSectorSelect = (selectedSectorName) => {
    setSector(selectedSectorName);
    setActiveView('table');
  };

  // Export CSV
  const exportToCSV = () => {
    if (!stocks || stocks.length === 0) return;
    const headers = ['Symbol', 'Company Name', 'Sector', 'Price (INR)', 'Day Change (%)', 'Market Cap (Cr)', 'P/E Ratio', 'RSI (14)', 'Signal'];
    const rows = stocks.map(s => [
      `"${s.symbol}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.sector || ''}"`,
      s.currentPrice || 0,
      s.dayChangePercent || 0,
      s.marketCap || 0,
      s.peRatio || 0,
      s.technicals?.rsi || '-',
      `"${s.technicals?.signal || 'NEUTRAL'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JodhpurTraders_Screener_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSignalBadgeColor = (signal) => {
    switch (signal) {
      case 'STRONG BUY':
        return 'bg-emerald-950/90 text-emerald-400 border-emerald-700/60';
      case 'BUY':
        return 'bg-emerald-900/40 text-emerald-300 border-emerald-800/40';
      case 'SELL':
        return 'bg-rose-900/40 text-rose-300 border-rose-800/40';
      case 'STRONG SELL':
        return 'bg-rose-950/90 text-rose-400 border-rose-700/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getRsiBadgeColor = (rsi) => {
    if (!rsi) return 'text-slate-400 bg-slate-800';
    if (rsi >= 70) return 'text-amber-400 bg-amber-950/80 border-amber-800/50';
    if (rsi <= 30) return 'text-cyan-400 bg-cyan-950/80 border-cyan-800/50';
    if (rsi >= 50) return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40';
    return 'text-rose-400 bg-rose-950/60 border-rose-800/40';
  };

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Stock Screener, Technical Analysis & Heatmap | JodhpurTraders',
    description: 'Filter Indian stocks by technical indicators (RSI, Moving Averages), market cap, P/E ratio, top gainers, and sector performance heatmap.',
    url: window.location.href
  };

  return (
    <div className="min-h-screen bg-white dark:bg-navy-950 text-navy-950 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Stock Screener & Technical Analysis Suite | JodhpurTraders</title>
        <meta
          name="description"
          content="Advanced Stock Screener, Technical Indicators (RSI, MA), Market Movers (Top Gainers/Losers), and Real-time Sector Heatmap for NSE & BSE stocks."
        />
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header / Hero Banner */}
        <div className="relative overflow-hidden bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-3xl p-6 sm:p-10 shadow-xl">
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              Professional Market Screener & Technical Suite
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-navy-950 dark:text-white">
              Stock Screener & Technical Analysis
            </h1>
            <p className="text-gray-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Scan NSE & BSE listings using fundamental and technical filters. Explore RSI signals, Moving Average crossovers, Top Gainers & Losers, and real-time Sector Heatmaps.
            </p>
          </div>

          {/* View Switcher Navigation Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 dark:border-navy-800/80 pt-6">
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-gray-50 dark:bg-navy-950/90">
              <button
                onClick={() => setActiveView('table')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  activeView === 'table'
                    ? 'border-2 border-cyan-600 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400 bg-transparent'
                    : 'border-transparent text-gray-700 dark:text-slate-400 hover:text-navy-950 dark:hover:text-slate-200 bg-transparent'
                }`}
              >
                Screener Table
              </button>
              <button
                onClick={() => setActiveView('technical')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  activeView === 'technical'
                    ? 'border-2 border-cyan-600 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400 bg-transparent'
                    : 'border-transparent text-gray-700 dark:text-slate-400 hover:text-navy-950 dark:hover:text-slate-200 bg-transparent'
                }`}
              >
                Technical Analysis
              </button>
              <button
                onClick={() => setActiveView('movers')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  activeView === 'movers'
                    ? 'border-2 border-cyan-600 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400 bg-transparent'
                    : 'border-transparent text-gray-700 dark:text-slate-400 hover:text-navy-950 dark:hover:text-slate-200 bg-transparent'
                }`}
              >
                Top Gainers & Movers
              </button>
              <button
                onClick={() => setActiveView('heatmap')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  activeView === 'heatmap'
                    ? 'border-2 border-cyan-600 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400 bg-transparent'
                    : 'border-transparent text-gray-700 dark:text-slate-400 hover:text-navy-950 dark:hover:text-slate-200 bg-transparent'
                }`}
              >
                Sector Heatmap
              </button>
            </div>

            {(activeView === 'table' || activeView === 'technical') && (
              <button
                onClick={exportToCSV}
                disabled={stocks.length === 0}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-transparent border border-gray-300 dark:border-navy-700 text-navy-950 dark:text-slate-300 hover:border-cyan-500 text-xs font-semibold transition-all disabled:opacity-50"
              >
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* View 1: Screener Table & View 2: Technical Analysis */}
        {(activeView === 'table' || activeView === 'technical') && (
          <div className="space-y-6">
            {/* Quick Presets Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  Screener Presets & Technical Strategies
                </span>
                {(activePresetSlug || search || sector || rsiFilter || maFilter || technicalSignal) && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:border-rose-700 font-semibold border border-rose-600 dark:border-rose-400 px-2.5 py-1 rounded-lg bg-transparent transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Server Presets */}
                {presets.map(preset => {
                  const isActive = activePresetSlug === preset.slug;
                  return (
                    <button
                      key={preset.slug}
                      onClick={() => applyPreset(preset)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                        isActive
                          ? 'border-2 border-cyan-600 dark:border-cyan-400 text-cyan-600 dark:text-cyan-300 bg-transparent'
                          : 'border-gray-300 dark:border-navy-800 text-gray-700 dark:text-slate-300 hover:border-gray-400 dark:hover:border-navy-700 bg-transparent'
                      }`}
                    >
                      {preset.title}
                    </button>
                  );
                })}

                {/* Quick Technical Strategies */}
                {quickTechnicalPresets.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      resetFilters();
                      if (preset.filters.rsiFilter) setRsiFilter(preset.filters.rsiFilter);
                      if (preset.filters.maFilter) setMaFilter(preset.filters.maFilter);
                      if (preset.filters.technicalSignal) setTechnicalSignal(preset.filters.technicalSignal);
                      if (preset.filters.near52wHigh) setNear52wHigh(true);
                      if (preset.filters.maxPe) setMaxPe(String(preset.filters.maxPe));
                      if (preset.filters.minDividend) setMinDividend(String(preset.filters.minDividend));
                      if (preset.sortBy) setSortBy(preset.sortBy);
                      if (preset.sortOrder) setSortOrder(preset.sortOrder);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border border-gray-300 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-200 hover:border-cyan-500 bg-transparent"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Comprehensive Filter Panel */}
            <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-navy-800 pb-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-bold text-navy-950 dark:text-slate-200 text-base">Custom Screener & Technical Filters</h2>
                  <span className="text-xs bg-gray-100 dark:bg-navy-950 text-gray-600 dark:text-slate-400 px-3 py-1 rounded-full border border-gray-200 dark:border-navy-800 font-mono">
                    {pagination.total} Stocks Match
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={resetFilters}
                    className="text-xs text-gray-700 dark:text-slate-400 hover:border-gray-400 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-navy-800 bg-transparent transition-colors font-semibold"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                    className="px-3 py-1.5 text-gray-700 dark:text-slate-400 hover:border-gray-400 rounded-lg border border-gray-300 dark:border-navy-800 text-xs font-bold bg-transparent transition-colors"
                  >
                    {isFilterPanelOpen ? 'Collapse Filters' : 'Expand Filters'}
                  </button>
                </div>
              </div>

              {isFilterPanelOpen && (
                <div className="space-y-6">
                  {/* Row 1: Search & Sector & Sort */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search Input */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Search Symbol or Company</label>
                      <input
                        type="text"
                        placeholder="e.g. RELIANCE, TCS, INFY..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-navy-950 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {/* Sector Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Sector</label>
                      <select
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        className="w-full bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-navy-950 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">All Sectors</option>
                        {sectors.map(s => (
                          <option key={s._id || s.name} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Sort By Field */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Sort Results By</label>
                      <div className="flex items-center gap-2">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-navy-950 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="marketCap">Market Cap</option>
                          <option value="currentPrice">Stock Price</option>
                          <option value="dayChangePercent">Day Change %</option>
                          <option value="peRatio">P/E Ratio</option>
                          <option value="dividendYield">Dividend Yield</option>
                          <option value="rsi">RSI (14)</option>
                          <option value="weekHigh52">52W High</option>
                        </select>
                        <button
                          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                          className="px-3 py-2 bg-transparent border border-gray-300 dark:border-navy-800 rounded-xl text-gray-700 dark:text-slate-300 hover:border-cyan-500 text-xs font-bold whitespace-nowrap"
                        >
                          {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                        </button>
                      </div>
                    </div>

                    {/* Technical Rating Signal */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Technical Signal</label>
                      <select
                        value={technicalSignal}
                        onChange={(e) => setTechnicalSignal(e.target.value)}
                        className="w-full bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-navy-950 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">All Technical Signals</option>
                        <option value="STRONG_BUY">Strong Buy</option>
                        <option value="BUY">Buy</option>
                        <option value="NEUTRAL">Neutral</option>
                        <option value="SELL">Sell</option>
                        <option value="STRONG_SELL">Strong Sell</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Fundamental Metrics (Market Cap, PE, PB, Dividend) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-gray-200 dark:border-navy-800/60 pt-4">
                    {/* Market Cap */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Market Cap (₹ Cr)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Min Cr"
                          value={minMarketCap}
                          onChange={(e) => setMinMarketCap(e.target.value)}
                          className="w-full bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-navy-950 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                        <input
                          type="number"
                          placeholder="Max Cr"
                          value={maxMarketCap}
                          onChange={(e) => setMaxMarketCap(e.target.value)}
                          className="w-full bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-navy-950 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    {/* P/E Ratio */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">P/E Ratio Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Min PE"
                          value={minPe}
                          onChange={(e) => setMinPe(e.target.value)}
                          className="w-full bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-navy-950 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                        <input
                          type="number"
                          placeholder="Max PE"
                          value={maxPe}
                          onChange={(e) => setMaxPe(e.target.value)}
                          className="w-full bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-navy-950 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    {/* P/B Ratio */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">P/B Ratio Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Min PB"
                          value={minPb}
                          onChange={(e) => setMinPb(e.target.value)}
                          className="w-full bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-navy-950 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                        <input
                          type="number"
                          placeholder="Max PB"
                          value={maxPb}
                          onChange={(e) => setMaxPb(e.target.value)}
                          className="w-full bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-navy-950 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    {/* Dividend Yield */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Min Dividend Yield (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="e.g. 2.0%"
                        value={minDividend}
                        onChange={(e) => setMinDividend(e.target.value)}
                        className="w-full bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-navy-950 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Row 3: Technical Analysis Indicators & Price Change */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-gray-200 dark:border-navy-800/60 pt-4">
                    {/* RSI Indicator Condition */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">RSI (14) Filter</label>
                      <select
                        value={rsiFilter}
                        onChange={(e) => setRsiFilter(e.target.value)}
                        className="w-full bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-navy-950 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">All RSI Levels</option>
                        <option value="bullish">Bullish Momentum (50 - 70)</option>
                        <option value="overbought">Overbought (&gt; 70)</option>
                        <option value="oversold">Oversold (&lt; 30)</option>
                        <option value="bearish">Bearish Zone (30 - 50)</option>
                      </select>
                    </div>

                    {/* Moving Average Alignment */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Moving Average Alignment</label>
                      <select
                        value={maFilter}
                        onChange={(e) => setMaFilter(e.target.value)}
                        className="w-full bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-navy-950 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">All MA Conditions</option>
                        <option value="above20">Price &gt; 20 EMA</option>
                        <option value="above50">Price &gt; 50 SMA</option>
                        <option value="above200">Price &gt; 200 SMA</option>
                        <option value="goldenCross">Golden Alignment (Above 20/50/200)</option>
                      </select>
                    </div>

                    {/* Stock Price Range */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Stock Price Range (₹)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Min ₹"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-full bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-navy-950 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                        <input
                          type="number"
                          placeholder="Max ₹"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="w-full bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-navy-950 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    {/* 52-Week High / Low Proximity Checkboxes */}
                    <div className="flex flex-col justify-end gap-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-navy-950 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={near52wHigh}
                          onChange={(e) => {
                            setNear52wHigh(e.target.checked);
                            if (e.target.checked) setNear52wLow(false);
                          }}
                          className="rounded border-gray-300 dark:border-navy-800 text-cyan-600 focus:ring-cyan-500"
                        />
                        Near 52W High (Within 5%)
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs text-navy-950 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={near52wLow}
                          onChange={(e) => {
                            setNear52wLow(e.target.checked);
                            if (e.target.checked) setNear52wHigh(false);
                          }}
                          className="rounded border-gray-300 dark:border-navy-800 text-cyan-600 focus:ring-cyan-500"
                        />
                        Near 52W Low (Within 5%)
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results Table Section */}
            <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
              {isLoading ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Running stock screener & technical calculations...</p>
                </div>
              ) : error ? (
                <div className="py-12 text-center text-rose-500 text-sm font-semibold">{error}</div>
              ) : stocks.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <p className="text-base font-semibold text-navy-950 dark:text-slate-300">No stocks match these screening criteria</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Try broadening your search or clearing active filters.</p>
                  <button
                    onClick={resetFilters}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-600 dark:border-cyan-400 text-cyan-600 dark:text-cyan-300 text-xs font-bold hover:border-cyan-700 bg-transparent transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : activeView === 'table' ? (
                /* Standard / Fundamental Screener Table */
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-navy-800">
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
                          <th className="pb-3 text-center hidden sm:table-cell">Signal</th>
                          <th className="pb-3 pr-2 text-right">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-navy-800/60 text-sm">
                        {stocks.map((stock, idx) => {
                          const isPositive = stock.dayChangePercent >= 0;
                          const rank = (pagination.page - 1) * pagination.limit + idx + 1;
                          const signal = stock.technicals?.signal || 'NEUTRAL';
                          return (
                            <tr key={stock._id || stock.symbol} className="hover:bg-gray-50 dark:hover:bg-navy-800/50 transition-colors group">
                              <td className="py-3.5 pl-2 text-xs font-mono text-gray-400 dark:text-slate-500">{rank}</td>
                              <td className="py-3.5">
                                <Link to={`/stocks/${stock.symbol}`} className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-navy-800 border border-gray-200 dark:border-navy-700 flex items-center justify-center font-bold text-xs text-cyan-600 dark:text-cyan-400 group-hover:border-cyan-500 transition-colors">
                                    {stock.symbol.slice(0, 3)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-navy-950 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                                      {stock.symbol}
                                      <span className="text-[10px] bg-gray-100 dark:bg-navy-800 px-1.5 py-0.5 rounded text-gray-500 dark:text-slate-400 font-normal">
                                        {stock.exchange || 'NSE'}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-[160px] sm:max-w-[240px]">
                                      {stock.name} • {stock.sector}
                                    </div>
                                  </div>
                                </Link>
                              </td>

                              <td className="py-3.5 text-right font-semibold text-navy-950 dark:text-slate-100">
                                ₹{Number(stock.currentPrice).toLocaleString('en-IN')}
                              </td>

                              <td className="py-3.5 text-right font-semibold">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                                  isPositive
                                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                                    : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                                }`}>
                                  {isPositive ? '+' : ''}{stock.dayChangePercent?.toFixed(2)}%
                                </span>
                              </td>

                              <td className="py-3.5 text-right text-xs font-medium text-gray-600 dark:text-slate-300 hidden md:table-cell">
                                ₹{Number(stock.marketCap || 0).toLocaleString('en-IN')} Cr
                              </td>

                              <td className="py-3.5 text-right text-xs font-medium text-gray-600 dark:text-slate-300 hidden lg:table-cell">
                                {stock.peRatio ? stock.peRatio.toFixed(2) : '-'}
                              </td>

                              <td className="py-3.5 text-right text-xs font-medium text-gray-600 dark:text-slate-300 hidden lg:table-cell">
                                {stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : '-'}
                              </td>

                              <td className="py-3.5 text-center hidden sm:table-cell">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getSignalBadgeColor(signal)}`}>
                                  {signal}
                                </span>
                              </td>

                              <td className="py-3.5 pr-2 text-right">
                                <Link
                                  to={`/stocks/${stock.symbol}`}
                                  className="inline-flex items-center px-2.5 py-1 rounded-lg border border-cyan-600 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400 text-xs font-semibold hover:border-cyan-700 bg-transparent transition-colors"
                                >
                                  Analyze
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
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-navy-800">
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={pagination.page <= 1}
                          onClick={() => loadScreenerResults(pagination.page - 1)}
                          className="px-3 py-1.5 rounded-lg bg-transparent border border-gray-300 dark:border-navy-800 text-xs font-semibold text-gray-700 dark:text-slate-300 hover:border-gray-400 dark:hover:border-navy-600 disabled:opacity-40 transition-colors"
                        >
                          Previous
                        </button>
                        <button
                          disabled={pagination.page >= pagination.pages}
                          onClick={() => loadScreenerResults(pagination.page + 1)}
                          className="px-3 py-1.5 rounded-lg bg-transparent border border-gray-300 dark:border-navy-800 text-xs font-semibold text-gray-700 dark:text-slate-300 hover:border-gray-400 dark:hover:border-navy-600 disabled:opacity-40 transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Technical Analysis Detailed Matrix View */
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-navy-800">
                          <th className="pb-3 pl-2">Stock</th>
                          <th className="pb-3 text-right">Price</th>
                          <th className="pb-3 cursor-pointer text-center" onClick={() => handleSort('rsi')}>
                            RSI (14) {sortBy === 'rsi' && (sortOrder === 'asc' ? '▲' : '▼')}
                          </th>
                          <th className="pb-3 text-center hidden md:table-cell">Moving Averages (20/50/200)</th>
                          <th className="pb-3 text-center hidden lg:table-cell">MACD Trend</th>
                          <th className="pb-3 text-center hidden lg:table-cell">52W High Range</th>
                          <th className="pb-3 text-center">Technical Signal</th>
                          <th className="pb-3 pr-2 text-right">Chart</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-navy-800/60 text-sm">
                        {stocks.map((stock) => {
                          const isPositive = stock.dayChangePercent >= 0;
                          const t = stock.technicals || {};
                          return (
                            <tr key={stock._id || stock.symbol} className="hover:bg-gray-50 dark:hover:bg-navy-800/50 transition-colors group">
                              <td className="py-3.5 pl-2">
                                <Link to={`/stocks/${stock.symbol}`} className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-navy-800 border border-gray-200 dark:border-navy-700 flex items-center justify-center font-bold text-xs text-cyan-600 dark:text-cyan-400 group-hover:border-cyan-500 transition-colors">
                                    {stock.symbol.slice(0, 3)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-navy-950 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                                      {stock.symbol}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-[140px]">
                                      {stock.sector}
                                    </div>
                                  </div>
                                </Link>
                              </td>

                              <td className="py-3.5 text-right">
                                <div className="font-semibold text-navy-950 dark:text-slate-100">
                                  ₹{Number(stock.currentPrice).toLocaleString('en-IN')}
                                </div>
                                <div className={`text-[11px] font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                  {isPositive ? '+' : ''}{stock.dayChangePercent?.toFixed(2)}%
                                </div>
                              </td>

                              {/* RSI Metric */}
                              <td className="py-3.5 text-center">
                                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${getRsiBadgeColor(t.rsi)}`}>
                                  {t.rsi ? t.rsi : '-'}
                                </span>
                                <div className="text-[9px] text-gray-400 dark:text-slate-400 mt-0.5">
                                  {t.rsi >= 70 ? 'Overbought' : t.rsi <= 30 ? 'Oversold' : t.rsi >= 50 ? 'Bullish' : 'Bearish'}
                                </div>
                              </td>

                              {/* Moving Averages */}
                              <td className="py-3.5 text-center hidden md:table-cell">
                                <div className="flex items-center justify-center gap-1">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${t.aboveEma20 ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'}`}>
                                    20E {t.aboveEma20 ? '▲' : '▼'}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${t.aboveSma50 ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'}`}>
                                    50S {t.aboveSma50 ? '▲' : '▼'}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${t.aboveSma200 ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'}`}>
                                    200S {t.aboveSma200 ? '▲' : '▼'}
                                  </span>
                                </div>
                              </td>

                              {/* MACD */}
                              <td className="py-3.5 text-center hidden lg:table-cell">
                                <span className={`text-xs font-semibold ${t.macdHist >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                  {t.macdSignal || 'Neutral'}
                                </span>
                                <div className="text-[10px] font-mono text-gray-400 dark:text-slate-400">
                                  Hist: {t.macdHist}
                                </div>
                              </td>

                              {/* 52W Range bar */}
                              <td className="py-3.5 text-center hidden lg:table-cell">
                                <div className="w-28 mx-auto space-y-1">
                                  <div className="h-1.5 w-full bg-gray-100 dark:bg-navy-950 rounded-full overflow-hidden border border-gray-200 dark:border-navy-800">
                                    <div
                                      className="h-full bg-gradient-to-r from-rose-500 via-yellow-500 to-emerald-500"
                                      style={{ width: `${t.range52Position || 50}%` }}
                                    ></div>
                                  </div>
                                  <div className="text-[10px] text-gray-500 dark:text-slate-400 flex justify-between font-mono">
                                    <span>₹{stock.weekLow52}</span>
                                    <span>{t.range52Position}%</span>
                                    <span>₹{stock.weekHigh52}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Technical Rating */}
                              <td className="py-3.5 text-center">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border ${getSignalBadgeColor(t.signal || 'NEUTRAL')}`}>
                                  {t.signal || 'NEUTRAL'}
                                </span>
                              </td>

                              <td className="py-3.5 pr-2 text-right">
                                <Link
                                  to={`/stocks/${stock.symbol}`}
                                  className="inline-flex items-center px-2.5 py-1 rounded-lg border border-cyan-600 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400 text-xs font-semibold hover:border-cyan-700 bg-transparent transition-colors"
                                >
                                  View Chart
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
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-navy-800">
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={pagination.page <= 1}
                          onClick={() => loadScreenerResults(pagination.page - 1)}
                          className="px-3 py-1.5 rounded-lg bg-transparent border border-gray-300 dark:border-navy-800 text-xs font-semibold text-gray-700 dark:text-slate-300 hover:border-gray-400 dark:hover:border-navy-600 disabled:opacity-40 transition-colors"
                        >
                          Previous
                        </button>
                        <button
                          disabled={pagination.page >= pagination.pages}
                          onClick={() => loadScreenerResults(pagination.page + 1)}
                          className="px-3 py-1.5 rounded-lg bg-transparent border border-gray-300 dark:border-navy-800 text-xs font-semibold text-gray-700 dark:text-slate-300 hover:border-gray-400 dark:hover:border-navy-600 disabled:opacity-40 transition-colors"
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
        )}

        {/* View 3: Market Movers (Top Gainers, Top Losers, Most Active, 52W Highs/Lows) */}
        {activeView === 'movers' && (
          <MarketMovers movers={moversData} isLoading={isMoversLoading} />
        )}

        {/* View 4: Sector Performance Heatmap */}
        {activeView === 'heatmap' && (
          <MarketHeatmap
            sectors={heatmapSectors}
            isLoading={isHeatmapLoading}
            error={error}
            onSelectSector={handleHeatmapSectorSelect}
          />
        )}
      </div>
    </div>
  );
};
