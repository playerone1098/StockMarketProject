import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

export const ScreenerPresetForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Valuation',
    icon: 'Filter',
    sortBy: 'marketCap',
    sortOrder: 'desc',
    isPopular: true,
    isActive: true,
    filters: {
      sector: '',
      minMarketCap: '',
      maxMarketCap: '',
      minPe: '',
      maxPe: '',
      minDividend: '',
      near52wHigh: false,
      near52wLow: false
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchPreset = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get('/api/screener-presets/admin/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          const found = (res.data.data || []).find(p => p._id === id);
          if (found) {
            setFormData({
              title: found.title || '',
              description: found.description || '',
              category: found.category || 'Valuation',
              icon: found.icon || 'Filter',
              sortBy: found.sortBy || 'marketCap',
              sortOrder: found.sortOrder || 'desc',
              isPopular: Boolean(found.isPopular),
              isActive: Boolean(found.isActive),
              filters: {
                sector: found.filters?.sector || '',
                minMarketCap: found.filters?.minMarketCap !== null && found.filters?.minMarketCap !== undefined ? String(found.filters.minMarketCap) : '',
                maxMarketCap: found.filters?.maxMarketCap !== null && found.filters?.maxMarketCap !== undefined ? String(found.filters.maxMarketCap) : '',
                minPe: found.filters?.minPe !== null && found.filters?.minPe !== undefined ? String(found.filters.minPe) : '',
                maxPe: found.filters?.maxPe !== null && found.filters?.maxPe !== undefined ? String(found.filters.maxPe) : '',
                minDividend: found.filters?.minDividend !== null && found.filters?.minDividend !== undefined ? String(found.filters.minDividend) : '',
                near52wHigh: Boolean(found.filters?.near52wHigh),
                near52wLow: Boolean(found.filters?.near52wLow)
              }
            });
          }
        }
      } catch (err) {
        console.error('Error loading preset details:', err);
        setError('Failed to fetch preset details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreset();
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        icon: formData.icon,
        sortBy: formData.sortBy,
        sortOrder: formData.sortOrder,
        isPopular: formData.isPopular,
        isActive: formData.isActive,
        filters: {
          sector: formData.filters.sector || '',
          minMarketCap: formData.filters.minMarketCap !== '' ? parseFloat(formData.filters.minMarketCap) : null,
          maxMarketCap: formData.filters.maxMarketCap !== '' ? parseFloat(formData.filters.maxMarketCap) : null,
          minPe: formData.filters.minPe !== '' ? parseFloat(formData.filters.minPe) : null,
          maxPe: formData.filters.maxPe !== '' ? parseFloat(formData.filters.maxPe) : null,
          minDividend: formData.filters.minDividend !== '' ? parseFloat(formData.filters.minDividend) : null,
          near52wHigh: formData.filters.near52wHigh,
          near52wLow: formData.filters.near52wLow
        }
      };

      if (isEditMode) {
        await axios.put(`/api/screener-presets/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/screener-presets', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      navigate('/screener-presets');
    } catch (err) {
      console.error('Preset save error:', err);
      setError(err.response?.data?.message || 'Failed to save preset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/screener-presets"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-semibold"
        >
          ← Back to Presets
        </Link>

        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          ✨ {isEditMode ? 'Edit Screener Preset' : 'Create Screener Preset'}
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/70 border border-rose-800/50 rounded-xl text-rose-400 text-sm font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Preset Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. High Dividend Bargains"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Valuation">Valuation</option>
              <option value="Dividends">Dividends</option>
              <option value="Momentum">Momentum</option>
              <option value="MarketCap">MarketCap</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">Description *</label>
          <textarea
            required
            rows={3}
            placeholder="Describe what stocks this preset filters for..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Criteria Section */}
        <div className="border-t border-zinc-800 pt-4 space-y-4">
          <h3 className="font-semibold text-sm text-cyan-400">Filter Formula Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Min Market Cap (₹ Cr)</label>
              <input
                type="number"
                placeholder="e.g. 20000"
                value={formData.filters.minMarketCap}
                onChange={(e) => setFormData({
                  ...formData,
                  filters: { ...formData.filters, minMarketCap: e.target.value }
                })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Max P/E Ratio</label>
              <input
                type="number"
                placeholder="e.g. 25"
                value={formData.filters.maxPe}
                onChange={(e) => setFormData({
                  ...formData,
                  filters: { ...formData.filters, maxPe: e.target.value }
                })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Min Dividend Yield (%)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 2.5"
                value={formData.filters.minDividend}
                onChange={(e) => setFormData({
                  ...formData,
                  filters: { ...formData.filters, minDividend: e.target.value }
                })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
          <Link
            to="/screener-presets"
            className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-sm font-semibold"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 transition-all"
          >
            💾 Save Preset
          </button>
        </div>
      </form>
    </div>
  );
};
