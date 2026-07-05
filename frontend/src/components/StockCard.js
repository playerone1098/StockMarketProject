import React from 'react';
import { formatCurrency, formatPercent, formatIndianNumber } from '../utils/formatters';

export const StockCard = ({ stock }) => {
  const isPositive = stock.dayChange >= 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 card-hover flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {stock.logoUrl ? (
              <img src={stock.logoUrl} alt={stock.name} className="w-8 h-8 rounded-full mr-2 object-contain bg-gray-50 p-0.5" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-navy-100 text-navy-800 flex items-center justify-center font-bold text-sm mr-2">
                {stock.symbol.slice(0, 2)}
              </div>
            )}
            <div>
              <h3 className="font-bold text-navy-950 text-base leading-tight">{stock.symbol}</h3>
              <p className="text-xs text-gray-500 truncate max-w-[150px]">{stock.name}</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-navy-50 text-navy-700 capitalize">
            {stock.sector}
          </span>
        </div>

        <div className="my-3">
          <div className="text-xl font-bold text-navy-950">{formatCurrency(stock.currentPrice)}</div>
          <div className={`text-xs font-semibold flex items-center mt-0.5 ${isPositive ? 'text-brand-600' : 'text-red-500'}`}>
            <span>{isPositive ? '▲' : '▼'} {formatCurrency(stock.dayChange)} ({formatPercent(stock.dayChangePercent)})</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-50 pt-3 mt-2 grid grid-cols-2 gap-2 text-[10px] text-gray-500">
        <div>
          <span className="block text-gray-400">Market Cap</span>
          <span className="font-semibold text-navy-900">{formatIndianNumber(stock.marketCap)}</span>
        </div>
        <div className="text-right">
          <span className="block text-gray-400">Exchange</span>
          <span className="font-semibold text-navy-900">{stock.exchange}</span>
        </div>
      </div>
    </div>
  );
};
