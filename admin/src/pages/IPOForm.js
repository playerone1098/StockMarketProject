import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../utils/axios';

export const IPOForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    companyName: '',
    symbol: '',
    description: '',
    sector: '',
    priceRangeMin: '',
    priceRangeMax: '',
    lotSize: '',
    issueSize: '',
    issueType: 'Fresh Issue',
    openDate: '',
    closeDate: '',
    listingDate: '',
    listingPrice: '',
    status: 'upcoming',
    subRetail: '',
    subNii: '',
    subQib: '',
    subTotal: '',
    registrar: '',
    imageUrl: '',
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
      const fetchIpo = async () => {
        setFetching(true);
        try {
          const response = await api.get(`/ipos/${id}`);
          if (response.data.success) {
            const data = response.data.data;
            const fmtDateInput = (d) => d ? new Date(d).toISOString().split('T')[0] : '';
            setFormData({
              companyName: data.companyName || '',
              symbol: data.symbol || '',
              description: data.description || '',
              sector: data.sector || '',
              priceRangeMin: data.priceRange?.min || '',
              priceRangeMax: data.priceRange?.max || '',
              lotSize: data.lotSize || '',
              issueSize: data.issueSize || '',
              issueType: data.issueType || 'Fresh Issue',
              openDate: fmtDateInput(data.openDate),
              closeDate: fmtDateInput(data.closeDate),
              listingDate: fmtDateInput(data.listingDate),
              listingPrice: data.listingPrice || '',
              status: data.status || 'upcoming',
              subRetail: data.subscriptionStatus?.retail || '',
              subNii: data.subscriptionStatus?.nii || '',
              subQib: data.subscriptionStatus?.qib || '',
              subTotal: data.subscriptionStatus?.total || '',
              registrar: data.registrar || '',
              imageUrl: data.imageUrl || '',
              isActive: data.isActive || false
            });
          }
        } catch (err) {
          setError('Failed to fetch IPO data');
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchIpo();
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
      companyName: formData.companyName,
      symbol: formData.symbol,
      description: formData.description,
      sector: formData.sector,
      priceRange: {
        min: parseFloat(formData.priceRangeMin) || 0,
        max: parseFloat(formData.priceRangeMax) || 0
      },
      lotSize: parseInt(formData.lotSize, 10) || 0,
      issueSize: formData.issueSize,
      issueType: formData.issueType,
      openDate: formData.openDate,
      closeDate: formData.closeDate,
      listingDate: formData.listingDate || null,
      listingPrice: parseFloat(formData.listingPrice) || 0,
      status: formData.status,
      subscriptionStatus: {
        retail: parseFloat(formData.subRetail) || 0,
        nii: parseFloat(formData.subNii) || 0,
        qib: parseFloat(formData.subQib) || 0,
        total: parseFloat(formData.subTotal) || 0
      },
      registrar: formData.registrar,
      imageUrl: formData.imageUrl,
      isActive: formData.isActive
    };

    try {
      if (isEditMode) {
        await api.put(`/ipos/${id}`, formattedData);
      } else {
        await api.post('/ipos', formattedData);
      }
      navigate('/ipos');
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
        Fetching IPO data...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-navy-950 font-outfit">
            {isEditMode ? 'Edit IPO Details' : 'Add New IPO'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure company parameters and bidding window details</p>
        </div>
        <Link to="/ipos" className="text-xs font-bold text-gray-500 hover:text-navy-950">
          ← Cancel and Return
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-xs font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. Swiggy Limited"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Proposed Ticker
            </label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              placeholder="e.g. SWIGGY"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
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
              Issue Size (Cr)
            </label>
            <input
              type="text"
              name="issueSize"
              value={formData.issueSize}
              onChange={handleChange}
              placeholder="e.g. ₹11,327 Cr"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Issue Type
            </label>
            <select
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none bg-white text-navy-950"
              required
            >
              <option value="Fresh Issue">Fresh Issue</option>
              <option value="Offer for Sale (OFS)">Offer for Sale (OFS)</option>
              <option value="Fresh Issue & OFS">Fresh Issue & OFS</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Price Min (₹)
            </label>
            <input
              type="number"
              name="priceRangeMin"
              value={formData.priceRangeMin}
              onChange={handleChange}
              placeholder="371"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Price Max (₹)
            </label>
            <input
              type="number"
              name="priceRangeMax"
              value={formData.priceRangeMax}
              onChange={handleChange}
              placeholder="390"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Lot Size
            </label>
            <input
              type="number"
              name="lotSize"
              value={formData.lotSize}
              onChange={handleChange}
              placeholder="38"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Bidding Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none bg-white text-navy-950"
              required
            >
              <option value="upcoming">Upcoming</option>
              <option value="open">Open Today</option>
              <option value="closed">Closed Bidding</option>
              <option value="listed">Listed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Open Date
            </label>
            <input
              type="date"
              name="openDate"
              value={formData.openDate}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Close Date
            </label>
            <input
              type="date"
              name="closeDate"
              value={formData.closeDate}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Listing Date
            </label>
            <input
              type="date"
              name="listingDate"
              value={formData.listingDate}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Listing Price (₹)
            </label>
            <input
              type="number"
              name="listingPrice"
              value={formData.listingPrice}
              onChange={handleChange}
              placeholder="425.00"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Subscription details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-150">
          <div>
            <label className="block text-[10px] font-bold text-navy-950 mb-1.5 uppercase">
              Retail (times)
            </label>
            <input
              type="number"
              name="subRetail"
              value={formData.subRetail}
              onChange={handleChange}
              placeholder="1.25"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-medium focus:outline-none bg-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-navy-950 mb-1.5 uppercase">
              NII (times)
            </label>
            <input
              type="number"
              name="subNii"
              value={formData.subNii}
              onChange={handleChange}
              placeholder="5.40"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-medium focus:outline-none bg-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-navy-950 mb-1.5 uppercase">
              QIB (times)
            </label>
            <input
              type="number"
              name="subQib"
              value={formData.subQib}
              onChange={handleChange}
              placeholder="24.10"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-medium focus:outline-none bg-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-navy-950 mb-1.5 uppercase font-black text-brand-600">
              Total Subscription
            </label>
            <input
              type="number"
              name="subTotal"
              value={formData.subTotal}
              onChange={handleChange}
              placeholder="12.35"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-black focus:outline-none bg-white text-brand-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Registrar
            </label>
            <input
              type="text"
              name="registrar"
              value={formData.registrar}
              onChange={handleChange}
              placeholder="e.g. Link Intime India Private Ltd"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Logo/Cover URL
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://logo.clearbit.com/..."
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
            IPO Company Profile Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Write information about Swiggy's business segments, listing goals, fresh issues..."
            rows="6"
            className="w-full px-4 py-3 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            required
          />
        </div>

        <label className="flex items-center space-x-2 text-xs font-bold text-navy-950 cursor-pointer">
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
            {loading ? 'Saving IPO data...' : isEditMode ? 'Save IPO' : 'Publish IPO'}
          </button>
        </div>
      </form>
    </div>
  );
};
