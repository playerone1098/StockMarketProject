import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    stocks: 0,
    tradingIdeas: 0,
    ipos: 0,
    blogs: 0
  });
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsResponse = await api.get('/market/stats');
        if (statsResponse.data.success && statsResponse.data.data.counts) {
          const counts = statsResponse.data.data.counts;
          setStats({
            stocks: counts.stocks || 0,
            tradingIdeas: counts.tradingIdeas || 0,
            ipos: counts.ipos || 0,
            blogs: counts.blogs || 0
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    const fetchStatus = async () => {
      try {
        const res = await api.get('/status');
        if (res.data.success) {
          setDbStatus(res.data.data.database);
          setBackendStatus(res.data.data.backend);
        }
      } catch (error) {
        console.error('Error fetching status:', error);
        setDbStatus('Setup Required');
        setBackendStatus('Disconnected');
      }
    };

    const loadData = async () => {
      await Promise.all([fetchStats(), fetchStatus()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-navy-950 font-semibold">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-navy-950">StockVista Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overall platform overview and system metrics</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition"
        >
          Logout
        </button>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm hover:shadow-md transition">
          <span className="text-2xl">💡</span>
          <h3 className="text-xs font-bold text-gray-400 uppercase mt-2">Trading Ideas</h3>
          <p className="text-3xl font-black text-brand-600 mt-1">{stats.tradingIdeas}</p>
          <p className="text-gray-500 text-[10px] mt-0.5 font-medium">Published analysis posts</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm hover:shadow-md transition">
          <span className="text-2xl">🏢</span>
          <h3 className="text-xs font-bold text-gray-400 uppercase mt-2">IPOs Tracked</h3>
          <p className="text-3xl font-black text-navy-950 mt-1">{stats.ipos}</p>
          <p className="text-gray-500 text-[10px] mt-0.5 font-medium">Upcoming & listed IPOs</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm hover:shadow-md transition">
          <span className="text-2xl">📈</span>
          <h3 className="text-xs font-bold text-gray-400 uppercase mt-2">Stocks screener</h3>
          <p className="text-3xl font-black text-brand-600 mt-1">{stats.stocks}</p>
          <p className="text-gray-500 text-[10px] mt-0.5 font-medium">Companies directory</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm hover:shadow-md transition">
          <span className="text-2xl">📝</span>
          <h3 className="text-xs font-bold text-gray-400 uppercase mt-2">Blog Posts</h3>
          <p className="text-3xl font-black text-navy-950 mt-1">{stats.blogs}</p>
          <p className="text-gray-500 text-[10px] mt-0.5 font-medium">Educational articles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm md:col-span-2">
          <h2 className="text-xl font-bold text-navy-950 mb-4">Quick Management Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/trading-ideas')}
              className="p-4 bg-brand-50 border border-brand-100 rounded-2xl hover:bg-brand-100 text-left transition"
            >
              <div className="font-bold text-brand-800 text-sm">💡 Manage Ideas</div>
              <div className="text-gray-500 text-xs mt-1">Publish signal recommendations</div>
            </button>
            <button
              onClick={() => navigate('/ipos')}
              className="p-4 bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-100 text-left transition"
            >
              <div className="font-bold text-blue-800 text-sm">🏢 Manage IPOs</div>
              <div className="text-gray-500 text-xs mt-1">Configure listing dates & metrics</div>
            </button>
            <button
              onClick={() => navigate('/blogs')}
              className="p-4 bg-navy-50 border border-navy-100 rounded-2xl hover:bg-navy-100 text-left transition"
            >
              <div className="font-bold text-navy-800 text-sm">📝 Manage Blog Posts</div>
              <div className="text-gray-500 text-xs mt-1">Author tutorials & commentaries</div>
            </button>
            <button
              onClick={() => navigate('/stocks')}
              className="p-4 bg-purple-50 border border-purple-100 rounded-2xl hover:bg-purple-100 text-left transition"
            >
              <div className="font-bold text-purple-800 text-sm">📈 Manage Stocks</div>
              <div className="text-gray-500 text-xs mt-1">Configure tickers & prices</div>
            </button>
          </div>
        </div>

        {/* System status panel */}
        <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-navy-950 mb-4">System Status</h2>
          <div className="space-y-4 text-xs font-semibold">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-500">Backend API</span>
              <span className={backendStatus === 'Connected' ? 'text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md' : 'text-red-600 bg-red-50 px-2 py-0.5 rounded-md'}>
                {backendStatus}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-500">Database connection</span>
              <span className={dbStatus === 'Connected' ? 'text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md' : 'text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-md'}>
                {dbStatus}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500">Admin Session</span>
              <span className="text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
