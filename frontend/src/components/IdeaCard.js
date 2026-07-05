import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/formatters';

export const IdeaCard = ({ idea }) => {
  const getBadgeColors = (type) => {
    switch (type?.toLowerCase()) {
      case 'buy':
        return 'bg-brand-50 text-brand-700 border-brand-200';
      case 'sell':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'hold':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-navy-50 text-navy-700 border-navy-200';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-brand-600 bg-brand-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-amber-600 bg-amber-50';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between card-hover">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase border ${getBadgeColors(idea.ideaType)}`}>
            {idea.ideaType}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">
            {formatDate(idea.createdAt)}
          </span>
        </div>

        <Link to={`/trading-ideas/${idea.slug}`} className="block group">
          <h3 className="font-bold text-navy-950 text-base leading-snug mb-2 group-hover:text-brand-600 transition duration-150">
            {idea.title}
          </h3>
        </Link>
        
        <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
          {idea.summary}
        </p>

        <div className="grid grid-cols-3 gap-2 bg-navy-50 rounded-xl p-3 mb-4 text-center">
          <div>
            <span className="block text-[9px] text-gray-400 font-medium uppercase">Entry</span>
            <span className="text-xs font-bold text-navy-900">{formatCurrency(idea.entryPrice)}</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-400 font-medium uppercase">Target</span>
            <span className="text-xs font-bold text-brand-700">{formatCurrency(idea.targetPrice)}</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-400 font-medium uppercase">Stop Loss</span>
            <span className="text-xs font-bold text-red-600">{formatCurrency(idea.stopLoss)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-[10px]">
        <div className="flex space-x-2">
          <span className="px-2 py-0.5 rounded-md bg-navy-100 text-navy-800 capitalize font-medium">
            {idea.timeHorizon}
          </span>
          <span className={`px-2 py-0.5 rounded-md capitalize font-bold ${getRiskColor(idea.riskLevel)}`}>
            {idea.riskLevel} Risk
          </span>
        </div>
        <Link 
          to={`/trading-ideas/${idea.slug}`}
          className="text-brand-600 font-bold hover:text-brand-700 flex items-center group-hover:translate-x-1 transition-transform"
        >
          View Analysis →
        </Link>
      </div>
    </div>
  );
};
