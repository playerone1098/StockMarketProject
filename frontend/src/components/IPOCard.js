import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatters';

export const IPOCard = ({ ipo }) => {
  const getStatusColors = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30';
      case 'listed':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-navy-800 dark:text-gray-300 dark:border-navy-700';
      case 'closed':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30';
      default: // upcoming
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30';
    }
  };

  return (
    <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-sm border border-slate-200 dark:border-navy-800 p-5 flex flex-col justify-between card-hover transition-colors duration-200">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase border ${getStatusColors(ipo.status)}`}>
            {ipo.status}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-gray-400 font-semibold bg-slate-100 dark:bg-navy-800 px-2 py-0.5 rounded-md">
            {ipo.sector}
          </span>
        </div>

        <div className="flex items-center mb-3">
          {ipo.imageUrl ? (
            <img src={ipo.imageUrl} alt={ipo.companyName} className="w-10 h-10 rounded-xl mr-3 object-contain bg-slate-50 dark:bg-navy-800 p-1" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-white flex items-center justify-center font-bold text-base mr-3">
              {ipo.companyName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <Link to={`/ipos/${ipo.slug}`} className="hover:text-brand-600 dark:hover:text-brand-400 transition">
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight truncate max-w-[180px]">
                {ipo.companyName}
              </h3>
            </Link>
            <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">{ipo.symbol ? `$${ipo.symbol}` : 'IPO Issue'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 dark:border-navy-800 py-3 my-3 text-xs">
          <div>
            <span className="block text-[10px] text-slate-400 dark:text-gray-400 font-medium">Price Band</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {ipo.priceRange?.min && ipo.priceRange?.max
                ? `₹${ipo.priceRange.min} - ₹${ipo.priceRange.max}`
                : 'TBA'}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 dark:text-gray-400 font-medium">Issue Size</span>
            <span className="font-bold text-slate-900 dark:text-white">{ipo.issueSize || 'TBA'}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[11px] text-slate-500 dark:text-gray-400 mb-4">
          <div>
            <span className="block text-[9px] text-slate-400 dark:text-gray-400">Open Date</span>
            <span className="font-medium text-slate-800 dark:text-gray-200">{formatDate(ipo.openDate)}</span>
          </div>
          <div className="text-right">
            <span className="block text-[9px] text-slate-400 dark:text-gray-400">Close Date</span>
            <span className="font-medium text-slate-800 dark:text-gray-200">{formatDate(ipo.closeDate)}</span>
          </div>
        </div>

        <Link 
          to={`/ipos/${ipo.slug}`}
          className="block text-center w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-navy-800 dark:hover:bg-navy-700 text-white text-xs font-bold rounded-xl transition duration-150"
        >
          View IPO Details
        </Link>
      </div>
    </div>
  );
};
