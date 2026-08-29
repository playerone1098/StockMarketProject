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
            <Link to="/screener" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 px-3 py-2 rounded-md text-sm font-semibold transition flex items-center gap-1">
              ⚡ Screener
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
            <Link to="/community" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-2 rounded-md text-sm font-semibold transition flex items-center gap-1">
              💬 Community
            </Link>

            {/* Portfolio & Watchlist links for logged in user */}
            {isAuthenticated && (
              <>
                <Link to="/portfolio" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 px-3 py-2 rounded-md text-sm font-semibold transition flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 30.5V3m0 0L6 8.5M11 3l5 5.5M2 13h18M2 18h18" />
                  </svg>
                  Portfolio
                </Link>
                <Link to="/watchlist" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 px-3 py-2 rounded-md text-sm font-semibold transition flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
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
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 text-xs font-bold text-slate-700 dark:text-gray-300 bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-800 transition-all active:scale-95 flex items-center gap-1.5"
              title="Toggle Light / Dark Mode"
            >
              {theme === 'dark' ? '[LIGHT ☀️]' : '[DARK 🌙]'}
            </button>

            {/* Auth Buttons / User Menu */}
            {isAuthenticated ? (
              <div className="relative ml-2">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white px-3 py-1.5 rounded-full text-sm font-semibold transition focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.username}</span>
                  <svg className="w-4 h-4 text-slate-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 z-20 overflow-hidden py-2 text-sm">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-navy-800">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{user?.username}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{user?.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-md">
                            Admin
                          </span>
                        )}
                      </div>

                      <Link
                        to="/portfolio"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-navy-800 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        📊 Portfolio Tracker
                      </Link>
                      <Link
                        to="/watchlist"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-navy-800 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        ⭐ My Watchlist
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-navy-800 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        ⚙️ Account Settings
                      </Link>

                      {isAdmin && (
                        <a
                          href="http://localhost:3003"
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-purple-600 dark:text-purple-400 hover:bg-slate-100 dark:hover:bg-navy-800 transition font-medium border-t border-slate-100 dark:border-navy-800"
                        >
                          🛡️ Admin Console
                        </a>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-slate-100 dark:hover:bg-navy-800 transition font-medium border-t border-slate-100 dark:border-navy-800 mt-1"
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-2">
                <Link
                  to="/login"
                  className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition shadow-md hover:shadow-brand-500/20"
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
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-navy-800 text-[11px] font-bold text-slate-700 dark:text-gray-300 bg-slate-100 dark:bg-navy-900"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white p-2 focus:outline-none"
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
                  📊 Portfolio Tracker
                </Link>
                <Link
                  to="/watchlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 px-3 py-2 rounded-md text-base font-semibold"
                >
                  ⭐ My Watchlist
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-base font-semibold"
                >
                  ⚙️ Settings
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
              ⚡ Screener & Heatmap
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
              💬 Community
            </Link>

            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full text-left text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 px-3 py-2 rounded-md text-base font-semibold pt-3 border-t border-slate-200 dark:border-navy-800"
              >
                🚪 Sign Out
              </button>
            ) : (
              <div className="pt-2 flex flex-col space-y-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center bg-brand-600 hover:bg-brand-500 text-white py-2 rounded-lg text-sm font-semibold shadow-md"
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
