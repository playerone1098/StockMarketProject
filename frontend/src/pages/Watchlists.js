import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { 
  fetchWatchlists, 
  createWatchlist, 
  deleteWatchlist, 
  removeStockFromWatchlist, 
  fetchWatchlistNews 
} from '../services/api';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { BlogCard } from '../components/BlogCard';

export const Watchlists = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [watchlists, setWatchlists] = useState([]);
  const [news, setNews] = useState([]);
  const [activeWatchlistId, setActiveWatchlistId] = useState('');
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Load Watchlists
  const loadWatchlists = useCallback(async () => {
    if (!user) return;
    setWatchlistLoading(true);
    try {
      const res = await fetchWatchlists();
      if (res.success && res.data) {
        setWatchlists(res.data);
        if (res.data.length > 0 && !activeWatchlistId) {
          setActiveWatchlistId(res.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load watchlists:', err);
    } finally {
      setWatchlistLoading(false);
    }
  }, [user, activeWatchlistId]);

  // Load news
  const loadNews = useCallback(async () => {
    if (!user) return;
    setNewsLoading(true);
    try {
      const res = await fetchWatchlistNews();
      if (res.success && res.data) {
        setNews(res.data);
      }
    } catch (err) {
      console.error('Failed to load watchlist news:', err);
    } finally {
      setNewsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadWatchlists();
      loadNews();
    }
  }, [user, loadWatchlists, loadNews]);

  const handleCreateWatchlist = async (e) => {
    e.preventDefault();
    setActionError('');
    if (!newWatchlistName.trim()) return;

    try {
      const res = await createWatchlist(newWatchlistName);
      if (res.success && res.data) {
        setWatchlists(prev => [res.data, ...prev]);
        setActiveWatchlistId(res.data._id);
        setNewWatchlistName('');
        setIsCreating(false);
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to create watchlist');
    }
  };

  const handleDeleteWatchlist = async (id) => {
    if (!window.confirm('Are you sure you want to delete this watchlist?')) return;
    setActionError('');
    try {
      const res = await deleteWatchlist(id);
      if (res.success) {
        const updated = watchlists.filter(wl => wl._id !== id);
        setWatchlists(updated);
        if (activeWatchlistId === id) {
          setActiveWatchlistId(updated.length > 0 ? updated[0]._id : '');
        }
        loadNews(); // Refresh news as list of stocks changed
      }
    } catch (err) {
      setActionError('Failed to delete watchlist');
    }
  };

  const handleRemoveStock = async (watchlistId, stockId) => {
    setActionError('');
    try {
      const res = await removeStockFromWatchlist(watchlistId, stockId);
      if (res.success && res.data) {
        setWatchlists(prev => prev.map(wl => wl._id === watchlistId ? res.data : wl));
        loadNews(); // Refresh news feed
      }
    } catch (err) {
      setActionError('Failed to remove stock from watchlist');
    }
  };

  const activeWatchlist = watchlists.find(wl => wl._id === activeWatchlistId);

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Watchlists | StockVista</title>
        <meta name="description" content="View and manage your custom stock watchlists, view live stock metrics, and read aggregate news feeds for your watchlisted stocks on StockVista." />
        <link rel="canonical" href={window.location.origin + window.location.pathname} />
        <meta property="og:title" content="My Watchlists | StockVista" />
        <meta property="og:description" content="Manage your personalized stock watchlists and read targeted news updates." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.origin + window.location.pathname} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="My Watchlists | StockVista" />
        <meta name="twitter:description" content="Track your custom stock lists and access watchlisted stock news." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-navy-950">My Watchlists</h1>
            <p className="text-gray-500 text-sm mt-1">
              Create and manage personalized stock groupings to monitor live pricing and movements.
            </p>
          </div>
          <div>
            <button
              onClick={() => setIsCreating(true)}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-2xl transition shadow-sm flex items-center"
            >
              <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Create Watchlist
            </button>
          </div>
        </div>

        {actionError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-650 px-4 py-3 rounded-2xl text-xs font-semibold">
            {actionError}
          </div>
        )}

        {/* Modal for creating watchlist */}
        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-gray-100 shadow-xl">
              <h2 className="text-xl font-bold text-navy-950 mb-4">New Watchlist</h2>
              <form onSubmit={handleCreateWatchlist}>
                <input
                  type="text"
                  required
                  placeholder="e.g. Banking Stocks, Tech Alerts"
                  value={newWatchlistName}
                  onChange={(e) => setNewWatchlistName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 mb-4"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setNewWatchlistName('');
                    }}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-500 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-xs font-bold text-white rounded-xl transition"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab switcher for watchlists */}
        {watchlistLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          </div>
        ) : watchlists.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 mb-12">
            <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-4 text-lg font-bold text-navy-950">No Watchlists Yet</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              Create your first watchlist, search stocks in the directory, and add them to track their live status.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="mt-6 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-2xl transition shadow-sm"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-12">
            {/* Watchlist Main view */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs navigation */}
              <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
                {watchlists.map(wl => (
                  <button
                    key={wl._id}
                    onClick={() => setActiveWatchlistId(wl._id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
                      activeWatchlistId === wl._id
                        ? 'bg-navy-950 text-white'
                        : 'bg-white text-navy-800 border border-gray-200 hover:bg-navy-50'
                    }`}
                  >
                    <span>{wl.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      activeWatchlistId === wl._id ? 'bg-navy-800 text-gray-250' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {wl.stocks?.length || 0}
                    </span>
                  </button>
                ))}
              </div>

              {activeWatchlist && (
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="font-extrabold text-navy-950 text-lg">{activeWatchlist.name}</h2>
                    <button
                      onClick={() => handleDeleteWatchlist(activeWatchlist._id)}
                      className="text-xs text-red-500 hover:text-red-600 font-bold transition flex items-center"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete List
                    </button>
                  </div>

                  {!activeWatchlist.stocks || activeWatchlist.stocks.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                      <p className="text-sm text-gray-500">
                        This watchlist has no stocks. Add stocks by browsing the{' '}
                        <Link to="/stocks" className="text-brand-600 font-bold hover:underline">
                          Stocks Directory
                        </Link>.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-100 text-sm">
                        <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          <tr>
                            <th className="px-6 py-3.5 text-left">Stock</th>
                            <th className="px-6 py-3.5 text-left">Sector</th>
                            <th className="px-6 py-3.5 text-right">Price</th>
                            <th className="px-6 py-3.5 text-right">Change</th>
                            <th className="px-6 py-3.5 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {activeWatchlist.stocks.map(stock => {
                            const isPositive = stock.dayChange >= 0;
                            return (
                              <tr key={stock._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    <div className="mr-3">
                                      <div className="w-8 h-8 rounded-full bg-navy-100 text-navy-800 flex items-center justify-center font-bold text-xs">
                                        {stock.symbol.slice(0, 2)}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="block font-bold text-navy-950">{stock.symbol}</span>
                                      <span className="block text-[11px] text-gray-450 truncate max-w-[150px]">{stock.name}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-xs bg-navy-50 text-navy-800 px-2 py-0.5 rounded-full capitalize">
                                    {stock.sector}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-navy-950">
                                  {formatCurrency(stock.currentPrice)}
                                </td>
                                <td className={`px-6 py-4 text-right font-semibold ${
                                  isPositive ? 'text-brand-600' : 'text-red-500'
                                }`}>
                                  <span className="block text-xs">{isPositive ? '▲' : '▼'} {formatPercent(stock.dayChangePercent)}</span>
                                  <span className="block text-[10px] text-gray-400">{formatCurrency(stock.dayChange)}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    onClick={() => handleRemoveStock(activeWatchlist._id, stock._id)}
                                    className="p-1.5 hover:bg-red-50 text-gray-450 hover:text-red-500 rounded-xl transition"
                                    title="Remove from watchlist"
                                  >
                                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
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
              )}
            </div>

            {/* Sidebar quick stock stats / alert configs */}
            <div className="space-y-6">
              <div className="bg-navy-950 text-white rounded-3xl p-6 border border-navy-900 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-24 h-24 bg-brand-500 opacity-20 rounded-full blur-xl"></div>
                <h3 className="font-extrabold text-lg mb-2">Watchlist Performance</h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  All watchlisted stock metrics are automatically synchronized and scanned. If a stock undergoes a price fluctuation of 4% or more, an alert will be dispatched instantly.
                </p>
                <div className="flex items-center gap-1.5 text-xs text-brand-400 font-bold">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Alert Scanning: Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aggregated news feed for watchlisted items */}
        <div className="border-t border-gray-100 pt-8 mt-12">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-navy-950">Watchlist Stock News</h2>
            <p className="text-gray-500 text-sm mt-1">
              Read aggregated news updates and regulatory filings specifically matching stocks in your watchlists.
            </p>
          </div>

          {newsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-3xl border border-gray-100">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 4a2 2 0 012 2v8a2 2 0 01-2 2h-3l-1 1-1-1m-5-10h.01M12 12h.01M12 16h.01" />
              </svg>
              <h3 className="mt-4 text-sm font-semibold text-navy-950">No Watchlist News Found</h3>
              <p className="mt-2 text-xs text-gray-500 max-w-sm mx-auto">
                Once you add active stocks to your watchlists, any matching news or announcements will compile here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map(blog => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
