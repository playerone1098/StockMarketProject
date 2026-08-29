import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export const ScreenerPresets = () => {
  const [presets, setPresets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const fetchPresets = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('/api/screener-presets/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setPresets(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching admin screener presets:', err);
      setError('Failed to load screener presets.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPresets();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the screener preset "${title}"?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.delete(`/api/screener-presets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMessage(`Preset "${title}" deleted successfully.`);
        fetchPresets();
      }
    } catch (err) {
      console.error('Failed to delete preset:', err);
      alert('Error deleting preset.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            ⚡ Screener Presets Management
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Configure predefined formulas for the public Stock Screener (e.g. Value Bargains, High Dividends).
          </p>
        </div>

        <Link
          to="/screener-presets/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-lg hover:shadow-cyan-500/20 transition-all"
        >
          + Add New Preset
        </Link>
      </div>

      {message && (
        <div className="p-4 bg-emerald-950/70 border border-emerald-800/50 rounded-xl text-emerald-400 text-sm font-semibold">
          {message}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/70 border border-rose-800/50 rounded-xl text-rose-400 text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        {isLoading ? (
          <div className="py-12 text-center text-zinc-400 text-sm font-medium">Loading presets...</div>
        ) : presets.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-zinc-300 font-semibold">No Screener Presets Found</p>
            <Link
              to="/screener-presets/new"
              className="inline-block px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-xl text-xs font-bold border border-cyan-500/30"
            >
              Create First Preset
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                  <th className="pb-3 pl-2">Preset Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Filter Criteria Summary</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-sm">
                {presets.map((preset) => {
                  const f = preset.filters || {};
                  const criteria = [];
                  if (f.minMarketCap) criteria.push(`Cap ≥ ₹${f.minMarketCap}Cr`);
                  if (f.maxMarketCap) criteria.push(`Cap ≤ ₹${f.maxMarketCap}Cr`);
                  if (f.maxPe) criteria.push(`P/E ≤ ${f.maxPe}`);
                  if (f.minDividend) criteria.push(`Div Yield ≥ ${f.minDividend}%`);
                  if (f.near52wHigh) criteria.push('Near 52W High');

                  return (
                    <tr key={preset._id} className="hover:bg-zinc-850/50 transition-colors">
                      <td className="py-4 pl-2 font-bold text-white">
                        <div className="flex items-center gap-2">
                          ✨ {preset.title}
                        </div>
                        <p className="text-xs text-zinc-400 font-normal mt-0.5 max-w-xs truncate">
                          {preset.description}
                        </p>
                      </td>

                      <td className="py-4">
                        <span className="px-2.5 py-1 bg-zinc-800 rounded-lg text-xs text-zinc-300 font-semibold">
                          {preset.category || 'Valuation'}
                        </span>
                      </td>

                      <td className="py-4 text-xs text-zinc-300">
                        {criteria.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {criteria.map((c, i) => (
                              <span key={i} className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-cyan-300">
                                {c}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-zinc-500">Custom / All</span>
                        )}
                      </td>

                      <td className="py-4">
                        {preset.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                            ✓ Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500">
                            ✗ Inactive
                          </span>
                        )}
                      </td>

                      <td className="py-4 pr-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/screener-presets/edit/${preset._id}`}
                            className="px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-zinc-950 border border-zinc-800 rounded-lg"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(preset._id, preset.title)}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-zinc-950 border border-zinc-800 rounded-lg"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
