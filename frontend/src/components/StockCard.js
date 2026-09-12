import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatPercent, formatIndianNumber } from '../utils/formatters';

export const StockCard = ({ stock, onClick }) => {
  const isPositive = stock.dayChange >= 0;

  const content = (
    <div
      className="bg-white dark:bg-navy-900 rounded-2xl shadow-sm border border-slate-200 dark:border-navy-800 p-5 card-hover flex flex-col justify-between cursor-pointer group hover:border-brand-500 dark:hover:border-brand-400 transition-all h-full"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {stock.logoUrl ? (
              <img src={stock.logoUrl} alt={stock.name} className="w-8 h-8 rounded-full mr-2 object-contain bg-slate-50 dark:bg-navy-800 p-0.5" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-white flex items-center justify-center font-bold text-sm mr-2 group-hover:bg-brand-600 dark:group-hover:bg-brand-500 group-hover:text-white transition">
                {stock.symbol.slice(0, 2)}
              </div>
            )}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">{stock.symbol}</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 truncate max-w-[150px]">{stock.name}</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-gray-300 capitalize">
            {stock.sector}
          </span>
        </div>

        <div className="my-3">
          <div className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(stock.currentPrice)}</div>
          <div className={`text-xs font-semibold flex items-center mt-0.5 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            <span>{isPositive ? '▲' : '▼'} {formatCurrency(stock.dayChange)} ({formatPercent(stock.dayChangePercent)})</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-navy-800 pt-3 mt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-gray-400">
        <div>
          <span className="block text-slate-400 dark:text-gray-400">Market Cap</span>
          <span className="font-semibold text-slate-800 dark:text-gray-200">{formatIndianNumber(stock.marketCap)}</span>
        </div>
        <div className="text-right">
          <span className="block text-slate-400 dark:text-gray-400">Charts & Details</span>
          <span className="font-bold text-brand-600 dark:text-brand-400 group-hover:underline">View Chart</span>
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return <div onClick={() => onClick(stock)}>{content}</div>;
  }

  return <Link to={`/stocks/${stock.symbol}`}>{content}</Link>;
};
