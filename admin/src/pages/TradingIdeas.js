import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';

export const TradingIdeas = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const response = await api.get('/trading-ideas/admin/all');
        if (response.data.success) {
          setIdeas(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching trading ideas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchIdeas();
  }, []);

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const response = await api.patch(`/trading-ideas/${id}`, { isActive: !currentStatus });
      if (response.data.success) {
        setIdeas(ideas.map(idea => 
          idea._id === id ? { ...idea, isActive: !currentStatus } : idea
        ));
      }
    } catch (error) {
      console.error('Error toggling trading idea status:', error);
      alert('Failed to update trading idea status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trading idea?')) {
      try {
        const response = await api.delete(`/trading-ideas/${id}`);
        if (response.data.success) {
          setIdeas(ideas.filter(idea => idea._id !== id));
        }
      } catch (error) {
        console.error('Error deleting trading idea:', error);
        alert('Failed to delete trading idea');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-navy-950 font-semibold">
        Loading trading ideas...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-navy-950">Trading Ideas</h1>
          <p className="text-gray-500 text-sm mt-1">Publish and configure stock picks and buy/sell signals</p>
        </div>
        <Link
          to="/trading-ideas/new"
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition"
        >
          Add New Idea
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase">
              <tr>
                <th className="px-6 py-4 text-left">Trading Idea</th>
                <th className="px-6 py-4 text-left">Stock Symbol</th>
                <th className="px-6 py-4 text-left">Signal</th>
                <th className="px-6 py-4 text-left">Entry / Target</th>
                <th className="px-6 py-4 text-left">Horizon</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {ideas.map((idea) => (
                <tr key={idea._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-bold text-navy-950">{idea.title}</div>
                      <div className="text-[10px] text-gray-500 capitalize">{idea.sector}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-navy-800 uppercase">
                    {idea.stockSymbol || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                      idea.ideaType === 'buy' ? 'bg-brand-50 text-brand-700' :
                      idea.ideaType === 'sell' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {idea.ideaType}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-navy-950">
                    ₹{idea.entryPrice} / <span className="text-brand-600">₹{idea.targetPrice}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 capitalize">
                    {idea.timeHorizon}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full border ${
                      idea.isActive 
                        ? 'bg-brand-50 text-brand-700 border-brand-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {idea.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {idea.isFeatured && (
                      <span className="ml-2 px-2.5 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-bold">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/trading-ideas/${idea._id}/edit`}
                        className="bg-navy-50 hover:bg-navy-100 text-navy-800 px-3 py-1.5 rounded-lg transition"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleToggleActive(idea._id, idea.isActive)}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg transition"
                      >
                        {idea.isActive ? 'Suspend' : 'Resume'}
                      </button>
                      <button 
                        onClick={() => handleDelete(idea._id)}
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

      {ideas.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100 mt-6">
          <div className="text-gray-500 text-sm font-semibold mb-2">No trading ideas found</div>
          <p className="text-gray-600 text-xs mb-4">Create your first trading recommendation to get started!</p>
          <Link
            to="/trading-ideas/new"
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            Create Idea
          </Link>
        </div>
      )}
    </div>
  );
};
