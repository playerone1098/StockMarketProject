import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchSectors } from '../services/api';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sectors, setSectors] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

  useEffect(() => {
    const getSectors = async () => {
      try {
        const response = await fetchSectors();
        if (response.success && response.data) {
          setSectors(response.data);
        }
      } catch (err) {
        console.error('Error fetching sectors in Navbar:', err);
      }
    };
    getSectors();
  }, []);

  return (
    <nav className="bg-navy-950 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-1">
              <span className="text-2xl font-black tracking-tight text-brand-500">Stock</span>
              <span className="text-2xl font-black tracking-tight text-white">Vista</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/trading-ideas" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-semibold transition">
              Trading Ideas
            </Link>
            <Link to="/ipos" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-semibold transition">
              IPO Tracker
            </Link>
            <Link to="/blog" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-semibold transition">
              Finance Blog
            </Link>
            <Link to="/stocks" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-semibold transition">
              Stocks Directory
            </Link>

            {/* Sectors Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-semibold focus:outline-none transition"
              >
                <span>Sectors</span>
                <svg
                  className={`ml-1.5 h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                  
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl bg-navy-900 border border-navy-800 ring-1 ring-black ring-opacity-5 z-20 overflow-hidden divide-y divide-navy-800">
                    <div className="py-2">
                      {sectors.map((sector) => (
                        <Link
                          key={sector._id}
                          to={`/stocks?sector=${encodeURIComponent(sector.name)}`}
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-navy-800 hover:text-white transition font-medium"
                        >
                          {sector.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link to="/about" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-semibold transition">
              About
            </Link>
            <Link to="/faq" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-semibold transition">
              FAQ
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white p-2 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-navy-900 border-t border-navy-800">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            <Link
              to="/trading-ideas"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-semibold"
            >
              Trading Ideas
            </Link>
            <Link
              to="/ipos"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-semibold"
            >
              IPO Tracker
            </Link>
            <Link
              to="/blog"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-semibold"
            >
              Finance Blog
            </Link>
            <Link
              to="/stocks"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-semibold"
            >
              Stocks Directory
            </Link>

            {/* Mobile Sectors Dropdown */}
            <div className="py-1">
              <button
                onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                className="flex items-center justify-between w-full text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-semibold focus:outline-none"
              >
                <span>Sectors</span>
                <svg
                  className={`ml-1 h-5 w-5 transition-transform duration-200 ${isMobileDropdownOpen ? 'transform rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isMobileDropdownOpen && (
                <div className="pl-4 space-y-1 mt-1 bg-navy-950 rounded-xl py-2">
                  {sectors.map((sector) => (
                    <Link
                      key={sector._id}
                      to={`/stocks?sector=${encodeURIComponent(sector.name)}`}
                      onClick={() => {
                        setIsMobileDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                      className="block text-gray-400 hover:text-white px-3 py-1.5 rounded-md text-sm font-medium"
                    >
                      {sector.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/about"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-semibold"
            >
              About
            </Link>
            <Link
              to="/faq"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-semibold"
            >
              FAQ
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
