import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/formatters';

export const IdeaCard = ({ idea }) => {
  const getBadgeColors = (type) => {
    switch (type?.toLowerCase()) {
      case 'buy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30';
      case 'sell':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30';
      case 'hold':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-navy-800 dark:text-gray-300 dark:border-navy-700';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10';
      case 'high': return 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10';
      default: return 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10';
    }
  };

  return (
    <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-sm border border-slate-200 dark:border-navy-800 p-5 flex flex-col justify-between card-hover transition-colors duration-200">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase border ${getBadgeColors(idea.ideaType)}`}>
            {idea.ideaType}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-gray-400 font-medium">
            {formatDate(idea.createdAt)}
          </span>
        </div>

        <Link to={`/trading-ideas/${idea.slug}`} className="block group">
          <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition duration-150">
            {idea.title}
          </h3>
        </Link>
        
        <p className="text-xs text-slate-600 dark:text-gray-300 line-clamp-2 mb-4 leading-relaxed">
          {idea.summary}
        </p>

        <div className="grid grid-cols-3 gap-2 bg-slate-100/70 dark:bg-navy-950/60 rounded-xl p-3 mb-4 text-center border border-slate-200/50 dark:border-navy-800/50">
          <div>
            <span className="block text-[9px] text-slate-500 dark:text-gray-400 font-medium uppercase">Entry</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">{formatCurrency(idea.entryPrice)}</span>
          </div>
          <div>
            <span className="block text-[9px] text-slate-500 dark:text-gray-400 font-medium uppercase">Target</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(idea.targetPrice)}</span>
          </div>
          <div>
            <span className="block text-[9px] text-slate-500 dark:text-gray-400 font-medium uppercase">Stop Loss</span>
            <span className="text-xs font-bold text-red-600 dark:text-red-400">{formatCurrency(idea.stopLoss)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-navy-800 text-[10px]">
        <div className="flex space-x-2">
          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-gray-200 capitalize font-medium">
            {idea.timeHorizon}
          </span>
          <span className={`px-2 py-0.5 rounded-md capitalize font-bold ${getRiskColor(idea.riskLevel)}`}>
            {idea.riskLevel} Risk
          </span>
        </div>
        <Link 
          to={`/trading-ideas/${idea.slug}`}
          className="text-brand-600 dark:text-brand-400 font-bold hover:text-brand-700 dark:hover:text-brand-300 flex items-center transition"
        >
          View Analysis
        </Link>
      </div>
    </div>
  );
};
