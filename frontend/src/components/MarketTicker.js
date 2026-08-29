import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchStocks } from '../services/api';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { useWebSocket } from '../context/WebSocketContext';

export const MarketTicker = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isConnected, stockUpdates, subscribeAll } = useWebSocket();

  useEffect(() => {
    const getStocks = async () => {
      try {
        const response = await fetchStocks({ limit: 25 });
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
    subscribeAll();
  }, [subscribeAll]);

  if (loading || stocks.length === 0) {
    return (
      <div className="bg-navy-950 text-white py-1.5 overflow-hidden text-xs border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 flex justify-between">
          <span className="text-gray-400 font-mono text-[11px]">Loading real-time NSE/BSE stocks...</span>
        </div>
      </div>
    );
  }

  // Merge live WebSocket updates into stock items
  const liveStocks = stocks.map((stock) => {
    const wsData = stockUpdates[stock.symbol?.toUpperCase()];
    if (!wsData) return stock;
    return {
      ...stock,
      currentPrice: wsData.currentPrice ?? stock.currentPrice,
      dayChange: wsData.dayChange ?? stock.dayChange,
      dayChangePercent: wsData.dayChangePercent ?? stock.dayChangePercent
    };
  });

  // Duplicate list to create a seamless infinite scrolling loop
  const tickerItems = [...liveStocks, ...liveStocks];

  return (
    <div className="bg-navy-950 text-white py-2 overflow-hidden text-xs border-b border-navy-800 select-none shadow-xl relative z-30 flex items-center">
      {/* Live Badge */}
      <div className="bg-navy-950 z-40 pl-4 pr-2 flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold shrink-0 border-r border-navy-800/80 py-1">
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
        <span className={isConnected ? 'text-emerald-400' : 'text-amber-400'}>
          {isConnected ? 'LIVE TICK' : 'CONNECTING'}
        </span>
      </div>

      <div className="animate-marquee whitespace-nowrap flex items-center space-x-2">
        {tickerItems.map((stock, index) => {
          const isPositive = (stock.dayChangePercent || stock.dayChange || 0) >= 0;
          return (
            <Link 
              key={`${stock._id || stock.symbol}-${index}`} 
              to={`/stocks/${stock.symbol}`}
              className="inline-flex items-center mx-4 font-mono hover:bg-navy-800/80 px-2.5 py-1 rounded-lg transition-all group"
            >
              <span className="font-extrabold text-gray-200 group-hover:text-brand-400 mr-2">{stock.symbol}</span>
              <span className="text-white font-semibold mr-2">{formatCurrency(stock.currentPrice)}</span>
              <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${isPositive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                {isPositive ? '▲' : '▼'} {formatPercent(stock.dayChangePercent || 0)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

