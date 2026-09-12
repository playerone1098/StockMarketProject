import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-navy-950 py-20 px-4 text-center flex flex-col justify-center items-center">
      <Helmet>
        <title>404 - Page Not Found | JodhpurTraders</title>
        <meta name="description" content="The page you are looking for does not exist on JodhpurTraders. Navigate back to explore trading ideas, IPO tracker, and finance blogs." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <h1 className="text-8xl font-black text-brand-600 dark:text-brand-400 mb-4 tracking-tighter">404</h1>
      <h2 className="text-2xl font-black text-navy-950 dark:text-white mb-2">Page Not Found</h2>
      <p className="text-gray-500 dark:text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
        The page you are trying to visit does not exist or has been relocated to another address.
      </p>
      <Link 
        to="/"
        className="px-8 py-3.5 bg-transparent border border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400 hover:border-brand-700 dark:hover:border-brand-300 rounded-xl text-sm font-bold transition"
      >
        Return to Dashboard
      </Link>
    </div>
  );
};
