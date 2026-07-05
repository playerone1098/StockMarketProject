import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchIPOs } from '../services/api';
import { IPOCard } from '../components/IPOCard';

export const IPOs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const statusFilter = searchParams.get('status') || ''; // 'open', 'upcoming', 'closed', 'listed'
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const loadIpos = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 9,
          status: statusFilter
        };
        const response = await fetchIPOs(params);
        if (response.success && response.data) {
          setIpos(response.data);
          if (response.pagination) {
            setTotalPages(response.pagination.pages || 1);
            setTotalItems(response.pagination.total || 0);
          }
        }
      } catch (err) {
        console.error('Error fetching IPOs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadIpos();
  }, [statusFilter, page]);

  const handleFilterStatus = (statusVal) => {
    setSearchParams({ status: statusVal, page: '1' });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ status: statusFilter, page: newPage.toString() });
    }
  };

  return (
    <>
      <Helmet>
        <title>{statusFilter ? `${statusFilter.toUpperCase()}` : 'Indian Stock Market'} IPOs Board & List | StockVista</title>
        <meta name="description" content="Track ongoing, upcoming, closed, and listed Initial Public Offerings (IPOs) in the Indian Stock market with subscription details." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-navy-950">IPO Tracker & Board</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor upcoming capital listings, active subscription windows, and performance metrics ({totalItems} IPOs found)</p>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-100 pb-5">
          {[
            { label: 'All Listings', value: '' },
            { label: '🟢 Open Today', value: 'open' },
            { label: '🔵 Upcoming Issues', value: 'upcoming' },
            { label: '🔴 Closed Issues', value: 'closed' },
            { label: '⚫ Already Listed', value: 'listed' }
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => handleFilterStatus(btn.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                statusFilter === btn.value
                  ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
                  : 'bg-white text-navy-800 border-gray-250 hover:bg-navy-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* IPO Listings Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          </div>
        ) : ipos.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-4 text-sm font-semibold text-navy-950">No IPOs found</h3>
            <p className="mt-2 text-xs text-gray-500">There are no IPO updates matching this listing category right now.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {ipos.map((ipo) => (
                <IPOCard key={ipo._id} ipo={ipo} />
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
