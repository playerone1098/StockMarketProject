import React, { useState, useEffect } from 'react';
import { fetchStocks } from '../services/api';
import { formatCurrency, formatPercent } from '../utils/formatters';

export const MarketTicker = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStocks = async () => {
      try {
        const response = await fetchStocks({ limit: 10 });
        if (response.success && response.data) {
          setStocks(response.data);
        }
      } catch (err) {
        console.error('Error fetching stocks for ticker:', err);
      } finally {
        setLoading(false);
      }
    };
    getStocks();
  }, []);

  if (loading || stocks.length === 0) {
    return (
      <div className="bg-navy-950 text-white py-1.5 overflow-hidden text-xs border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 flex justify-between">
          <span>Loading market data...</span>
        </div>
      </div>
    );
  }

  // Duplicate list to create a seamless infinite scrolling loop
  const tickerItems = [...stocks, ...stocks];

  return (
    <div className="bg-navy-950 text-white py-1.5 overflow-hidden text-xs border-b border-navy-950 select-none">
      <div className="animate-marquee whitespace-nowrap flex items-center">
        {tickerItems.map((stock, index) => {
          const isPositive = stock.dayChange >= 0;
          return (
            <div key={`${stock._id}-${index}`} className="inline-flex items-center mx-6">
              <span className="font-semibold text-gray-300 mr-1.5">{stock.symbol}</span>
              <span className="text-white mr-1.5">{formatCurrency(stock.currentPrice)}</span>
              <span className={`font-medium ${isPositive ? 'text-brand-400' : 'text-red-400'}`}>
                {isPositive ? '▲' : '▼'} {formatPercent(stock.dayChangePercent)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
