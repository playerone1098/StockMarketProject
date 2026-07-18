import React, { useState, useEffect } from 'react';
import { fetchStocks, fetchMarketIndices } from '../services/api';
import { formatCurrency, formatPercent } from '../utils/formatters';

export const MarketTicker = () => {
  const [stocks, setStocks] = useState([]);
  const [indices, setIndices] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const [stocksRes, indicesRes] = await Promise.all([
          fetchStocks({ limit: 10 }),
          fetchMarketIndices()
        ]);
        if (stocksRes.success && stocksRes.data) {
          setStocks(stocksRes.data);
        }
        if (indicesRes.success && indicesRes.data) {
          setIndices(indicesRes.data);
        }
      } catch (err) {
        console.error('Error fetching market data:', err);
      } finally {
        setLoading(false);
      }
    };
    getData();

    // Poll indices every 30 seconds for live updates
    const interval = setInterval(async () => {
      try {
        const indicesRes = await fetchMarketIndices();
        if (indicesRes.success && indicesRes.data) {
          setIndices(indicesRes.data);
        }
      } catch (e) {
        console.error('Error polling indices:', e);
      }
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-navy-950 text-white py-1.5 overflow-hidden text-xs border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 flex justify-between">
          <span>Loading market data...</span>
        </div>
      </div>
    );
  }

  const tickerItems = [...stocks, ...stocks];

  return (
    <div className="bg-navy-950 text-white select-none border-b border-navy-900">
      {/* Major Indices Status Bar */}
      {indices && (
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap justify-center sm:justify-start items-center gap-4 sm:gap-6 text-[10px] sm:text-xs font-bold border-b border-navy-900/60 bg-navy-950">
          <div className="flex items-center text-gray-400 mr-2 uppercase tracking-widest text-[9px]">
            <span className="relative flex h-2 w-2 mr-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            Indices Live
          </div>
          {Object.values(indices).map((ind, i) => {
            const isPositive = ind.change >= 0;
            return (
              <div key={i} className="flex items-center space-x-1.5">
                <span className="text-gray-300 font-extrabold uppercase">{ind.name}</span>
                <span className="text-white">{ind.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className={`flex items-center font-semibold text-[10px] ${isPositive ? 'text-brand-400' : 'text-red-400'}`}>
                  <span className="mr-0.5">{isPositive ? '▲' : '▼'}</span>
                  <span>{Math.abs(ind.change).toFixed(2)} ({formatPercent(ind.changePercent)})</span>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Stock Ticker Marquee */}
      {stocks.length > 0 && (
        <div className="py-1.5 overflow-hidden text-xs bg-navy-950/80">
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
      )}
    </div>
  );
};
