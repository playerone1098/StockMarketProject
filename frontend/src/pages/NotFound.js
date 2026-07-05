import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | StockVista</title>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 py-20 text-center flex flex-col justify-center items-center">
        <h1 className="text-8xl font-black text-brand-500 mb-4 tracking-tighter">404</h1>
        <h2 className="text-2xl font-black text-navy-950 mb-2">Page Not Found</h2>
        <p className="text-gray-500 text-sm max-w-md mb-8 leading-relaxed">
          The page you are trying to visit does not exist or has been relocated to another address.
        </p>
        <Link 
          to="/"
          className="px-8 py-3.5 bg-navy-950 hover:bg-navy-900 text-white rounded-xl text-sm font-bold shadow-md transition"
        >
          Return to Dashboard
        </Link>
      </div>
    </>
  );
};
