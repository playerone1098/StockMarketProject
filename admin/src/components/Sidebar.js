import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/trading-ideas', icon: '💡', label: 'Trading Ideas' },
    { path: '/ipos', icon: '🏢', label: 'IPOs Board' },
    { path: '/blogs', icon: '📝', label: 'Blog Posts' },
    { path: '/stocks', icon: '📈', label: 'Stocks screener' },
    { path: '/sectors', icon: '🏷️', label: 'Sectors' },
    { path: '/analytics', icon: '📉', label: 'Analytics' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`bg-zinc-950 text-white w-64 min-h-screen border-r border-zinc-900/60 fixed md:static inset-y-0 left-0 z-50 transform ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } md:translate-x-0 transition-transform duration-300 ease-in-out`}>
      <div className="p-6">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              StockVista
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mt-1">
              Admin Management
            </p>
          </div>
          {/* Close button for Mobile/Tablet */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-label="Close sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                }`}
              >
                <span className={`text-base transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
