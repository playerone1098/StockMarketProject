import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchBlogs } from '../services/api';
import { BlogCard } from '../components/BlogCard';

export const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const category = searchParams.get('category') || ''; // market-analysis, education, etc.
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const loadBlogs = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 9,
          search,
          category
        };
        const response = await fetchBlogs(params);
        if (response.success && response.data) {
          setBlogs(response.data);
          if (response.pagination) {
            setTotalPages(response.pagination.pages || 1);
            setTotalItems(response.pagination.total || 0);
          }
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBlogs();
  }, [category, search, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ category, search: searchInput, page: '1' });
  };

  const handleFilterCategory = (catVal) => {
    setSearchParams({ category: catVal, search, page: '1' });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ category, search, page: newPage.toString() });
    }
  };

  return (
    <>
      <Helmet>
        <title>{category ? `${category.replace('-', ' ').toUpperCase()}` : 'Finance Education'} Blog & Insights | StockVista</title>
        <meta name="description" content="Read daily market research reports, financial news analysis, stock sector forecasts, and easy personal finance tutorials on StockVista." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-navy-950">Finance Blog & Insights</h1>
          <p className="text-gray-500 text-sm mt-1">Develop your investing vocabulary, read market commentary and analysis ({totalItems} articles found)</p>
        </div>

        {/* Search and Filter Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="lg:col-span-2 flex gap-2">
            <input
              type="text"
              placeholder="Search blog articles..."
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

        {/* Categories filters */}
        <div className="flex flex-wrap gap-2 mb-8 items-center border-b border-gray-100 pb-5">
          <span className="text-xs font-semibold text-gray-400 mr-2">Categories:</span>
          {[
            { label: 'All Articles', value: '' },
            { label: '📈 Market Analysis', value: 'market-analysis' },
            { label: '🎓 Education', value: 'education' },
            { label: '🏢 IPO Review', value: 'ipo-review' },
            { label: '📊 Sector Analysis', value: 'sector-analysis' },
            { label: '💰 Personal Finance', value: 'personal-finance' },
            { label: '📰 News & Updates', value: 'news' }
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleFilterCategory(cat.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
                category === cat.value
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-navy-800 border-gray-200 hover:bg-navy-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Blog Post Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-4 text-sm font-semibold text-navy-950">No articles found</h3>
            <p className="mt-2 text-xs text-gray-500">We couldn't find any articles matching your search query or filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {blogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
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
