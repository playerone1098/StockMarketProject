import React, { useState, useEffect } from 'react';
import api from '../utils/axios';

export const Analytics = () => {
  const [stats, setStats] = useState({
    totalPageViews: 0,
    totalIdeaViews: 0,
    totalIpoViews: 0,
    totalBlogViews: 0,
    totalStockViews: 0,
    topPages: [],
    topContent: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/analytics/stats');
      if (response.data.success && response.data.data) {
        setStats(response.data.data);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics stats:', err);
      setError('Could not retrieve analytics data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getTotalResourceViews = () => {
    return stats.totalIdeaViews + stats.totalIpoViews + stats.totalBlogViews + stats.totalStockViews;
  };

  const getEngagementRate = () => {
    if (!stats.totalPageViews) return '0%';
    const totalResourceViews = getTotalResourceViews();
    const rate = (totalResourceViews / stats.totalPageViews) * 100;
    return `${rate.toFixed(1)}%`;
  };

  const getMostPopularRoute = () => {
    if (!stats.topPages || stats.topPages.length === 0) return 'None';
    return stats.topPages[0]._id;
  };

  const formatPathName = (path) => {
    if (!path) return 'Unknown';
    if (path.includes('sector=')) {
      return `Sector Search`;
    }
    
    if (path === '/') return 'Home Dashboard';
    if (path === '/trading-ideas') return 'Trading Ideas Board';
    if (path === '/ipos') return 'IPO Board';
    if (path === '/blog') return 'Blogs list';
    if (path === '/stocks') return 'Stocks Screener';
    if (path === '/about') return 'About Us';
    if (path === '/contact') return 'Contact Page';
    if (path === '/faq') return 'FAQ Page';
    if (path.startsWith('/trading-ideas/')) return 'Trading Idea details';
    if (path.startsWith('/ipos/')) return 'IPO details';
    if (path.startsWith('/blog/')) return 'Blog details';
    
    return path;
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-navy-950 font-semibold">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mr-2"></span>
        Gathering site intelligence...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="bg-navy-950 text-white rounded-3xl p-8 border border-navy-900 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Analytics & Intel</h1>
          <p className="text-gray-400 mt-2 max-w-xl text-sm leading-relaxed">
            Monitor real-time user views across trading recommendations, educational posts, and stock detail views.
          </p>
        </div>
        <div>
          <button
            onClick={fetchAnalytics}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white transition px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-brand-500/10"
          >
            <span>{refreshing ? 'Synchronizing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-sm text-xs font-bold">
          {error}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-150">
          <h3 className="text-gray-400 text-xs font-bold uppercase">Total Page Views</h3>
          <p className="text-3xl font-black text-navy-950 mt-2">{stats.totalPageViews}</p>
          <span className="text-[10px] text-gray-500 font-semibold mt-1 block">📄 Page routes loaded</span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-150">
          <h3 className="text-gray-400 text-xs font-bold uppercase">Content Clicks</h3>
          <p className="text-3xl font-black text-brand-600 mt-2">{getTotalResourceViews()}</p>
          <span className="text-[10px] text-gray-500 font-semibold mt-1 block">🔥 Details pages views</span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-150">
          <h3 className="text-gray-400 text-xs font-bold uppercase">Engagement Rate</h3>
          <p className="text-3xl font-black text-navy-950 mt-2">{getEngagementRate()}</p>
          <span className="text-[10px] text-gray-500 font-semibold mt-1 block">📊 View-to-click ratio</span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-150">
          <h3 className="text-gray-400 text-xs font-bold uppercase">Hottest Route</h3>
          <p className="text-sm font-extrabold text-brand-700 mt-3 truncate" title={getMostPopularRoute()}>
            {formatPathName(getMostPopularRoute())}
          </p>
          <span className="text-[10px] text-gray-500 font-semibold mt-1 block">✨ Most active page</span>
        </div>
      </div>

      {/* Main Aggregated Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Most Visited Pages List */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-150">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-navy-950">Traffic Distribution</h2>
            <span className="text-xs text-gray-400 font-bold">Top 10 Routes</span>
          </div>

          <div className="space-y-4">
            {stats.topPages?.length === 0 ? (
              <p className="text-gray-400 text-xs text-center py-12">No route tracking data recorded yet.</p>
            ) : (
              stats.topPages?.map((item, index) => {
                const percentage = stats.totalPageViews
                  ? ((item.count / stats.totalPageViews) * 100).toFixed(0)
                  : 0;

                return (
                  <div key={item._id} className="group">
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="text-gray-700 font-semibold" title={item._id}>
                        {formatPathName(item._id)}
                      </span>
                      <span className="text-navy-950 font-bold">
                        {item.count} views <span className="text-gray-400 font-normal">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Content Leaderboard */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-150">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-navy-950">Popular Content Leaderboard</h2>
            <span className="text-xs text-gray-400 font-bold font-outfit">Clicks by item</span>
          </div>

          {stats.topContent?.length === 0 ? (
            <div className="text-gray-400 text-xs text-center py-12">
              No content analytics recorded yet. Users must click on cards to view details.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Rank</th>
                    <th className="pb-3 font-semibold">Resource Title</th>
                    <th className="pb-3 text-right font-semibold">Type</th>
                    <th className="pb-3 text-right font-semibold">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.topContent?.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50/50 transition">
                      <td className="py-3">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold ${
                          idx === 0 ? 'bg-amber-100 text-amber-800' :
                          idx === 1 ? 'bg-slate-100 text-slate-800' :
                          idx === 2 ? 'bg-orange-100 text-orange-800' :
                          'text-gray-400'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-bold text-navy-950 truncate max-w-[150px]">
                        {item.resourceTitle || 'Unnamed Resource'}
                      </td>
                      <td className="py-3 text-right text-[10px] font-bold text-gray-400 uppercase">
                        {item.eventType?.replace('_view', '')}
                      </td>
                      <td className="py-3 text-right font-bold text-navy-950">
                        {item.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
