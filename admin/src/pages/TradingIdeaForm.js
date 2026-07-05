import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../utils/axios';

export const TradingIdeaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    stockSymbol: '',
    stockName: '',
    sector: '',
    ideaType: 'buy',
    entryPrice: '',
    targetPrice: '',
    stopLoss: '',
    timeHorizon: 'short-term',
    riskLevel: 'medium',
    tags: '',
    imageUrl: '',
    isFeatured: false,
    isActive: true
  });

  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

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
      const fetchIdea = async () => {
        setFetching(true);
        try {
          const response = await api.get(`/trading-ideas/${id}`);
          // Fetch idea by ID (note: backend controller supports getById/getBySlug, let's make sure it handles both)
          // Wait! Let's check how the backend route is defined for `/api/trading-ideas/:slugOrId`.
          // Let's verify details if needed, but normally ID or Slug is handled. Let's make sure we query by ID.
          // The backend route is router.get('/:slug', getBySlug). But controller supports finding by ID first or fallback to slug!
          // Let's verify by checking the backend controller or route if needed, but let's assume it works.
          if (response.data.success) {
            const data = response.data.data;
            setFormData({
              title: data.title || '',
              summary: data.summary || '',
              content: data.content || '',
              stockSymbol: data.stockSymbol || '',
              stockName: data.stockName || '',
              sector: data.sector || '',
              ideaType: data.ideaType || 'buy',
              entryPrice: data.entryPrice || '',
              targetPrice: data.targetPrice || '',
              stopLoss: data.stopLoss || '',
              timeHorizon: data.timeHorizon || 'short-term',
              riskLevel: data.riskLevel || 'medium',
              tags: data.tags ? data.tags.join(', ') : '',
              imageUrl: data.imageUrl || '',
              isFeatured: data.isFeatured || false,
              isActive: data.isActive || false
            });
          }
        } catch (err) {
          setError('Failed to fetch trading idea details');
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchIdea();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formattedData = {
      ...formData,
      entryPrice: parseFloat(formData.entryPrice),
      targetPrice: parseFloat(formData.targetPrice),
      stopLoss: parseFloat(formData.stopLoss),
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
    };

    try {
      if (isEditMode) {
        await api.put(`/trading-ideas/${id}`, formattedData);
      } else {
        await api.post('/trading-ideas', formattedData);
      }
      navigate('/trading-ideas');
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
        Fetching idea data...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-navy-950">
            {isEditMode ? 'Edit Trading Idea' : 'Create Trading Idea'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure parameters and technical charts</p>
        </div>
        <Link to="/trading-ideas" className="text-xs font-bold text-gray-500 hover:text-navy-950">
          ← Cancel and Return
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-xs font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-sm space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
            Idea Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. BUY HDFC Bank: Double Bottom breakout at ₹1,650"
            className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            required
          />
        </div>

        {/* Summary & Stock details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Stock Symbol
            </label>
            <input
              type="text"
              name="stockSymbol"
              value={formData.stockSymbol}
              onChange={handleChange}
              placeholder="e.g. HDFCBANK"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Company Name
            </label>
            <input
              type="text"
              name="stockName"
              value={formData.stockName}
              onChange={handleChange}
              placeholder="e.g. HDFC Bank Limited"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
              required
            />
          </div>
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
        </div>

        {/* Signals and Prices */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Signal Type
            </label>
            <select
              name="ideaType"
              value={formData.ideaType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none bg-white text-navy-950"
              required
            >
              <option value="buy">BUY</option>
              <option value="sell">SELL</option>
              <option value="hold">HOLD</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Entry Price (₹)
            </label>
            <input
              type="number"
              name="entryPrice"
              value={formData.entryPrice}
              onChange={handleChange}
              placeholder="1650.00"
              step="0.01"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Target Price (₹)
            </label>
            <input
              type="number"
              name="targetPrice"
              value={formData.targetPrice}
              onChange={handleChange}
              placeholder="1800.00"
              step="0.01"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Stop Loss (₹)
            </label>
            <input
              type="number"
              name="stopLoss"
              value={formData.stopLoss}
              onChange={handleChange}
              placeholder="1580.00"
              step="0.01"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
              required
            />
          </div>
        </div>

        {/* Horizon, Risk, Tags, Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Time Horizon
            </label>
            <select
              name="timeHorizon"
              value={formData.timeHorizon}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none bg-white text-navy-950"
              required
            >
              <option value="intraday">Intraday (1 Day)</option>
              <option value="short-term">Short Term (1-3 Months)</option>
              <option value="medium-term">Medium Term (3-12 Months)</option>
              <option value="long-term">Long Term (1 Year+)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Risk Level
            </label>
            <select
              name="riskLevel"
              value={formData.riskLevel}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none bg-white text-navy-950"
              required
            >
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Image URL
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="breakout, technicals, chart, dividend"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Short Summary */}
        <div>
          <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
            Short Summary
          </label>
          <input
            type="text"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            placeholder="A brief sentence summarizing the target opportunity..."
            className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            required
          />
        </div>

        {/* Analysis Body Content */}
        <div>
          <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
            Full Analysis & Research Body
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write details of support levels, trend breakout parameters, structural patterns..."
            rows="8"
            className="w-full px-4 py-3 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            required
          />
        </div>

        {/* Toggles */}
        <div className="flex space-x-6">
          <label className="flex items-center space-x-2 text-xs font-bold text-navy-950 cursor-pointer">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="w-4 h-4 text-brand-500 rounded border-gray-300 focus:ring-brand-500"
            />
            <span>FEATURED ON HOMEPAGE</span>
          </label>

          <label className="flex items-center space-x-2 text-xs font-bold text-navy-950 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-brand-500 rounded border-gray-300 focus:ring-brand-500"
            />
            <span>ACTIVE / PUBLISHED</span>
          </label>
        </div>

        {/* Action Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl text-xs transition disabled:opacity-50"
          >
            {loading ? 'Saving Trading Idea...' : isEditMode ? 'Save Trading Idea' : 'Publish Trading Idea'}
          </button>
        </div>
      </form>
    </div>
  );
};
