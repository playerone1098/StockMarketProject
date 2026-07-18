import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchSectors } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sectors, setSectors] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

  // Auth and notification state integration
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

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

            {user && (
              <Link to="/watchlists" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-semibold transition">
                Watchlists
              </Link>
            )}

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

            {/* Notification Bell Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-1.5 text-gray-300 hover:text-white focus:outline-none transition rounded-full hover:bg-navy-900"
                >
                  <span className="sr-only">View notifications</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold leading-none text-white transform translate-x-1/3 -translate-y-1/3 bg-brand-500 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsNotificationOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl shadow-xl bg-white border border-gray-150 text-gray-800 ring-1 ring-black ring-opacity-5 z-20 overflow-hidden divide-y divide-gray-100">
                      <div className="px-4 py-3 flex items-center justify-between bg-gray-50">
                        <span className="font-bold text-sm text-navy-950">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => {
                              markAllAsRead();
                              setIsNotificationOpen(false);
                            }}
                            className="text-[10px] font-bold text-brand-600 hover:text-brand-700"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-gray-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                markAsRead(n._id);
                                setIsNotificationOpen(false);
                              }}
                              className={`px-4 py-3 text-left transition hover:bg-gray-50 cursor-pointer ${
                                !n.isRead ? 'bg-brand-50/20' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <span className={`text-xs font-bold leading-tight block ${!n.isRead ? 'text-brand-750' : 'text-navy-950'}`}>
                                  {n.title}
                                </span>
                                {!n.isRead && (
                                  <span className="h-1.5 w-1.5 bg-brand-500 rounded-full flex-shrink-0 mt-1"></span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                              <span className="text-[9px] text-gray-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                      
                      <div className="px-4 py-2 text-center bg-gray-55">
                        <Link
                          to="/watchlists"
                          onClick={() => setIsNotificationOpen(false)}
                          className="text-[10px] font-bold text-navy-900 hover:text-brand-600 block w-full"
                        >
                          View Watchlists
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-3 ml-2 border-l border-navy-800 pl-4">
                <span className="text-xs text-gray-300 font-semibold truncate max-w-[100px]">
                  Hi, {user.username}
                </span>
                <button
                  onClick={logout}
                  className="px-3.5 py-1.5 bg-navy-800 hover:bg-navy-900 text-white rounded-xl text-xs font-bold transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-2 border-l border-navy-800 pl-4">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-3 py-1.5 rounded-md text-xs font-bold transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            {!user ? (
              <Link
                to="/login"
                className="px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition shadow-sm mr-1"
              >
                Sign In
              </Link>
            ) : (
              <div className="relative mr-1">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-1.5 text-gray-300 hover:text-white focus:outline-none transition rounded-full hover:bg-navy-900"
                >
                  <span className="sr-only">View notifications</span>
                  <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold leading-none text-white transform translate-x-1/3 -translate-y-1/3 bg-brand-500 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsNotificationOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-72 rounded-2xl shadow-xl bg-white border border-gray-150 text-gray-800 ring-1 ring-black ring-opacity-5 z-20 overflow-hidden divide-y divide-gray-100">
                      <div className="px-4 py-2.5 flex items-center justify-between bg-gray-50">
                        <span className="font-bold text-xs text-navy-950">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => {
                              markAllAsRead();
                              setIsNotificationOpen(false);
                            }}
                            className="text-[9px] font-bold text-brand-600 hover:text-brand-700"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-4 text-center text-[10px] text-gray-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                markAsRead(n._id);
                                setIsNotificationOpen(false);
                              }}
                              className={`px-4 py-2.5 text-left transition hover:bg-gray-50 cursor-pointer ${
                                !n.isRead ? 'bg-brand-50/20' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <span className={`text-[11px] font-bold leading-tight block ${!n.isRead ? 'text-brand-750' : 'text-navy-950'}`}>
                                  {n.title}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

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

            {user && (
              <Link
                to="/watchlists"
                onClick={() => setIsMenuOpen(false)}
                className="block text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-semibold"
              >
                Watchlists
              </Link>
            )}

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

            {/* Mobile Auth Buttons */}
            {user ? (
              <div className="pt-4 border-t border-navy-800 px-3 pb-2 space-y-2">
                <div className="text-sm font-semibold text-gray-300">Logged in as {user.username}</div>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-center px-4 py-2 bg-navy-800 hover:bg-navy-950 text-white rounded-xl text-sm font-semibold transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-navy-800 px-3 pb-2 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 text-center px-4 py-2 border border-navy-800 text-gray-300 hover:text-white rounded-xl text-sm font-semibold transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 text-center px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
