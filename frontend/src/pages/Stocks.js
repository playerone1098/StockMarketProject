import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchStocks, fetchSectors } from '../services/api';
import { StockCard } from '../components/StockCard';

export const Stocks = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stocks, setStocks] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const sectorFilter = searchParams.get('sector') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const loadSectors = async () => {
      try {
        const response = await fetchSectors();
        if (response.success && response.data) {
          setSectors(response.data);
        }
      } catch (err) {
        console.error('Error loading sectors:', err);
      }
    };
    loadSectors();
  }, []);

  useEffect(() => {
    const loadStocks = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 12,
          search,
          sector: sectorFilter
        };
        const response = await fetchStocks(params);
        if (response.success && response.data) {
          setStocks(response.data);
          if (response.pagination) {
            setTotalPages(response.pagination.pages || 1);
            setTotalItems(response.pagination.total || 0);
          }
        }
      } catch (err) {
        console.error('Error fetching stocks:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStocks();
  }, [sectorFilter, search, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ sector: sectorFilter, search: searchInput, page: '1' });
  };

  const handleFilterSector = (secName) => {
    setSearchParams({ sector: secName, search, page: '1' });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ sector: sectorFilter, search, page: newPage.toString() });
    }
  };

  return (
    <>
      <Helmet>
        <title>{sectorFilter ? `${sectorFilter} Stocks` : 'Indian Stock Screener'} | StockVista</title>
        <meta name="description" content="Research and screen top Indian stocks by market sectors like Banking, IT, Auto, FMCG. Get real-time price updates and market caps." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-navy-950">Stocks Directory</h1>
          <p className="text-gray-500 text-sm mt-1">Research financial metrics and track day updates of prominent Indian companies ({totalItems} stocks tracked)</p>
        </div>

        {/* Search Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <form onSubmit={handleSearchSubmit} className="lg:col-span-2 flex gap-2">
            <input
              type="text"
              placeholder="Search by stock symbol or company name (e.g. RELIANCE, TCS)..."
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
        </div>

        {/* Sectors filter pills */}
        <div className="flex flex-wrap gap-2 mb-8 items-center border-b border-gray-100 pb-5">
          <span className="text-xs font-semibold text-gray-400 mr-2">Sectors:</span>
          <button
            onClick={() => handleFilterSector('')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
              !sectorFilter
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-white text-navy-800 border-gray-200 hover:bg-navy-50'
            }`}
          >
            All Sectors
          </button>
          {sectors.map((sec) => (
            <button
              key={sec._id}
              onClick={() => handleFilterSector(sec.name)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
                sectorFilter === sec.name
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-navy-800 border-gray-200 hover:bg-navy-50'
              }`}
            >
              {sec.name}
            </button>
          ))}
        </div>

        {/* Grid Display */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          </div>
        ) : stocks.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-sm font-semibold text-navy-950">No stocks found</h3>
            <p className="mt-2 text-xs text-gray-500">We couldn't find any stock symbols matching your filter criteria.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {stocks.map((stock) => (
                <StockCard key={stock._id} stock={stock} />
              ))}
            </div>

            {/* Pagination */}
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
