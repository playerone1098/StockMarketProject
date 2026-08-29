import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { VERSION } from '../version';

export const Footer = () => {
  const location = useLocation();
  if (location.pathname === '/watchlist') {
    return null;
  }

  return (
    <footer className="bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-white py-12 mt-20 border-t border-slate-200 dark:border-navy-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              <span className="text-brand-600 dark:text-brand-500">Jodhpur</span>Traders
            </h3>
            <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
              Your gateway to smarter investing. Get premium trading ideas, track upcoming IPOs, read expert finance blogs, and research top Indian stocks.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold text-slate-800 dark:text-gray-200 mb-4">Sectors</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/stocks?sector=Banking & Finance" className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">Banking & Finance</Link></li>
              <li><Link to="/stocks?sector=IT & Software" className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">IT & Software</Link></li>
              <li><Link to="/stocks?sector=Pharma & Healthcare" className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">Pharma & Healthcare</Link></li>
              <li><Link to="/stocks?sector=FMCG" className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">FMCG</Link></li>
              <li><Link to="/stocks?sector=Auto" className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">Automotive</Link></li>
              <li><Link to="/stocks?sector=Energy & Oil" className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">Energy & Power</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-semibold text-slate-800 dark:text-gray-200 mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/trading-ideas" className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">Trading Ideas</Link></li>
              <li><Link to="/ipos" className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">IPO Tracker</Link></li>
              <li><Link to="/blog" className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">Finance Blog</Link></li>
              <li><Link to="/stocks" className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">Stocks Directory</Link></li>
              <li><Link to="/about" className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">About Us</Link></li>
              <li><Link to="/faq" className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">Frequently Asked Questions</Link></li>
            </ul>
          </div>
        </div>

        {/* Mandatory Financial Disclaimer */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-navy-900 text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
          <p>
            <strong>Disclaimer:</strong> The information provided on JodhpurTraders is for educational and informational purposes only. It should not be considered as financial advice. Please consult a certified financial advisor before making investment decisions. Stock market investments are subject to market risks. Past performance is not indicative of future results.
          </p>
        </div>
        
        {/* Footer Bottom copyright and version */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-navy-900 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 dark:text-gray-500">
          <p>&copy; {new Date().getFullYear()} JodhpurTraders. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">v{VERSION}</p>
        </div>
      </div>
    </footer>
  );
};
