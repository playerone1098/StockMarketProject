import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const MarketMovers = ({ movers, isLoading }) => {
  const [activeTab, setActiveTab] = useState('gainers');

  if (isLoading) {
    return (
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-navy-800 rounded w-48 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} className="h-12 bg-navy-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!movers) return null;

  const tabs = [
    { id: 'gainers', label: 'Top Gainers', color: 'text-emerald-400', count: movers.topGainers?.length || 0 },
    { id: 'losers', label: 'Top Losers', color: 'text-rose-400', count: movers.topLosers?.length || 0 },
    { id: 'active', label: 'Most Active', color: 'text-cyan-400', count: movers.mostActive?.length || 0 },
    { id: 'highs', label: '52W Highs', color: 'text-amber-400', count: movers.nearHighs?.length || 0 },
    { id: 'lows', label: '52W Lows', color: 'text-purple-400', count: movers.nearLows?.length || 0 }
  ];

  const getActiveList = () => {
    switch (activeTab) {
      case 'gainers': return movers.topGainers || [];
      case 'losers': return movers.topLosers || [];
      case 'active': return movers.mostActive || [];
      case 'highs': return movers.nearHighs || [];
      case 'lows': return movers.nearLows || [];
      default: return movers.topGainers || [];
    }
  };

  const list = getActiveList();

  return (
    <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
      {/* Header Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-800 pb-4 mb-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Market Pulse & Movers
        </h2>

        <div className="flex flex-wrap items-center gap-1.5 bg-transparent p-1 rounded-xl border border-navy-800">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-transparent ${
                  isActive
                    ? 'border-2 border-white text-white font-bold'
                    : 'border border-transparent text-slate-400 hover:text-slate-200 hover:border-navy-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-navy-800/80">
              <th className="pb-3 pl-2">Company</th>
              <th className="pb-3 text-right">Price</th>
              <th className="pb-3 text-right">Change</th>
              <th className="pb-3 text-right hidden sm:table-cell">52W High</th>
              <th className="pb-3 text-right hidden sm:table-cell">Market Cap</th>
              <th className="pb-3 pr-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800/50 text-sm">
            {list.map((stock) => {
              const isPositive = stock.dayChangePercent >= 0;
              return (
                <tr key={stock._id || stock.symbol} className="hover:bg-navy-800/40 transition-colors group">
                  <td className="py-3 pl-2">
                    <Link to={`/stocks/${stock.symbol}`} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-navy-800 border border-navy-700 flex items-center justify-center font-bold text-xs text-cyan-400 group-hover:border-cyan-500 transition-colors">
                        {stock.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                          {stock.symbol}
                        </div>
                        <div className="text-xs text-slate-400 truncate max-w-[140px] sm:max-w-[200px]">
                          {stock.name}
                        </div>
                      </div>
                    </Link>
                  </td>

                  <td className="py-3 text-right font-semibold text-slate-100">
                    ₹{Number(stock.currentPrice).toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 text-right font-semibold">
                    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold ${
                      isPositive
                        ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/50'
                        : 'bg-rose-950/70 text-rose-400 border border-rose-800/50'
                    }`}>
                      {isPositive ? '+' : ''}{stock.dayChangePercent?.toFixed(2)}%
                    </span>
                  </td>

                  <td className="py-3 text-right text-xs text-slate-400 hidden sm:table-cell">
                    ₹{Number(stock.weekHigh52 || 0).toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 text-right text-xs text-slate-400 hidden sm:table-cell">
                    ₹{Number(stock.marketCap || 0).toLocaleString('en-IN')} Cr
                  </td>

                  <td className="py-3 pr-2 text-right">
                    <Link
                      to={`/stocks/${stock.symbol}`}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
