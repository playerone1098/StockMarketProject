import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';

export const Stocks = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await api.get('/stocks/admin/all');
        if (response.data.success) {
          setStocks(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching stocks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this stock?')) {
      try {
        const response = await api.delete(`/stocks/${id}`);
        if (response.data.success) {
          setStocks(stocks.filter(stock => stock._id !== id));
        }
      } catch (error) {
        console.error('Error deleting stock:', error);
        alert('Failed to delete stock');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-navy-950">Stocks Directory</h1>
          <p className="text-gray-500 text-sm mt-1">Configure company tickers, exchanges, and current price bands</p>
        </div>
        <Link
          to="/stocks/new"
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition"
        >
          Add New Stock
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase">
              <tr>
                <th className="px-6 py-4 text-left">Stock / Ticker</th>
                <th className="px-6 py-4 text-left">Sector</th>
                <th className="px-6 py-4 text-left">Exchange</th>
                <th className="px-6 py-4 text-left">Price (INR)</th>
                <th className="px-6 py-4 text-left">Day Change</th>
                <th className="px-6 py-4 text-left">Market Cap</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {stocks.map((stock) => {
                const isPositive = stock.dayChange >= 0;
                return (
                  <tr key={stock._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-navy-950">{stock.symbol}</div>
                      <div className="text-[10px] text-gray-500">{stock.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium capitalize">
                      {stock.sector}
                    </td>
                    <td className="px-6 py-4 text-navy-800 font-bold uppercase">
                      {stock.exchange}
                    </td>
                    <td className="px-6 py-4 text-navy-950 font-bold">
                      ₹{stock.currentPrice.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 font-bold ${isPositive ? 'text-brand-600' : 'text-red-500'}`}>
                      {isPositive ? '▲' : '▼'} {stock.dayChangePercent.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {stock.marketCapLabel || 'Large Cap'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/stocks/${stock._id}/edit`}
                          className="bg-navy-50 hover:bg-navy-100 text-navy-800 px-3 py-1.5 rounded-lg transition"
                        >
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDelete(stock._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition"
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
      </div>
    </div>
  );
};
