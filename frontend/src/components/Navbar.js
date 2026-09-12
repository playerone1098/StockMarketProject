import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchSectors } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sectors, setSectors] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white/90 dark:bg-navy-950/90 text-slate-800 dark:text-white sticky top-0 z-50 shadow-sm border-b border-slate-200 dark:border-navy-900 backdrop-blur-md transition-colors duration-200">
      <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4 pl-0">
            <Link to="/" className="flex items-center space-x-1 pr-2">
              <span className="text-2xl font-black tracking-tight text-brand-600 dark:text-brand-500">Jodhpur</span>
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Traders</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1.5 lg:space-x-3 whitespace-nowrap flex-nowrap">
            <Link to="/stocks" className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-semibold transition">
              Stocks Directory
            </Link>
            <Link to="/screener" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 px-3 py-2 rounded-md text-sm font-semibold transition">
              Screener
            </Link>
            <Link to="/trading-ideas" className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-semibold transition">
              Trading Ideas
            </Link>
            <Link to="/ipos" className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-semibold transition">
              IPOs
            </Link>
            <Link to="/blog" className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-semibold transition">
              Blog
            </Link>
            <Link to="/community" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-2 rounded-md text-sm font-semibold transition">
              Community
            </Link>

            {/* Portfolio & Watchlist links for logged in user */}
            {isAuthenticated && (
              <>
                <Link to="/portfolio" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 px-3 py-2 rounded-md text-sm font-semibold transition">
                  Portfolio
                </Link>
                <Link to="/watchlist" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 px-3 py-2 rounded-md text-sm font-semibold transition">
                  Watchlist
                </Link>
              </>
            )}

            {/* Sectors Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-semibold focus:outline-none transition"
              >
                <span>Sectors</span>
              </button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 ring-1 ring-black ring-opacity-5 z-20 overflow-hidden divide-y divide-slate-100 dark:divide-navy-800">
                    <div className="py-2 max-h-64 overflow-y-auto">
                      {sectors.map((sector) => (
                        <Link
                          key={sector._id}
                          to={`/stocks?sector=${encodeURIComponent(sector.name)}`}
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-navy-800 hover:text-slate-900 dark:hover:text-white transition font-medium"
                        >
                          {sector.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-navy-700 text-xs font-bold text-slate-700 dark:text-gray-300 hover:border-slate-500 dark:hover:border-navy-500 transition-all active:scale-95 bg-transparent"
              title="Toggle Light / Dark Mode"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>

            {/* Auth Buttons / User Menu */}
            {isAuthenticated ? (
              <div className="relative ml-2">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-full text-sm font-semibold transition bg-transparent hover:border-slate-500 dark:hover:border-navy-500 focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-full border border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs bg-transparent">
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.username}</span>
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 z-20 overflow-hidden py-2 text-sm">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-navy-800">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{user?.username}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{user?.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-brand-500/40 text-brand-600 dark:text-brand-400 rounded-md">
                            Admin
                          </span>
                        )}
                      </div>

                      <Link
                        to="/portfolio"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-navy-800 hover:text-slate-900 dark:hover:text-white transition font-medium"
                      >
                        Portfolio Tracker
                      </Link>
                      <Link
                        to="/watchlist"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-navy-800 hover:text-slate-900 dark:hover:text-white transition font-medium"
                      >
                        My Watchlist
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-navy-800 hover:text-slate-900 dark:hover:text-white transition font-medium"
                      >
                        Account Settings
                      </Link>

                      {isAdmin && (
                        <a
                          href="http://localhost:3003"
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-purple-600 dark:text-purple-400 hover:bg-slate-100 dark:hover:bg-navy-800 transition font-medium border-t border-slate-100 dark:border-navy-800"
                        >
                          Admin Console
                        </a>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition font-medium border-t border-slate-100 dark:border-navy-800 mt-1 bg-transparent"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-2">
                <Link
                  to="/login"
                  className="border border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400 hover:border-brand-700 dark:hover:border-brand-300 px-4 py-1.5 rounded-lg text-sm font-semibold transition bg-transparent"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button & Theme toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-navy-700 text-[11px] font-bold text-slate-700 dark:text-gray-300 bg-transparent hover:border-slate-500"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="px-3 py-1 rounded-lg border border-slate-300 dark:border-navy-700 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition bg-transparent focus:outline-none"
            >
              {isMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-navy-800">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {isAuthenticated && (
              <div className="px-3 py-2 border-b border-slate-200 dark:border-navy-800 mb-2">
                <p className="font-semibold text-slate-900 dark:text-white">{user?.username}</p>
                <p className="text-xs text-slate-500 dark:text-gray-400">{user?.email}</p>
              </div>
            )}

            {isAuthenticated ? (
              <>
                <Link
                  to="/portfolio"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 px-3 py-2 rounded-md text-base font-semibold"
                >
                  Portfolio Tracker
                </Link>
                <Link
                  to="/watchlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 px-3 py-2 rounded-md text-base font-semibold"
                >
                  My Watchlist
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-base font-semibold"
                >
                  Settings
                </Link>
              </>
            ) : null}

            <Link
              to="/stocks"
              onClick={() => setIsMenuOpen(false)}
              className="block text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-base font-semibold"
            >
              Stocks Directory
            </Link>
            <Link
              to="/screener"
              onClick={() => setIsMenuOpen(false)}
              className="block text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 px-3 py-2 rounded-md text-base font-semibold"
            >
              Screener & Heatmap
            </Link>
            <Link
              to="/trading-ideas"
              onClick={() => setIsMenuOpen(false)}
              className="block text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-base font-semibold"
            >
              Trading Ideas
            </Link>
            <Link
              to="/ipos"
              onClick={() => setIsMenuOpen(false)}
              className="block text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-base font-semibold"
            >
              IPOs
            </Link>
            <Link
              to="/blog"
              onClick={() => setIsMenuOpen(false)}
              className="block text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-base font-semibold"
            >
              Blog
            </Link>
            <Link
              to="/community"
              onClick={() => setIsMenuOpen(false)}
              className="block text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-2 rounded-md text-base font-semibold"
            >
              Community
            </Link>

            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full text-left text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 px-3 py-2 rounded-md text-base font-semibold pt-3 border-t border-slate-200 dark:border-navy-800 bg-transparent"
              >
                Sign Out
              </button>
            ) : (
              <div className="pt-2 flex flex-col space-y-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center border border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400 hover:border-brand-700 dark:hover:border-brand-300 py-2 rounded-lg text-sm font-semibold bg-transparent transition"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
