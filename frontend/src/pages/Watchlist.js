import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

  const handleStockSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length > 1) {
      try {
        const res = await fetchStocks({ search: query, limit: 5 });
        if (res.success && res.data) {
          setStockSuggestions(res.data.stocks || []);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setStockSuggestions([]);
    }
  };

  const handleAddStock = async (symbol) => {
    if (!currentWatchlist) return;
    try {
      await addStockToWatchlist(currentWatchlist._id, symbol);
      setSearchQuery('');
      setStockSuggestions([]);
      await loadWatchlists();
    } catch (err) {
      console.error('Error adding stock to watchlist:', err);
    }
  };

  const handleRemoveStock = async (symbol) => {
    if (!currentWatchlist) return;
    try {
      await removeStockFromWatchlist(currentWatchlist._id, symbol);
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
              Monitor key stock price movements, track real-time volume alerts, and organize custom Indian equity watchlists.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition text-center"
            >
              Sign In to Your Account →
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3.5 bg-navy-950 hover:bg-navy-800 border border-navy-800 text-gray-200 font-bold text-sm rounded-xl transition text-center"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-800 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>⭐ Stock Watchlists</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Monitor key stock price movements, volume, and metrics in real-time
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedWatchlistId}
              onChange={(e) => setSelectedWatchlistId(e.target.value)}
              className="bg-navy-900 border border-navy-800 text-white text-sm font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500"
            >
              {watchlists.map(w => (
                <option key={w._id} value={w._id}>
                  {w.name} ({w.items?.length || 0} stocks)
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Watchlist
            </button>
          </div>
        </div>

        {/* Add Stock Search Bar */}
        <div className="relative max-w-2xl">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleStockSearch(e.target.value)}
              placeholder="Search and add stock to watchlist (e.g. RELIANCE, TCS, INFY)..."
              className="w-full px-5 py-3.5 bg-navy-900 border border-navy-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 shadow-xl transition"
            />
            <div className="absolute right-4 top-3.5 text-gray-400">
              🔍
            </div>
          </div>

          {stockSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-navy-900 border border-navy-800 rounded-2xl shadow-2xl overflow-hidden z-20 divide-y divide-navy-800">
              {stockSuggestions.map((s) => (
                <div
                  key={s._id}
                  onClick={() => handleAddStock(s.symbol)}
                  className="p-3.5 hover:bg-navy-800 cursor-pointer flex justify-between items-center transition"
                >
                  <div>
                    <span className="font-extrabold text-white">{s.symbol}</span>
                    <span className="text-xs text-gray-400 ml-2.5">{s.companyName}</span>
                    <span className="text-xs text-gray-500 ml-2">({s.sector})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">₹{s.currentPrice}</span>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
                      + Add
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Watchlist Stock Grid / Table */}
        <div className="bg-navy-900 border border-navy-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-6 py-5 border-b border-navy-800 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              {currentWatchlist?.name} ({currentWatchlist?.items?.length || 0} stocks)
            </h2>
            {currentWatchlist && watchlists.length > 1 && (
              <button
                onClick={() => handleDeleteWatchlist(currentWatchlist._id)}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-3 py-1.5 bg-rose-500/10 rounded-lg transition"
              >
                Delete Watchlist
              </button>
            )}
          </div>

          {(!currentWatchlist?.items || currentWatchlist.items.length === 0) ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-3xl bg-navy-950 border border-navy-800 text-gray-500 flex items-center justify-center mx-auto mb-4">
                ⭐
              </div>
              <h3 className="text-lg font-bold text-white">Your watchlist is empty</h3>
              <p className="text-sm text-gray-400 max-w-sm mx-auto mt-1">
                Search above to add Indian stocks like RELIANCE, TCS, INFY, TATAMOTORS to your watchlist.
              </p>
            </div>
          ) : (
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
                      <tr key={item._id || item.symbol} className="hover:bg-navy-800/50 transition">
                        <td className="px-6 py-4 font-bold">
                          <Link to={`/stocks/${item.symbol}`} className="flex items-center gap-3 group">
                            <div className="w-9 h-9 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-center font-black text-amber-400 text-xs group-hover:border-amber-500 transition">
                              {item.symbol.slice(0, 3)}
                            </div>
                            <div>
                              <div className="text-white font-extrabold group-hover:text-amber-400 transition flex items-center gap-2">
                                {item.symbol}
                              </div>
                              <div className="text-xs text-gray-400 font-normal truncate max-w-[180px]">
                                {st.companyName || item.symbol}
                              </div>
                            </div>
                          </Link>
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
                          <button
                            onClick={() => handleRemoveStock(item.symbol)}
                            className="p-2 hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 rounded-xl transition text-xs font-semibold"
                            title="Remove stock"
                          >
                            ❌ Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
