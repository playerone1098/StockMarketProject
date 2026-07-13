import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchTradingIdeas, fetchSectors } from '../services/api';
import { IdeaCard } from '../components/IdeaCard';

export const TradingIdeas = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ideas, setIdeas] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters from URL query params
  const category = searchParams.get('sector') || ''; // 'sector' url param maps to backend sector filter
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const ideaType = searchParams.get('type') || ''; // buy/sell/hold

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const loadSectors = async () => {
      try {
        const response = await fetchSectors();
        if (response.success && response.data) {
          setSectors(response.data);
        }
      } catch (err) {
        console.error('Error fetching sectors:', err);
      }
    };
    loadSectors();
  }, []);

  useEffect(() => {
    const loadIdeas = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 9,
          search,
          sector: category,
          ideaType
        };
        const response = await fetchTradingIdeas(params);
        if (response.success && response.data) {
          setIdeas(response.data);
          if (response.pagination) {
            setTotalPages(response.pagination.pages || 1);
            setTotalItems(response.pagination.total || 0);
          }
        }
      } catch (err) {
        console.error('Error loading trading ideas:', err);
      } finally {
        setLoading(false);
      }
    };
    loadIdeas();
  }, [category, search, page, ideaType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ sector: category, search: searchInput, type: ideaType, page: '1' });
  };

  const handleFilterSector = (secName) => {
    setSearchParams({ sector: secName, search, type: ideaType, page: '1' });
  };

  const handleFilterType = (typeVal) => {
    setSearchParams({ sector: category, search, type: typeVal, page: '1' });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ sector: category, search, type: ideaType, page: newPage.toString() });
    }
  };

  return (
    <>
      <Helmet>
        <title>{category ? `${category} Sector` : 'All'} Trading Ideas & Picks | StockVista</title>
        <meta name="description" content="Browse professional short-term, medium-term and long-term trading ideas and stock analysis filtered by sector, signals, and research tags." />
        <meta property="og:title" content="Trading Ideas & Stock Picks | StockVista" />
        <meta property="og:description" content="Browse professional short-term, medium-term and long-term trading ideas and stock analysis filtered by sector, signals, and research tags." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.origin + window.location.pathname} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Trading Ideas & Stock Picks | StockVista" />
        <meta name="twitter:description" content="Browse professional trading ideas and stock analysis filtered by sector on StockVista." />
        <link rel="canonical" href={window.location.origin + window.location.pathname} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-navy-950">Trading Ideas & Analysis</h1>
          <p className="text-gray-500 text-sm mt-1">Research-backed market recommendations from certified analysts ({totalItems} ideas found)</p>
        </div>

        {/* Filters and Search Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-2 flex gap-2">
            <input
              type="text"
              placeholder="Search stocks, tickers or ideas..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-250 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-sm transition"
            >
              Search
            </button>
          </form>

          {/* Type Filter Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">Signal:</span>
            <select
              value={ideaType}
              onChange={(e) => handleFilterType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-250 text-sm focus:outline-none bg-white text-navy-950 font-medium"
            >
              <option value="">All Signals</option>
              <option value="buy">BUY</option>
              <option value="sell">SELL</option>
              <option value="hold">HOLD</option>
            </select>
          </div>

          {/* Sector Filter Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">Sector:</span>
            <select
              value={category}
              onChange={(e) => handleFilterSector(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-250 text-sm focus:outline-none bg-white text-navy-950 font-medium"
            >
              <option value="">All Sectors</option>
              {sectors.map((sec) => (
                <option key={sec._id} value={sec.name}>{sec.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid Display */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-sm font-semibold text-navy-950">No trading ideas found</h3>
            <p className="mt-2 text-xs text-gray-500">Try adjusting your filters, sector settings, or search parameters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {ideas.map((idea) => (
                <IdeaCard key={idea._id} idea={idea} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-1 pt-4">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-lg text-sm border font-semibold border-gray-200 text-navy-900 bg-white hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  ◀ Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold border transition ${
                      page === i + 1
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'border-gray-200 text-navy-900 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-2 rounded-lg text-sm border font-semibold border-gray-200 text-navy-900 bg-white hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Next ▶
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};
