import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchFeaturedTradingIdeas, fetchIPOs, fetchFeaturedBlogs, fetchMarketStats } from '../services/api';
import { IdeaCard } from '../components/IdeaCard';
import { IPOCard } from '../components/IPOCard';
import { BlogCard } from '../components/BlogCard';

export const Home = () => {
  const [featuredIdeas, setFeaturedIdeas] = useState([]);
  const [activeIpos, setActiveIpos] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [stats, setStats] = useState({ stocks: 0, ideas: 0, ipos: 0, blogs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [ideasRes, iposRes, blogsRes, statsRes] = await Promise.all([
          fetchFeaturedTradingIdeas(),
          fetchIPOs({ limit: 3, status: 'open' }),
          fetchFeaturedBlogs(),
          fetchMarketStats()
        ]);

        if (ideasRes.success) setFeaturedIdeas(ideasRes.data);
        if (iposRes.success) setActiveIpos(iposRes.data);
        if (blogsRes.success) setFeaturedBlogs(blogsRes.data);
        if (statsRes.success) setStats(statsRes.data);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const helmet = (
    <Helmet>
      <title>StockVista — Stock Market Insights, Trading Ideas & IPO Tracker</title>
      <meta name="description" content="Discover premium trading recommendations, stock picks, research-backed blogs, and up-to-date IPO news. Elevate your financial knowledge with StockVista." />
      <meta property="og:title" content="StockVista — Stock Market Insights & Trading Ideas" />
      <meta property="og:description" content="Get professional research-backed trading recommendations, upcoming IPO tracking data, and finance blogs on StockVista." />
      <meta property="og:type" content="website" />
      <link rel="canonical" href={window.location.origin + window.location.pathname} />
    </Helmet>
  );

  if (loading) {
    return (
      <>
        {helmet}
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      {helmet}
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-navy-950 to-navy-900 text-white py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-300 via-navy-900 to-navy-950"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <span className="bg-brand-500/10 text-brand-400 border border-brand-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 inline-block">
            📈 Smarter Financial Insights
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Your Gateway to <br/>
            <span className="text-brand-400">Intelligent Investing</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-medium">
            Explore daily technical & fundamental trading ideas, track upcoming IPOs, and master the markets with expert finance guides.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/trading-ideas"
              className="px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/20 transition-all w-full sm:w-auto"
            >
              Browse Trading Ideas
            </Link>
            <Link
              to="/ipos"
              className="px-8 py-3.5 bg-navy-800 hover:bg-navy-700 text-white border border-navy-700 rounded-xl text-sm font-bold transition w-full sm:w-auto"
            >
              Track Live IPOs
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {/* Stats Row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-extrabold text-navy-950">{stats.stocks || 15}</div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1">Stocks Tracked</div>
          </div>
          <div className="text-center border-l border-gray-100">
            <div className="text-3xl md:text-4xl font-extrabold text-brand-600">{stats.ideas || 6}</div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1">Trading Ideas</div>
          </div>
          <div className="text-center border-l border-gray-100">
            <div className="text-3xl md:text-4xl font-extrabold text-navy-950">{stats.ipos || 4}</div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1">Live IPOs</div>
          </div>
          <div className="text-center border-l border-gray-100">
            <div className="text-3xl md:text-4xl font-extrabold text-brand-600">{stats.blogs || 5}</div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1">Guides & Blogs</div>
          </div>
        </section>

        {/* Featured Trading Ideas */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-navy-950">Featured Trading Ideas</h2>
              <p className="text-gray-500 text-sm mt-1">Latest recommendations from our professional analysis desk</p>
            </div>
            <Link to="/trading-ideas" className="text-brand-600 hover:text-brand-700 font-bold text-sm transition">
              View All Ideas →
            </Link>
          </div>
          {featuredIdeas.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-500">No active trading ideas available at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredIdeas.map((idea) => (
                <IdeaCard key={idea._id} idea={idea} />
              ))}
            </div>
          )}
        </section>

        {/* Live IPOs Section */}
        <section className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-navy-950">Active & Open IPOs</h2>
              <p className="text-gray-500 text-sm mt-1">Stay updated with current subscription windows</p>
            </div>
            <Link to="/ipos" className="text-brand-600 hover:text-brand-700 font-bold text-sm transition">
              View IPO Board →
            </Link>
          </div>
          {activeIpos.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-500 border border-gray-150">
              No IPO subscription windows are open today. Check upcoming listings.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeIpos.map((ipo) => (
                <IPOCard key={ipo._id} ipo={ipo} />
              ))}
            </div>
          )}
        </section>

        {/* Blog & Educational Section */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-navy-950">Financial Education & Commentary</h2>
              <p className="text-gray-500 text-sm mt-1">Sharpen your investing vocabulary and read market summaries</p>
            </div>
            <Link to="/blog" className="text-brand-600 hover:text-brand-700 font-bold text-sm transition">
              Read All Articles →
            </Link>
          </div>
          {featuredBlogs.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-500">No blog updates yet. Check back later!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};
