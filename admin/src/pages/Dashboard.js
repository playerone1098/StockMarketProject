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
      <div className="flex justify-center items-center h-64 text-slate-700 dark:text-zinc-300 font-semibold">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-slate-900 dark:text-white transition-colors duration-200">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">JodhpurTraders Dashboard</h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Overall platform overview and system metrics</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition shadow-sm"
        >
          Logout
        </button>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition">
          <span className="text-2xl">💡</span>
          <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase mt-2">Trading Ideas</h3>
          <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.tradingIdeas}</p>
          <p className="text-slate-500 dark:text-zinc-400 text-[10px] mt-0.5 font-medium">Published analysis posts</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition">
          <span className="text-2xl">🏢</span>
          <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase mt-2">IPOs Tracked</h3>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.ipos}</p>
          <p className="text-slate-500 dark:text-zinc-400 text-[10px] mt-0.5 font-medium">Upcoming & listed IPOs</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition">
          <span className="text-2xl">📈</span>
          <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase mt-2">Stocks Screener</h3>
          <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.stocks}</p>
          <p className="text-slate-500 dark:text-zinc-400 text-[10px] mt-0.5 font-medium">Companies directory</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition">
          <span className="text-2xl">📝</span>
          <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase mt-2">Blog Posts</h3>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.blogs}</p>
          <p className="text-slate-500 dark:text-zinc-400 text-[10px] mt-0.5 font-medium">Educational articles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm md:col-span-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Quick Management Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/trading-ideas')}
              className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-500/20 text-left transition"
            >
              <div className="font-bold text-blue-800 dark:text-blue-300 text-sm">💡 Manage Ideas</div>
              <div className="text-slate-500 dark:text-zinc-400 text-xs mt-1">Publish signal recommendations</div>
            </button>
            <button
              onClick={() => navigate('/ipos')}
              className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/30 rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-left transition"
            >
              <div className="font-bold text-indigo-800 dark:text-indigo-300 text-sm">🏢 Manage IPOs</div>
              <div className="text-slate-500 dark:text-zinc-400 text-xs mt-1">Configure listing dates & metrics</div>
            </button>
            <button
              onClick={() => navigate('/blogs')}
              className="p-4 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-left transition"
            >
              <div className="font-bold text-slate-800 dark:text-zinc-200 text-sm">📝 Manage Blog Posts</div>
              <div className="text-slate-500 dark:text-zinc-400 text-xs mt-1">Author tutorials & commentaries</div>
            </button>
            <button
              onClick={() => navigate('/stocks')}
              className="p-4 bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/30 rounded-2xl hover:bg-purple-100 dark:hover:bg-purple-500/20 text-left transition"
            >
              <div className="font-bold text-purple-800 dark:text-purple-300 text-sm">📈 Manage Stocks</div>
              <div className="text-slate-500 dark:text-zinc-400 text-xs mt-1">Configure tickers & prices</div>
            </button>
          </div>
        </div>

        {/* System status panel */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">System Status</h2>
          <div className="space-y-4 text-xs font-semibold">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400">Backend API</span>
              <span className={backendStatus === 'Connected' ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md' : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10 px-2 py-0.5 rounded-md'}>
                {backendStatus}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400">Database connection</span>
              <span className={dbStatus === 'Connected' ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md' : 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-500/10 px-2 py-0.5 rounded-md'}>
                {dbStatus}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 dark:text-zinc-400">Admin Session</span>
              <span className="text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
