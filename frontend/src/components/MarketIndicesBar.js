import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatPercent } from '../utils/formatters';
import { useWebSocket } from '../context/WebSocketContext';

export const MarketIndicesBar = () => {
  const { isConnected, stockUpdates, subscribeSymbols } = useWebSocket();
  const [indices, setIndices] = useState([
    { symbol: 'NIFTY 50', name: 'Nifty 50', value: 24835.40, change: 142.80, changePercent: 0.58, isUp: true },
    { symbol: 'BANKNIFTY', name: 'Bank Nifty', value: 52240.15, change: 385.50, changePercent: 0.74, isUp: true },
    { symbol: 'SENSEX', name: 'BSE Sensex', value: 81420.80, change: 410.25, changePercent: 0.51, isUp: true },
    { symbol: 'FINNIFTY', name: 'Fin Nifty', value: 23450.60, change: 115.30, changePercent: 0.49, isUp: true },
    { symbol: 'MIDCAP100', name: 'Nifty Midcap', value: 58920.10, change: 540.80, changePercent: 0.93, isUp: true }
  ]);

  useEffect(() => {
    const getIndices = async () => {
      try {
        const res = await axios.get('/api/market/indices');
        if (res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setIndices(res.data.data);
        }
      } catch (err) {
        // Fallback initialized default benchmark indices
      }
    };
    getIndices();
    subscribeSymbols(['NIFTY 50', 'BANKNIFTY', 'SENSEX', 'FINNIFTY', 'MIDCAP100']);
  }, [subscribeSymbols]);

  // Merge WebSocket updates
  const liveIndices = indices.map((idx) => {
    const wsData = stockUpdates[idx.symbol?.toUpperCase()];
    if (!wsData) return idx;
    return {
      ...idx,
      value: wsData.currentPrice ?? idx.value,
      change: wsData.dayChange ?? idx.change,
      changePercent: wsData.dayChangePercent ?? idx.changePercent,
      isUp: (wsData.dayChangePercent ?? idx.changePercent) >= 0
    };
  });

  return (
    <div className="bg-slate-100 dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800 py-2.5 px-4 text-slate-800 dark:text-white text-xs select-none shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Label */}
        <div className="flex items-center gap-2 font-bold text-slate-600 dark:text-gray-400 uppercase text-[11px] tracking-wider shrink-0">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          <span>Indian Benchmark Indices</span>
          <span className="text-[10px] text-brand-600 dark:text-brand-400 font-mono">[{isConnected ? 'WS LIVE' : 'SYNC'}]</span>
        </div>

        {/* Indices Grid / Row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 md:gap-6 font-mono text-xs overflow-x-auto py-0.5">
          {liveIndices.map((idx) => {
            const isPos = idx.isUp !== undefined ? idx.isUp : (idx.change >= 0);
            return (
              <div 
                key={idx.symbol}
                className="flex items-center gap-2 bg-white dark:bg-navy-900/80 hover:bg-slate-50 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-800/80 px-3 py-1.5 rounded-xl transition shadow-sm shrink-0 cursor-default"
              >
                <span className="font-extrabold text-slate-700 dark:text-gray-200 text-xs tracking-tight">{idx.name || idx.symbol}</span>
                <span className="font-bold text-slate-900 dark:text-white text-xs">{idx.value ? idx.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '24,835.40'}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-0.5 ${
                  isPos 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30' 
                    : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30'
                }`}>
                  <span>{isPos ? '▲' : '▼'}</span>
                  <span>{Math.abs(idx.change || 0).toFixed(2)}</span>
                  <span>({formatPercent(idx.changePercent || 0)})</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
