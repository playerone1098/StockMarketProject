import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatters';

export const IPOCard = ({ ipo }) => {
  const getStatusColors = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-brand-50 text-brand-700 border-brand-200';
      case 'listed':
        return 'bg-navy-50 text-navy-700 border-navy-200';
      case 'closed':
        return 'bg-red-50 text-red-700 border-red-200';
      default: // upcoming
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between card-hover">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase border ${getStatusColors(ipo.status)}`}>
            {ipo.status}
          </span>
          <span className="text-[10px] text-gray-400 font-semibold bg-gray-50 px-2 py-0.5 rounded-md">
            {ipo.sector}
          </span>
        </div>

        <div className="flex items-center mb-3">
          {ipo.imageUrl ? (
            <img src={ipo.imageUrl} alt={ipo.companyName} className="w-10 h-10 rounded-xl mr-3 object-contain bg-gray-50 p-1" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-navy-100 text-navy-800 flex items-center justify-center font-bold text-base mr-3">
              {ipo.companyName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <Link to={`/ipos/${ipo.slug}`} className="hover:text-brand-600 transition">
              <h3 className="font-bold text-navy-950 text-base leading-tight truncate max-w-[180px]">
                {ipo.companyName}
              </h3>
            </Link>
            <p className="text-[11px] text-gray-500 mt-0.5">{ipo.symbol ? `$${ipo.symbol}` : 'IPO Issue'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-50 py-3 my-3 text-xs">
          <div>
            <span className="block text-[10px] text-gray-400 font-medium">Price Band</span>
            <span className="font-bold text-navy-900">
              {ipo.priceRange?.min && ipo.priceRange?.max
                ? `₹${ipo.priceRange.min} - ₹${ipo.priceRange.max}`
                : 'TBA'}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-gray-400 font-medium">Issue Size</span>
            <span className="font-bold text-navy-900">{ipo.issueSize || 'TBA'}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[11px] text-gray-500 mb-4">
          <div>
            <span className="block text-[9px] text-gray-400">Open Date</span>
            <span className="font-medium text-navy-800">{formatDate(ipo.openDate)}</span>
          </div>
          <div className="text-right">
            <span className="block text-[9px] text-gray-400">Close Date</span>
            <span className="font-medium text-navy-800">{formatDate(ipo.closeDate)}</span>
          </div>
        </div>

        <Link 
          to={`/ipos/${ipo.slug}`}
          className="block text-center w-full py-2.5 bg-navy-900 hover:bg-navy-950 text-white text-xs font-bold rounded-xl transition duration-150"
        >
          View IPO Details
        </Link>
      </div>
    </div>
  );
};
