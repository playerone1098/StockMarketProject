import React from 'react';
import { Link } from 'react-router-dom';

export const MarketHeatmap = ({ sectors, isLoading, error, onSelectSector }) => {
  if (isLoading) {
    return (
      <div className="bg-navy-900 border border-navy-800 rounded-xl p-8 text-center animate-pulse">
        <div className="h-8 bg-navy-800 rounded w-1/4 mx-auto mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-40 bg-navy-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-navy-900 border border-rose-900/50 rounded-xl p-6 text-center text-rose-400">
        Failed to load market heatmap data.
      </div>
    );
  }

  if (!sectors || sectors.length === 0) {
    return (
      <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 text-center text-slate-400">
        No sector heatmap data available.
      </div>
    );
  }

  const getHeatmapColor = (changePercent) => {
    if (changePercent >= 3.0) return 'bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-400/50';
    if (changePercent >= 1.5) return 'bg-emerald-700/80 hover:bg-emerald-600 text-white border-emerald-500/40';
    if (changePercent > 0) return 'bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-100 border-emerald-700/40';
    if (changePercent === 0) return 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700';
    if (changePercent > -1.5) return 'bg-rose-900/60 hover:bg-rose-800/80 text-rose-100 border-rose-700/40';
    if (changePercent > -3.0) return 'bg-rose-700/80 hover:bg-rose-600 text-white border-rose-500/40';
    return 'bg-rose-600/90 hover:bg-rose-500 text-white border-rose-400/50';
  };

  const formatMarketCap = (marketCap) => {
    if (!marketCap) return '₹0 Cr';
    if (marketCap >= 100000) return `₹${(marketCap / 100000).toFixed(2)} L Cr`;
    return `₹${Number(marketCap).toLocaleString('en-IN')} Cr`;
  };

  return (
    <div className="space-y-6">
      {/* Legend & Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-navy-900/80 backdrop-blur border border-navy-800 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-sm font-medium text-slate-200">Sector Performance Heatmap</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-600"></span>
            <span className="text-slate-300">&gt; +3%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-900/70"></span>
            <span className="text-slate-300">0% to +3%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-800"></span>
            <span className="text-slate-400">0%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-900/70"></span>
            <span className="text-slate-300">0% to -3%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-600"></span>
            <span className="text-slate-300">&lt; -3%</span>
          </div>
        </div>
      </div>

      {/* Grid of Sector Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sectors.map((sector) => {
          const isSectorPositive = sector.avgChangePercent >= 0;
          return (
            <div
              key={sector.name}
              className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
            >
              {/* Sector Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-navy-800">
                <div>
                  <h3 className="font-semibold text-slate-100 text-base flex items-center gap-2">
                    {sector.name}
                    <span className="text-xs font-normal text-slate-400">({sector.stocksCount} stocks)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Total Cap: {formatMarketCap(sector.totalMarketCap)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border ${
                    isSectorPositive
                      ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/50'
                      : 'bg-rose-950/70 text-rose-400 border-rose-800/50'
                  }`}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSectorPositive ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"} />
                    </svg>
                    {isSectorPositive ? '+' : ''}{sector.avgChangePercent}%
                  </div>
                  {onSelectSector && (
                    <button
                      onClick={() => onSelectSector(sector.name)}
                      className="text-[10px] px-2 py-0.5 border border-cyan-500/50 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300 font-semibold rounded bg-transparent transition"
                    >
                      Screen Sector
                    </button>
                  )}
                </div>
              </div>

              {/* Stocks Heatmap Cells */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {sector.stocks.map((stock) => (
                  <Link
                    key={stock.id || stock.symbol}
                    to={`/stocks/${stock.symbol}`}
                    className={`p-2.5 rounded-xl border transition-all duration-200 flex flex-col justify-between group ${getHeatmapColor(
                      stock.changePercent
                    )}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs tracking-wider uppercase group-hover:underline">
                        {stock.symbol}
                      </span>
                      <span className="text-[10px] font-semibold opacity-90">
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                      </span>
                    </div>

                    <div className="mt-2 text-right">
                      <div className="text-[11px] font-semibold">
                        ₹{Number(stock.price).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[9px] opacity-75 font-normal">
                        {formatMarketCap(stock.marketCap)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
