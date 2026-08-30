import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../utils/axios';

export const StockForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    sector: '',
    exchange: 'NSE',
    currentPrice: '',
    dayChange: '',
    dayChangePercent: '',
    weekHigh52: '',
    weekLow52: '',
    marketCap: '',
    marketCapLabel: 'Large Cap',
    logoUrl: '',
    about: '',
    isActive: true
  });

  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  // AI Auto-Fill state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuccess, setAiSuccess] = useState('');
  const [aiError, setAiError] = useState('');
  const [aiSource, setAiSource] = useState('');

  // AI About Generator state
  const [aboutLoading, setAboutLoading] = useState(false);
  const [aboutMsg, setAboutMsg] = useState('');

  useEffect(() => {
    const loadSectors = async () => {
      try {
        const response = await api.get('/sectors');
        if (response.data.success) {
          setSectors(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching sectors:', err);
      }
    };
    loadSectors();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const fetchStock = async () => {
        setFetching(true);
        try {
          const response = await api.get(`/stocks/admin/all`); // Get all admin stocks
          if (response.data.success) {
            const list = response.data.data;
            const data = list.find(s => s._id === id); // find by id from admin list
            if (data) {
              setFormData({
                symbol: data.symbol || '',
                name: data.name || '',
                sector: data.sector || '',
                exchange: data.exchange || 'NSE',
                currentPrice: data.currentPrice || '',
                dayChange: data.dayChange || '',
                dayChangePercent: data.dayChangePercent || '',
                weekHigh52: data.weekHigh52 || '',
                weekLow52: data.weekLow52 || '',
                marketCap: data.marketCap || '',
                marketCapLabel: data.marketCapLabel || 'Large Cap',
                logoUrl: data.logoUrl || '',
                about: data.about || '',
                isActive: data.isActive || false
              });
            } else {
              setError('Failed to find stock in database');
            }
          }
        } catch (err) {
          setError('Failed to fetch stock details');
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchStock();
    }
  }, [id, isEditMode]);

  /**
   * AI Auto-Fill: Fetches comprehensive company data from Yahoo Finance
   * and populates the entire form with a single click.
   */
  const handleAiAutoFill = async () => {
    const symbol = formData.symbol.trim();
    if (!symbol) {
      setAiError('Please enter a stock symbol first (e.g., RELIANCE, TCS, INFY)');
      return;
    }

    setAiLoading(true);
    setAiError('');
    setAiSuccess('');
    setAiSource('');

    try {
      const response = await api.get(`/stocks/ai-lookup/${symbol}`);
      if (response.data.success) {
        const data = response.data.data;

        setFormData({
          symbol: data.symbol || symbol,
          name: data.name || '',
          sector: data.sector || '',
          exchange: data.exchange || 'NSE',
          currentPrice: data.currentPrice || '',
          dayChange: data.dayChange || '',
          dayChangePercent: data.dayChangePercent || '',
          weekHigh52: data.weekHigh52 || '',
          weekLow52: data.weekLow52 || '',
          marketCap: data.marketCap || '',
          marketCapLabel: data.marketCapLabel || 'Large Cap',
          logoUrl: data.logoUrl || '',
          about: data.about || formData.about || '',
          isActive: data.isActive !== undefined ? data.isActive : true
        });

        setAiSuccess(response.data.message || `Successfully auto-filled details for ${data.symbol}`);
        setAiSource(response.data.source || 'Yahoo Finance + Gemini AI');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'AI lookup failed. Please check the symbol and try again.';
      setAiError(msg);
    } finally {
      setAiLoading(false);
    }
  };

  /**
   * Generates AI company About overview
   */
  const handleGenerateAbout = async () => {
    if (!formData.name && !formData.symbol) {
      alert('Please enter stock symbol or company name first.');
      return;
    }

    setAboutLoading(true);
    setAboutMsg('');

    try {
      const res = await api.post('/stocks/generate-about', {
        symbol: formData.symbol,
        name: formData.name,
        sector: formData.sector
      });

      if (res.data.success && res.data.data.about) {
        setFormData(prev => ({
          ...prev,
          about: res.data.data.about
        }));
        setAboutMsg('✨ AI company description generated! Review and edit if needed before saving.');
      }
    } catch (err) {
      console.error('Error generating about:', err);
      alert('Failed to generate AI description. Please try again.');
    } finally {
      setAboutLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Clear AI messages when user manually edits
    if (aiSuccess || aiError) {
      setAiSuccess('');
      setAiError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formattedData = {
      ...formData,
      currentPrice: parseFloat(formData.currentPrice) || 0,
      dayChange: parseFloat(formData.dayChange) || 0,
      dayChangePercent: parseFloat(formData.dayChangePercent) || 0,
      weekHigh52: parseFloat(formData.weekHigh52) || 0,
      weekLow52: parseFloat(formData.weekLow52) || 0,
      marketCap: parseFloat(formData.marketCap) || 0
    };

    try {
      if (isEditMode) {
        await api.put(`/stocks/${id}`, formattedData);
      } else {
        await api.post('/stocks', formattedData);
      }
      navigate('/stocks');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong while saving.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64 text-navy-950 font-semibold">
        Fetching stock details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-navy-950">
            {isEditMode ? 'Edit Stock Details' : 'Add New Stock'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure exchange ticker symbol and pricing indicators</p>
        </div>
        <Link to="/stocks" className="text-xs font-bold text-gray-500 hover:text-navy-950">
          ← Cancel and Return
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-xs font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-sm space-y-6">

        {/* ═══════════════════════════════════════════════════════════════
            AI AUTO-FILL SECTION — The star of the show
            ═══════════════════════════════════════════════════════════════ */}
        {!isEditMode && (
          <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-violet-50/80 p-5">
            {/* Decorative shimmer effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-200/30 to-violet-200/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-tr from-blue-200/20 to-indigo-200/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">✨</span>
                  <h3 className="text-sm font-black text-indigo-900 tracking-tight">AI Auto-Fill</h3>
                  <span className="text-[9px] uppercase tracking-widest text-indigo-600 font-bold px-2 py-0.5 bg-indigo-100 rounded-full">
                    Powered by Yahoo Finance
                  </span>
                </div>
                <p className="text-xs text-indigo-700/80 leading-relaxed">
                  Type a stock symbol below and click <strong>"Auto-Fill with AI"</strong> to automatically populate all company details — name, sector, price, market cap, and more.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAiAutoFill}
                disabled={aiLoading || !formData.symbol.trim()}
                className={`
                  flex-shrink-0 relative group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold
                  transition-all duration-300 transform
                  ${aiLoading
                    ? 'bg-indigo-300 text-white cursor-wait'
                    : formData.symbol.trim()
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {aiLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Fetching data...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Auto-Fill with AI</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Success feedback */}
            {aiSuccess && (
              <div className="mt-4 flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-xs font-medium animate-fadeIn">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-bold">{aiSuccess}</p>
                  {aiSource && (
                    <p className="text-emerald-600/70 mt-0.5">Source: {aiSource} • Review the auto-filled data below and make any adjustments before saving.</p>
                  )}
                </div>
              </div>
            )}

            {/* AI Error feedback */}
            {aiError && (
              <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-medium animate-fadeIn">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{aiError}</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Stock Symbol
            </label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              placeholder="e.g. RELIANCE"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500 uppercase"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Company Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Reliance Industries Limited"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Sector
            </label>
            <select
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none bg-white text-navy-950"
              required
            >
              <option value="">Select Sector</option>
              {sectors.map(sec => (
                <option key={sec._id} value={sec.name}>{sec.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Exchange
            </label>
            <select
              name="exchange"
              value={formData.exchange}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none bg-white text-navy-950"
              required
            >
              <option value="NSE">NSE</option>
              <option value="BSE">BSE</option>
              <option value="BOTH">BOTH</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Cap Category
            </label>
            <select
              name="marketCapLabel"
              value={formData.marketCapLabel}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none bg-white text-navy-950"
              required
            >
              <option value="Large Cap">Large Cap</option>
              <option value="Mid Cap">Mid Cap</option>
              <option value="Small Cap">Small Cap</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Current Price (₹)
            </label>
            <input
              type="number"
              name="currentPrice"
              value={formData.currentPrice}
              onChange={handleChange}
              placeholder="1250.00"
              step="0.01"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Day Change (₹)
            </label>
            <input
              type="number"
              name="dayChange"
              value={formData.dayChange}
              onChange={handleChange}
              placeholder="12.50"
              step="0.01"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Day Change Percent (%)
            </label>
            <input
              type="number"
              name="dayChangePercent"
              value={formData.dayChangePercent}
              onChange={handleChange}
              placeholder="1.01"
              step="0.01"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              52-Week High (₹)
            </label>
            <input
              type="number"
              name="weekHigh52"
              value={formData.weekHigh52}
              onChange={handleChange}
              placeholder="1450.00"
              step="0.01"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              52-Week Low (₹)
            </label>
            <input
              type="number"
              name="weekLow52"
              value={formData.weekLow52}
              onChange={handleChange}
              placeholder="950.00"
              step="0.01"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Market Capitalization
            </label>
            <input
              type="number"
              name="marketCap"
              value={formData.marketCap}
              onChange={handleChange}
              placeholder="e.g. 150000000"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Logo Icon URL
            </label>
            <input
              type="url"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              placeholder="https://logo.clearbit.com/..."
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            ABOUT COMPANY (AI GENERATED & EDITABLE)
            ═══════════════════════════════════════════════════════════════ */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-navy-950 uppercase tracking-wide">
              About Company (AI Overview)
            </label>
            <button
              type="button"
              onClick={handleGenerateAbout}
              disabled={aboutLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition shadow-xs"
            >
              {aboutLoading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-indigo-600" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Generating AI text...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>{formData.about ? 'Regenerate with AI' : 'Generate About with AI'}</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-gray-500 leading-relaxed">
            This overview is shown to platform users under the stock detail page. Click <strong>"Generate About with AI"</strong> to create structured details, review/check the generated content, and save.
          </p>

          {aboutMsg && (
            <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl text-xs font-semibold text-indigo-800">
              {aboutMsg}
            </div>
          )}

          <textarea
            name="about"
            rows="6"
            value={formData.about}
            onChange={handleChange}
            placeholder="About Reliance Industries Limited... (Click 'Generate About with AI' to auto-generate structured company details)"
            className="w-full px-4 py-3 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500 leading-relaxed"
          ></textarea>
        </div>

        <label className="flex items-center space-x-2 text-xs font-bold text-navy-950 cursor-pointer pt-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-brand-500 rounded border-gray-300 focus:ring-brand-500"
          />
          <span>ACTIVE / VISIBLE</span>
        </label>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl text-xs transition"
          >
            {loading ? 'Saving Stock data...' : isEditMode ? 'Save Stock' : 'Publish Stock'}
          </button>
        </div>
      </form>
    </div>
  );
};
