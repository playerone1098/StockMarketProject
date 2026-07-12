import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';

export const IPOs = () => {
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const handleSyncIpos = async () => {
    setSyncing(true);
    try {
      const response = await api.post('/ipos/sync');
      if (response.data.success) {
        alert(`Successfully synchronized IPO data!\nUpdated: ${response.data.data.updatedCount}`);
        // Re-fetch IPOs to update table
        const iposRes = await api.get('/ipos/admin/all');
        if (iposRes.data.success) {
          setIpos(iposRes.data.data);
        }
      }
    } catch (error) {
      console.error('Error syncing IPOs:', error);
      alert('Failed to sync IPO data. Please check logs.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const fetchIpos = async () => {
      try {
        const response = await api.get('/ipos/admin/all');
        if (response.data.success) {
          setIpos(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching IPOs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchIpos();
  }, []);

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const response = await api.patch(`/ipos/${id}`, { isActive: !currentStatus });
      if (response.data.success) {
        setIpos(ipos.map(ipo => 
          ipo._id === id ? { ...ipo, isActive: !currentStatus } : ipo
        ));
      }
    } catch (error) {
      console.error('Error toggling IPO status:', error);
      alert('Failed to update IPO status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this IPO?')) {
      try {
        const response = await api.delete(`/ipos/${id}`);
        if (response.data.success) {
          setIpos(ipos.filter(ipo => ipo._id !== id));
        }
      } catch (error) {
        console.error('Error deleting IPO:', error);
        alert('Failed to delete IPO');
      }
    }
  };

  const fmtDate = (dStr) => {
    if (!dStr) return '—';
    return new Date(dStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-navy-950 font-semibold">
        Loading IPO board...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-navy-950">IPO Board Tracker</h1>
          <p className="text-gray-500 text-sm mt-1">Configure open bidding windows, listing dates, and subscription status</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSyncIpos}
            disabled={syncing}
            className={`font-bold px-4 py-2.5 rounded-xl text-sm transition flex items-center ${
              syncing 
                ? 'bg-gray-150 text-gray-400 cursor-not-allowed' 
                : 'bg-navy-50 hover:bg-navy-100 text-navy-800'
            }`}
          >
            {syncing ? '🔄 Syncing IPOs...' : '⚡ Sync IPOs'}
          </button>
          <Link
            to="/ipos/new"
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition"
          >
            Add New IPO
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase">
              <tr>
                <th className="px-6 py-4 text-left">Company Name</th>
                <th className="px-6 py-4 text-left">Proposed Symbol</th>
                <th className="px-6 py-4 text-left">Price Band</th>
                <th className="px-6 py-4 text-left">Timelines</th>
                <th className="px-6 py-4 text-left">Subscription</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {ipos.map((ipo) => (
                <tr key={ipo._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-bold text-navy-950">{ipo.companyName}</div>
                      <div className="text-[10px] text-gray-500 capitalize">{ipo.sector} Sector</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-navy-800 uppercase">
                    {ipo.symbol || '—'}
                  </td>
                  <td className="px-6 py-4 font-medium text-navy-950">
                    {ipo.priceRange?.min && ipo.priceRange?.max
                      ? `₹${ipo.priceRange.min} - ₹${ipo.priceRange.max}`
                      : 'TBA'}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <div>Open: {fmtDate(ipo.openDate)}</div>
                    <div>Close: {fmtDate(ipo.closeDate)}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-brand-700">
                    {ipo.subscriptionStatus?.total ? `${ipo.subscriptionStatus.total}x` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase border ${
                      ipo.status === 'open' ? 'bg-brand-50 text-brand-700 border-brand-200' :
                      ipo.status === 'listed' ? 'bg-navy-50 text-navy-700 border-navy-200' :
                      ipo.status === 'closed' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {ipo.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-bold">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/ipos/${ipo._id}/edit`}
                        className="bg-navy-50 hover:bg-navy-100 text-navy-800 px-3 py-1.5 rounded-lg transition"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleToggleActive(ipo._id, ipo.isActive)}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg transition"
                      >
                        {ipo.isActive ? 'Suspend' : 'Resume'}
                      </button>
                      <button 
                        onClick={() => handleDelete(ipo._id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
