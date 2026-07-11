import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Sidebar = () => {
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
    <div className="bg-zinc-950 text-white w-64 min-h-screen border-r border-zinc-900/60">
      <div className="p-6">
        <div className="mb-10">
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            StockVista
          </h1>
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mt-1">
            Admin Management
          </p>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
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
