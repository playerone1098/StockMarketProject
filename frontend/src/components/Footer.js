import React from 'react';
import { Link } from 'react-router-dom';
import { VERSION } from '../version';

export const Footer = () => {
  return (
    <footer className="bg-navy-950 text-white py-12 mt-20 border-t border-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              <span className="text-brand-500">Stock</span>Vista
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Your gateway to smarter investing. Get premium trading ideas, track upcoming IPOs, read expert finance blogs, and research top Indian stocks.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold text-gray-200 mb-4">Sectors</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/stocks?sector=Banking & Finance" className="text-gray-400 hover:text-white">Banking & Finance</Link></li>
              <li><Link to="/stocks?sector=IT & Software" className="text-gray-400 hover:text-white">IT & Software</Link></li>
              <li><Link to="/stocks?sector=Pharma & Healthcare" className="text-gray-400 hover:text-white">Pharma & Healthcare</Link></li>
              <li><Link to="/stocks?sector=FMCG" className="text-gray-400 hover:text-white">FMCG</Link></li>
              <li><Link to="/stocks?sector=Auto" className="text-gray-400 hover:text-white">Automotive</Link></li>
              <li><Link to="/stocks?sector=Energy & Oil" className="text-gray-400 hover:text-white">Energy & Power</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-200 mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/trading-ideas" className="text-gray-400 hover:text-white">Trading Ideas</Link></li>
              <li><Link to="/ipos" className="text-gray-400 hover:text-white">IPO Tracker</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white">Finance Blog</Link></li>
              <li><Link to="/stocks" className="text-gray-400 hover:text-white">Stocks Screener</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white">Frequently Asked Questions</Link></li>
            </ul>
          </div>
        </div>

        {/* Mandatory Financial Disclaimer */}
        <div className="mt-8 pt-6 border-t border-navy-900 text-xs text-gray-400 leading-relaxed">
          <p>
            <strong>Disclaimer:</strong> The information provided on StockVista is for educational and informational purposes only. It should not be considered as financial advice. Please consult a certified financial advisor before making investment decisions. Stock market investments are subject to market risks. Past performance is not indicative of future results.
          </p>
        </div>
        
        {/* Footer Bottom copyright and version */}
        <div className="mt-6 pt-6 border-t border-navy-900 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} StockVista. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">v{VERSION}</p>
        </div>
      </div>
    </footer>
  );
};
