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
    <div className="bg-navy-950 text-white w-64 min-h-screen border-r border-navy-900">
      <div className="p-6">
        <div className="mb-10">
          <h1 className="text-2xl font-black tracking-tight text-brand-500">StockVista</h1>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">Admin Management</p>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                isActive(item.path)
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10'
                  : 'text-gray-300 hover:bg-navy-900 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};
