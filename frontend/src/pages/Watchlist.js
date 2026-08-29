import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TradingViewChart } from '../components/TradingViewChart';
import {
  fetchWatchlists,
  createWatchlist,
  deleteWatchlist,
  addStockToWatchlist,
  removeStockFromWatchlist,
  fetchStocks
} from '../services/api';

export const Watchlist = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [watchlists, setWatchlists] = useState([]);
  const [selectedWatchlistId, setSelectedWatchlistId] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [openNotesForStock, setOpenNotesForStock] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Search suggest for adding stock
  const [searchQuery, setSearchQuery] = useState('');
  const [stockSuggestions, setStockSuggestions] = useState([]);

  // Create Watchlist modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadWatchlists();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const loadWatchlists = async () => {
    try {
      setLoading(true);
      const res = await fetchWatchlists();
      if (res.success && res.data) {
        const lists = res.data.watchlists || [];
        setWatchlists(lists);
        if (lists.length > 0 && !selectedWatchlistId) {
          setSelectedWatchlistId(lists[0]._id);
        }
      }
    } catch (err) {
      console.error('Error loading watchlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentWatchlist = watchlists.find(w => w._id === selectedWatchlistId) || watchlists[0];

  // Auto-sync active selected stock when switching watchlists or removing items
  useEffect(() => {
    if (currentWatchlist && currentWatchlist.items && currentWatchlist.items.length > 0) {
      if (selectedStock) {
        const exists = currentWatchlist.items.some(item => item.symbol === selectedStock);
        if (!exists) {
          setSelectedStock(currentWatchlist.items[0].symbol);
        }
      }
    } else {
      setSelectedStock(null);
    }
  }, [selectedWatchlistId, currentWatchlist]);

  const selectedItem = currentWatchlist?.items?.find(item => item.symbol === selectedStock);
  const selectedDetails = selectedItem?.stockDetails || {};

  const [searchLoading, setSearchLoading] = useState(false);

  const handleStockSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length >= 3) {
      setSearchLoading(true);
      try {
        const res = await fetchStocks({ search: query.trim(), limit: 15 });
        // Handle all possible API response shapes
        let list = [];
        if (res.success !== undefined) {
          // Response: { success, data: [...] } or { success, data: { stocks: [...] } }
          const d = res.data;
          if (Array.isArray(d)) {
            list = d;
          } else if (d && Array.isArray(d.stocks)) {
            list = d.stocks;
          } else if (d && Array.isArray(d.data)) {
            list = d.data;
          }
        } else if (Array.isArray(res)) {
          list = res;
        }
        setStockSuggestions(list);
      } catch (err) {
        console.error('Error fetching stock suggestions:', err);
        setStockSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    } else {
      setStockSuggestions([]);
    }
  };

  const handleAddStock = async (symbol) => {
    if (!symbol) return;
    const targetWatchlistId = currentWatchlist ? currentWatchlist._id : 'default';
    try {
      const res = await addStockToWatchlist(targetWatchlistId, symbol);
      setSearchQuery('');
      setStockSuggestions([]);
      await loadWatchlists();
      setSelectedStock(symbol);
    } catch (err) {
      console.error('Error adding stock to watchlist:', err);
      alert('Failed to add stock: ' + (err?.response?.data?.message || err.message));
    }
  };

  const handleRemoveStock = async (e, symbol) => {
    if (e) e.stopPropagation();
    if (!currentWatchlist) return;
    try {
      await removeStockFromWatchlist(currentWatchlist._id, symbol);
      if (selectedStock === symbol) {
        const remaining = currentWatchlist.items.filter(i => i.symbol !== symbol);
        setSelectedStock(remaining.length > 0 ? remaining[0].symbol : null);
      }
      await loadWatchlists();
    } catch (err) {
      console.error('Error removing stock:', err);
    }
  };

  const handleCreateWatchlist = async (e) => {
    e.preventDefault();
    if (!newWatchlistName.trim()) return;
    try {
      const res = await createWatchlist({ name: newWatchlistName });
      if (res.success) {
        setShowCreateModal(false);
        setNewWatchlistName('');
        await loadWatchlists();
        setSelectedWatchlistId(res.data.watchlist._id);
      }
    } catch (err) {
      console.error('Error creating watchlist:', err);
    }
  };

  const handleDeleteWatchlist = async (id) => {
    if (!window.confirm('Are you sure you want to delete this watchlist?')) return;
    try {
      await deleteWatchlist(id);
      setSelectedWatchlistId('');
      setSelectedStock(null);
      await loadWatchlists();
    } catch (err) {
      console.error('Error deleting watchlist:', err);
    }
  };

  if (authLoading || (loading && isAuthenticated)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-navy-950 text-white">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-navy-950 text-white py-16 px-4">
        <div className="max-w-xl w-full bg-navy-900 border border-navy-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-inner">
            ⭐
          </div>

          <div className="space-y-2">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Authentication Required
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Sign in to Access Stock Watchlists
            </h1>
            <p className="text-sm text-gray-300 leading-relaxed max-w-md mx-auto">
              Monitor key stock price movements, track real-time volume alerts, and organize custom Indian equity watchlists with live TradingView charts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition text-center"
            >
              Sign In to Access Watchlist →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-navy-950 text-white ${selectedStock ? 'h-[calc(100vh-64px)] overflow-hidden p-2.5 flex flex-col' : 'min-h-screen py-6 px-4 sm:px-6 lg:px-8'}`}>
      <div className={`${selectedStock ? 'w-full flex-1 flex flex-col space-y-2 overflow-hidden min-h-0' : 'max-w-7xl mx-auto space-y-6'}`}>
        
        {/* Header & Controls */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-navy-800 ${selectedStock ? 'pb-2 shrink-0' : 'pb-5'}`}>
          <div>
            <h1 className={`${selectedStock ? 'text-xl' : 'text-3xl'} font-black tracking-tight text-white flex items-center gap-2`}>
              <span>⭐ Stock Watchlists</span>
            </h1>
            {!selectedStock && (
              <p className="text-sm text-gray-400 mt-1">
                Select any stock to move watchlist to side panel & view live TradingView charts
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedWatchlistId}
              onChange={(e) => setSelectedWatchlistId(e.target.value)}
              className="bg-navy-900 border border-navy-800 text-white text-xs sm:text-sm font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500 shadow-md"
            >
              {watchlists.map(w => (
                <option key={w._id} value={w._id}>
                  {w.name} ({w.items?.length || 0} stocks)
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New List
            </button>

            {selectedStock && (
              <button
                onClick={() => setSelectedStock(null)}
                className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 border border-navy-700 text-gray-300 hover:text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                <span>📊 Full Table View</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Animated Layout Container */}
        <div className={`transition-all duration-500 ease-in-out ${selectedStock ? 'flex-1 flex flex-col lg:flex-row gap-2.5 items-stretch overflow-hidden min-h-0' : 'space-y-6'}`}>
          
          {/* Watchlist Panel (Full Width when no stock selected; Left Side Panel when stock is selected) */}
          <div className={`transition-all duration-500 ease-in-out ${selectedStock ? 'w-full lg:w-72 shrink-0 flex flex-col space-y-2 h-full overflow-hidden min-h-0' : 'w-full space-y-6'}`}>
            
            {/* Add Stock Search Bar */}
            <div className="relative shrink-0">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleStockSearch(e.target.value)}
                  placeholder={selectedStock ? "Add stock..." : "Search and add stock (e.g. RELIANCE, TCS)..."}
                  className="w-full px-4 py-2 bg-navy-900 border border-navy-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 shadow-lg text-xs transition"
                />
                <div className="absolute right-3 top-2 text-gray-400 text-xs">
                  🔍
                </div>
              </div>

              {searchQuery.trim().length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-navy-900 border border-navy-800 rounded-xl shadow-2xl overflow-hidden z-30 divide-y divide-navy-800 max-h-64 overflow-y-auto custom-scrollbar">
                  {searchQuery.trim().length < 3 ? (
                    <div className="p-3 text-center text-xs text-amber-400 font-semibold flex items-center justify-center gap-1.5">
                      <span>ℹ️</span> Type 3+ characters to search
                    </div>
                  ) : searchLoading ? (
                    <div className="p-3 text-center text-xs text-gray-400 font-medium flex items-center justify-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                      Searching...
                    </div>
                  ) : stockSuggestions.length > 0 ? (
                    stockSuggestions.map((s) => (
                      <div
                        key={s._id || s.symbol}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddStock(s.symbol);
                        }}
                        className="p-3 hover:bg-navy-800 cursor-pointer flex justify-between items-center transition group"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-white text-xs group-hover:text-amber-400 transition">{s.symbol}</span>
                            {s.sector && <span className="text-[9px] text-gray-400 bg-navy-950 px-1.5 py-0.5 rounded border border-navy-800">{s.sector}</span>}
                          </div>
                          <span className="text-[11px] text-gray-400 block truncate max-w-[140px]">{s.name || s.companyName || s.symbol}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-white">
                            ₹{s.currentPrice ? Number(s.currentPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                          </span>
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded hover:bg-amber-500/20 transition border border-amber-500/30">
                            + Add
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-gray-400 font-medium">
                      No stocks found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Watchlist Stock Cards / Table View */}
            <div className={`bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${selectedStock ? 'flex-1 flex flex-col min-h-0' : ''}`}>
              <div className="px-4 py-2.5 border-b border-navy-800 flex justify-between items-center bg-navy-950/40 shrink-0">
                <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <span>📋</span> {currentWatchlist?.name} ({currentWatchlist?.items?.length || 0})
                </h2>
                {currentWatchlist && watchlists.length > 1 && (
                  <button
                    onClick={() => handleDeleteWatchlist(currentWatchlist._id)}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold px-2 py-0.5 bg-rose-500/10 rounded transition"
                  >
                    Delete List
                  </button>
                )}
              </div>

              {(!currentWatchlist?.items || currentWatchlist.items.length === 0) ? (
                <div className="p-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-navy-950 border border-navy-800 text-gray-500 flex items-center justify-center mx-auto text-xl">
                    ⭐
                  </div>
                  <p className="text-xs text-gray-400 font-medium">Your watchlist is currently empty.</p>
                </div>
              ) : selectedStock ? (
                /* SIDE PANEL COMPACT STOCK CARDS LIST (When stock is selected) */
                <div className="p-2 space-y-1.5 max-h-[720px] overflow-y-auto custom-scrollbar">
                  {currentWatchlist.items.map((item) => {
                    const st = item.stockDetails || {};
                    const isPositive = (st.changePercent || 0) >= 0;
                    const isActive = item.symbol === selectedStock;

                    return (
                      <div
                        key={item._id || item.symbol}
                        onClick={() => setSelectedStock(item.symbol)}
                        className={`px-2.5 py-2 rounded-xl cursor-pointer transition-all duration-300 border flex items-center justify-between group ${
                          isActive
                            ? 'bg-amber-500/10 border-amber-500/60 shadow-md shadow-amber-500/10'
                            : 'bg-navy-950/60 border-navy-800/80 hover:border-navy-700 hover:bg-navy-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] transition shrink-0 ${
                            isActive ? 'bg-amber-500 text-navy-950' : 'bg-navy-900 border border-navy-800 text-amber-400'
                          }`}>
                            {item.symbol.slice(0, 2)}
                          </div>
                          <div className="truncate">
                            <span className={`font-extrabold text-xs block ${isActive ? 'text-amber-400' : 'text-white group-hover:text-amber-400'}`}>
                              {item.symbol}
                            </span>
                            <span className="text-[10px] text-gray-500 block truncate max-w-[90px]">
                              {st.companyName || item.symbol}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="text-right">
                            <div className="font-bold text-white text-[11px]">
                              ₹{st.currentPrice ? Number(st.currentPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—'}
                            </div>
                            {st.changePercent !== undefined && (
                              <div className={`text-[9px] font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isPositive ? '+' : ''}{Number(st.changePercent).toFixed(2)}%
                              </div>
                            )}
                          </div>

                          <button
                            onClick={(e) => handleRemoveStock(e, item.symbol)}
                            className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Remove from watchlist"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* FULL TABLE VIEW (When no stock is selected) */
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-navy-800 text-xs font-bold text-gray-400 uppercase tracking-wider bg-navy-950/60">
                        <th className="px-6 py-4">Stock</th>
                        <th className="px-4 py-4 text-right">Price (₹)</th>
                        <th className="px-4 py-4 text-right">1-Day Change</th>
                        <th className="px-4 py-4 text-right">52W High / Low</th>
                        <th className="px-4 py-4 text-right">P/E Ratio</th>
                        <th className="px-4 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-800 text-sm">
                      {currentWatchlist.items.map((item) => {
                        const st = item.stockDetails || {};
                        const isPositive = (st.changePercent || 0) >= 0;

                        return (
                          <tr
                            key={item._id || item.symbol}
                            onClick={() => setSelectedStock(item.symbol)}
                            className="hover:bg-navy-800/50 cursor-pointer transition group"
                          >
                            <td className="px-6 py-4 font-bold">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-center font-black text-amber-400 text-xs group-hover:border-amber-500 transition">
                                  {item.symbol.slice(0, 3)}
                                </div>
                                <div>
                                  <div className="text-white font-extrabold group-hover:text-amber-400 transition flex items-center gap-2">
                                    {item.symbol}
                                    <span className="opacity-0 group-hover:opacity-100 transition text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                                      View Chart 📈
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-400 font-normal truncate max-w-[180px]">
                                    {st.companyName || item.symbol}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4 text-right font-black text-white text-base">
                              ₹{st.currentPrice ? Number(st.currentPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—'}
                            </td>

                            <td className="px-4 py-4 text-right font-bold">
                              {st.changePercent !== undefined ? (
                                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                  {isPositive ? '+' : ''}{Number(st.changePercent).toFixed(2)}%
                                </span>
                              ) : '—'}
                            </td>

                            <td className="px-4 py-4 text-right text-xs text-gray-300">
                              {st.weekHigh52 ? (
                                <div>
                                  <span className="text-emerald-400 font-semibold">₹{st.weekHigh52}</span> /{' '}
                                  <span className="text-rose-400 font-semibold">₹{st.weekLow52}</span>
                                </div>
                              ) : '—'}
                            </td>

                            <td className="px-4 py-4 text-right text-gray-300">
                              {st.peRatio ? st.peRatio.toFixed(1) : '—'}
                            </td>

                            <td className="px-4 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedStock(item.symbol);
                                  }}
                                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1"
                                >
                                  📈 Chart
                                </button>
                                <button
                                  onClick={(e) => handleRemoveStock(e, item.symbol)}
                                  className="p-1.5 hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 rounded-xl transition text-xs font-semibold"
                                  title="Remove stock"
                                >
                                  ❌
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE MAIN PANEL: TRADINGVIEW CHART (Only visible when stock is selected) */}
          {selectedStock && (
            <div className="flex-1 w-full h-full flex flex-col space-y-2 overflow-hidden min-h-0 animate-fadeIn">
              {/* Compact Action Bar: Stock Symbol, Price, Notes, Fundamental & Close */}
              <div className="bg-navy-900 border border-navy-800 rounded-2xl px-4 py-2 shadow-xl flex items-center justify-between gap-3 text-xs shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="font-black text-base text-white tracking-wide">{selectedStock}</span>
                  {selectedDetails.companyName && (
                    <span className="text-xs text-gray-400 font-medium hidden sm:inline truncate max-w-[200px]">
                      {selectedDetails.companyName}
                    </span>
                  )}
                  {selectedDetails.currentPrice && (
                    <span className="text-xs font-extrabold text-white bg-navy-950 px-2.5 py-1 rounded-lg border border-navy-800 flex items-center gap-1.5">
                      <span>₹{Number(selectedDetails.currentPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      {selectedDetails.changePercent !== undefined && (
                        <span className={selectedDetails.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          ({selectedDetails.changePercent >= 0 ? '+' : ''}{Number(selectedDetails.changePercent).toFixed(2)}%)
                        </span>
                      )}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Notes Option */}
                  <button
                    onClick={() => setOpenNotesForStock((prev) => !prev)}
                    className="px-3.5 py-1.5 bg-navy-800 hover:bg-navy-700 text-amber-300 border border-navy-700 font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    title="Add or Edit Technical Analysis Notes"
                  >
                    <span>📝</span>
                    <span>Notes</span>
                  </button>

                  {/* Fundamental Option */}
                  <Link
                    to={`/stocks/${selectedStock}`}
                    className="px-3.5 py-1.5 bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-500/40 font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    title="Open Fundamental Stock Detail Screen"
                  >
                    <span>📊</span>
                    <span>Fundamental</span>
                  </Link>

                  {/* Close Chart View */}
                  <button
                    onClick={() => {
                      setSelectedStock(null);
                      setOpenNotesForStock(false);
                    }}
                    className="p-1.5 bg-navy-950 hover:bg-navy-800 text-gray-400 hover:text-white rounded-xl border border-navy-800 transition"
                    title="Close Chart View"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Max-size TradingView Chart Component */}
              <div className="flex-1 w-full bg-navy-900 border border-navy-800 rounded-2xl p-2 shadow-2xl overflow-hidden min-h-0">
                <TradingViewChart
                  symbol={selectedStock}
                  exchange={selectedDetails.exchange || 'NSE'}
                  height="h-full"
                  openNotesModal={openNotesForStock}
                />
              </div>
            </div>
          )}

        </div>

        {/* Create Watchlist Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Create New Watchlist</h3>
              <form onSubmit={handleCreateWatchlist} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">Watchlist Name</label>
                  <input
                    type="text"
                    required
                    value={newWatchlistName}
                    onChange={(e) => setNewWatchlistName(e.target.value)}
                    placeholder="e.g. Dividend Picks, High Growth Tech"
                    className="w-full px-4 py-2.5 bg-navy-950 border border-navy-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-navy-950 hover:bg-navy-800 text-gray-300 font-semibold rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm shadow-md"
                  >
                    Create Watchlist
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
