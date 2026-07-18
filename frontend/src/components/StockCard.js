import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatPercent, formatIndianNumber } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { fetchWatchlists, addStockToWatchlist, removeStockFromWatchlist, createWatchlist } from '../services/api';

export const StockCard = ({ stock }) => {
  const isPositive = stock.dayChange >= 0;
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [watchlists, setWatchlists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  // Check if stock is in any watchlist to show a highlighted star
  useEffect(() => {
    const checkStarred = async () => {
      if (user) {
        try {
          const res = await fetchWatchlists();
          if (res.success && res.data) {
            setWatchlists(res.data);
            const inAny = res.data.some(wl => 
              wl.stocks?.some(s => s._id === stock._id || s.symbol === stock.symbol)
            );
            setIsStarred(inAny);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    checkStarred();
  }, [user, stock._id, stock.symbol]);

  const toggleDropdown = async (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
    if (!showDropdown && user) {
      setLoading(true);
      try {
        const res = await fetchWatchlists();
        if (res.success && res.data) {
          setWatchlists(res.data);
        }
      } catch (err) {
        console.error('Failed to load watchlists', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleWatchlist = async (e, watchlist) => {
    e.stopPropagation();
    const isCurrentlyAdded = watchlist.stocks?.some(s => s._id === stock._id || s.symbol === stock.symbol);
    
    try {
      let res;
      if (isCurrentlyAdded) {
        res = await removeStockFromWatchlist(watchlist._id, stock._id);
      } else {
        res = await addStockToWatchlist(watchlist._id, stock.symbol);
      }

      if (res.success) {
        // Update local watchlist representation
        const updated = watchlists.map(wl => wl._id === watchlist._id ? res.data : wl);
        setWatchlists(updated);
        
        // Update starred state
        const inAny = updated.some(wl => 
          wl.stocks?.some(s => s._id === stock._id || s.symbol === stock.symbol)
        );
        setIsStarred(inAny);
      }
    } catch (err) {
      console.error('Failed to toggle stock in watchlist:', err);
    }
  };

  const handleQuickCreate = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newListName.trim()) return;

    try {
      const res = await createWatchlist(newListName);
      if (res.success && res.data) {
        const addedRes = await addStockToWatchlist(res.data._id, stock.symbol);
        if (addedRes.success) {
          const updatedLists = [addedRes.data, ...watchlists];
          setWatchlists(updatedLists);
          setIsStarred(true);
          setNewListName('');
          setIsCreatingList(false);
        }
      }
    } catch (err) {
      console.error('Failed to create and add stock:', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 card-hover flex flex-col justify-between relative">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {stock.logoUrl ? (
              <img src={stock.logoUrl} alt={stock.name} className="w-8 h-8 rounded-full mr-2 object-contain bg-gray-55 p-0.5" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-navy-100 text-navy-800 flex items-center justify-center font-bold text-sm mr-2">
                {stock.symbol.slice(0, 2)}
              </div>
            )}
            <div>
              <h3 className="font-bold text-navy-950 text-base leading-tight">{stock.symbol}</h3>
              <p className="text-xs text-gray-505 truncate max-w-[120px]">{stock.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-navy-50 text-navy-700 capitalize">
              {stock.sector}
            </span>
            
            {/* Star Icon Toggle */}
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className={`p-1 rounded-full hover:bg-gray-100 transition focus:outline-none ${
                  isStarred ? 'text-amber-500' : 'text-gray-300'
                }`}
                title="Watch stock"
              >
                <svg className="h-5 w-5" fill={isStarred ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.248.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.175 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.772-.562-.373-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                </svg>
              </button>

              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl bg-white border border-gray-150 text-gray-800 p-3 z-20 text-left">
                    {!user ? (
                      <div className="text-center py-2">
                        <p className="text-xs text-gray-500 mb-2">Sign in to add stocks to your watchlists.</p>
                        <Link
                          to="/login"
                          onClick={() => setShowDropdown(false)}
                          className="inline-block px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-[10px] font-bold rounded-xl transition"
                        >
                          Sign In
                        </Link>
                      </div>
                    ) : loading ? (
                      <div className="flex justify-center py-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-600"></div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Add to list:</span>
                        {watchlists.length === 0 ? (
                          <p className="text-[10px] text-gray-400">No watchlists found.</p>
                        ) : (
                          <div className="max-h-32 overflow-y-auto space-y-1.5">
                            {watchlists.map(wl => {
                              const isAdded = wl.stocks?.some(s => s._id === stock._id || s.symbol === stock.symbol);
                              return (
                                <label key={wl._id} className="flex items-center text-xs text-navy-950 font-medium hover:bg-gray-50 p-1 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={!!isAdded}
                                    onChange={(e) => handleToggleWatchlist(e, wl)}
                                    className="mr-2 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                                  />
                                  <span className="truncate">{wl.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                        
                        <div className="border-t border-gray-100 pt-2 mt-2">
                          {!isCreatingList ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); setIsCreatingList(true); }}
                              className="text-[10px] font-bold text-brand-600 hover:text-brand-700 flex items-center"
                            >
                              + Create Watchlist
                            </button>
                          ) : (
                            <form onSubmit={handleQuickCreate} className="flex gap-1.5 mt-1">
                              <input
                                type="text"
                                size="sm"
                                placeholder="List name"
                                value={newListName}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setNewListName(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-200 rounded-lg text-[10px] focus:outline-none focus:border-brand-500"
                              />
                              <button
                                type="submit"
                                className="px-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg text-[10px] transition"
                              >
                                Add
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="my-3">
          <div className="text-xl font-bold text-navy-950">{formatCurrency(stock.currentPrice)}</div>
          <div className={`text-xs font-semibold flex items-center mt-0.5 ${isPositive ? 'text-brand-600' : 'text-red-500'}`}>
            <span>{isPositive ? '▲' : '▼'} {formatCurrency(stock.dayChange)} ({formatPercent(stock.dayChangePercent)})</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-50 pt-3 mt-2 grid grid-cols-2 gap-2 text-[10px] text-gray-550">
        <div>
          <span className="block text-gray-400">Market Cap</span>
          <span className="font-semibold text-navy-900">{formatIndianNumber(stock.marketCap)}</span>
        </div>
        <div className="text-right">
          <span className="block text-gray-400">Exchange</span>
          <span className="font-semibold text-navy-900">{stock.exchange}</span>
        </div>
      </div>
    </div>
  );
};
