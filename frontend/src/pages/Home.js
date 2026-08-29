import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  fetchFeaturedTradingIdeas, 
  fetchIPOs, 
  fetchFeaturedBlogs, 
  fetchMarketStats, 
  fetchStocks 
} from '../services/api';
import { IdeaCard } from '../components/IdeaCard';
import { IPOCard } from '../components/IPOCard';
import { BlogCard } from '../components/BlogCard';
import { MarketIndicesBar } from '../components/MarketIndicesBar';
import { formatCurrency } from '../utils/formatters';

export const Home = () => {
  const navigate = useNavigate();
  const [featuredIdeas, setFeaturedIdeas] = useState([]);
  const [activeIpos, setActiveIpos] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [realStocks, setRealStocks] = useState([]);
  const [stats, setStats] = useState({ stocks: 0, ideas: 0, ipos: 0, blogs: 0 });
  const [loading, setLoading] = useState(true);

  // Quick Stock Search State in Hero
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Active filter tab for Trading Ideas
  const [ideaFilter, setIdeaFilter] = useState('all');

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [ideasRes, iposRes, blogsRes, statsRes, stocksRes] = await Promise.all([
          fetchFeaturedTradingIdeas(),
          fetchIPOs({ limit: 6 }),
          fetchFeaturedBlogs(),
          fetchMarketStats(),
          fetchStocks({ limit: 40 })
        ]);

        if (ideasRes.success && Array.isArray(ideasRes.data)) {
          setFeaturedIdeas(ideasRes.data);
        }
        if (iposRes.success && Array.isArray(iposRes.data)) {
          setActiveIpos(iposRes.data);
        }
        if (blogsRes.success && Array.isArray(blogsRes.data)) {
          setFeaturedBlogs(blogsRes.data);
        }
        if (stocksRes.success && Array.isArray(stocksRes.data)) {
          setRealStocks(stocksRes.data);
        }
        if (statsRes.success && statsRes.data) {
          const countsData = statsRes.data.counts || statsRes.data;
          setStats({
            stocks: Number(countsData.stocks ?? countsData.totalStocks ?? 0),
            ideas: Number(countsData.ideas ?? countsData.tradingIdeas ?? countsData.totalIdeas ?? 0),
            ipos: Number(countsData.ipos ?? countsData.totalIpos ?? 0),
            blogs: Number(countsData.blogs ?? countsData.totalBlogs ?? 0)
          });
        }
      } catch (err) {
        console.error('Error fetching real home data from backend:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  // Handle Quick Search Input
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetchStocks({ search: searchQuery, limit: 5 });
        if (res.success && res.data) {
          setSearchResults(res.data);
          setShowDropdown(true);
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/stocks?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const filteredIdeas = ideaFilter === 'all' 
    ? featuredIdeas 
    : featuredIdeas.filter(idea => 
        idea.timeHorizon?.toLowerCase().includes(ideaFilter) || 
        idea.ideaType?.toLowerCase() === ideaFilter
      );

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'JodhpurTraders',
    'url': window.location.origin,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${window.location.origin}/stocks?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'JodhpurTraders',
    'url': window.location.origin,
    'logo': `${window.location.origin}/logo.png`
  };

  const helmet = (
    <Helmet>
      <title>JodhpurTraders — Real Indian Stock Market Insights, Live Charts & IPO Tracker</title>
      <meta name="description" content="Discover real research-backed Indian stock recommendations, real-time prices, live IPO subscription statuses, and portfolio management on JodhpurTraders." />
      <meta property="og:title" content="JodhpurTraders — Real Indian Stock Market Intelligence & Trading Ideas" />
      <meta property="og:description" content="Access institutional-grade trading setups, live IPO tracking, NSE/BSE stock screeners, and finance guides on JodhpurTraders." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={window.location.origin + window.location.pathname} />
      <link rel="canonical" href={window.location.origin + window.location.pathname} />
      <script type="application/ld+json">{JSON.stringify(websiteJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(organizationJsonLd)}</script>
    </Helmet>
  );

  if (loading) {
    return (
      <>
        {helmet}
        <div className="flex flex-col justify-center items-center h-96 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white transition-colors duration-200">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-brand-500 border-t-transparent mb-4"></div>
          <p className="text-slate-600 dark:text-gray-400 font-semibold text-sm">Fetching Live JodhpurTraders Data...</p>
        </div>
      </>
    );
  }

  return (
    <>
      {helmet}

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-950 to-navy-950 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 text-white py-16 md:py-24 relative overflow-hidden transition-colors duration-200">
        {/* Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 bg-slate-800/80 dark:bg-navy-800/80 backdrop-blur-md border border-brand-500/30 px-4 py-1.5 rounded-full text-xs font-bold text-brand-300 shadow-inner mb-6">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            <span>Real-Time Database Signals & Indian Stock Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 leading-[1.15]">
            Master the Stock Market with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-300 via-brand-400 to-emerald-200">
              Intelligent Edge & Signals
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed font-normal">
            Discover research-backed trading setups, track upcoming NSE/BSE IPOs, run interactive candlestick charts, and manage your portfolio seamlessly.
          </p>

          {/* Benchmark Indices Component */}
          <div className="mb-10 max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-800 dark:border-navy-800">
            <MarketIndicesBar />
          </div>

          {/* Interactive Live Stock Search Input */}
          <div className="max-w-2xl mx-auto mb-10 relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 text-lg">
                🔍
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                placeholder="Search any stock in database (e.g. TCS, RELIANCE, TATAMOTORS, HDFCBANK)..."
                className="w-full pl-12 pr-28 py-4 bg-slate-900/90 dark:bg-navy-900/90 border border-slate-700/80 dark:border-navy-700/80 focus:border-brand-500 rounded-2xl text-white placeholder-gray-400 text-sm shadow-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all backdrop-blur-xl"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Search</span>
                <span>→</span>
              </button>
            </form>

            {/* Live Search Results Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl shadow-2xl overflow-hidden z-50 text-left">
                <div className="p-2 border-b border-slate-100 dark:border-navy-800 text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400 tracking-wider">
                  Matching Stocks in Database ({searchResults.length})
                </div>
                {searchResults.map((stock) => (
                  <Link
                    key={stock._id || stock.symbol}
                    to={`/stocks/${stock.symbol}`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-slate-100 dark:hover:bg-navy-800 transition border-b border-slate-100 dark:border-navy-800/50 last:border-0"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <span>{stock.symbol}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-brand-600 dark:text-brand-400 font-mono">
                          {stock.exchange || 'NSE'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-gray-400 truncate max-w-[250px]">{stock.name || stock.companyName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">₹{stock.currentPrice?.toLocaleString('en-IN') || '0.00'}</div>
                      <div className={`text-[11px] font-bold ${(stock.dayChangePercent || stock.changePercent || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {(stock.dayChangePercent || stock.changePercent || 0) >= 0 ? '+' : ''}{(stock.dayChangePercent || stock.changePercent || 0).toFixed(2)}%
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick CTA Buttons - Single Line */}
          <div className="flex flex-nowrap justify-center items-center gap-3 sm:gap-4 overflow-x-auto whitespace-nowrap py-1 max-w-full px-2">
            <Link
              to="/trading-ideas"
              className="px-5 sm:px-6 py-3 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 shrink-0 whitespace-nowrap"
            >
              <span>🔥 Browse Trading Setups</span>
            </Link>
            <Link
              to="/ipos"
              className="px-5 sm:px-6 py-3 bg-slate-800/90 dark:bg-navy-800/90 hover:bg-slate-700 dark:hover:bg-navy-700 text-white border border-slate-700 dark:border-navy-700 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 shrink-0 whitespace-nowrap"
            >
              <span>📊 Track Live IPOs</span>
            </Link>
            <Link
              to="/portfolio"
              className="px-5 sm:px-6 py-3 bg-slate-900 dark:bg-navy-900 hover:bg-slate-800 dark:hover:bg-navy-800 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 shrink-0 whitespace-nowrap"
            >
              <span>📈 Portfolio Tracker</span>
            </Link>
          </div>

        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* Real Platform Statistics Counter */}
        <section className="bg-white dark:bg-navy-900 rounded-3xl p-8 text-slate-900 dark:text-white shadow-md relative overflow-hidden border border-slate-200 dark:border-navy-800 transition-colors duration-200">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center relative z-10">
            <div className="p-4 bg-slate-50 dark:bg-navy-950/60 rounded-2xl border border-slate-200 dark:border-navy-800">
              <div className="text-2xl mb-1">📈</div>
              <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">{stats.stocks}</div>
              <div className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mt-1">Stocks Tracked</div>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-navy-950/60 rounded-2xl border border-slate-200 dark:border-navy-800">
              <div className="text-2xl mb-1">💡</div>
              <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">{stats.ideas}</div>
              <div className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mt-1">Trading Ideas</div>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-navy-950/60 rounded-2xl border border-slate-200 dark:border-navy-800">
              <div className="text-2xl mb-1">🚀</div>
              <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">{stats.ipos}</div>
              <div className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mt-1">Active IPOs</div>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-navy-950/60 rounded-2xl border border-slate-200 dark:border-navy-800">
              <div className="text-2xl mb-1">📚</div>
              <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">{stats.blogs}</div>
              <div className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mt-1">Research Blogs</div>
            </div>
          </div>
        </section>

        {/* Featured High Conviction Trading Ideas */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 text-brand-700 dark:text-brand-400 text-xs font-bold uppercase mb-2">
                <span>🔥 High Conviction Signals ({featuredIdeas.length})</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Featured Trading Setups</h2>
              <p className="text-slate-600 dark:text-gray-400 text-sm mt-1">Institutional technical & fundamental recommendations from active database</p>
            </div>

            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-navy-900 p-1 rounded-xl text-xs font-bold border border-slate-200 dark:border-navy-800">
              <button
                onClick={() => setIdeaFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition ${ideaFilter === 'all' ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                All ({featuredIdeas.length})
              </button>
              <button
                onClick={() => setIdeaFilter('buy')}
                className={`px-3 py-1.5 rounded-lg transition ${ideaFilter === 'buy' ? 'bg-white dark:bg-navy-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Buy Calls
              </button>
              <button
                onClick={() => setIdeaFilter('short')}
                className={`px-3 py-1.5 rounded-lg transition ${ideaFilter === 'short' ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Short Term
              </button>
              <Link to="/trading-ideas" className="px-3 py-1.5 text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-extrabold ml-2">
                View All →
              </Link>
            </div>
          </div>

          {filteredIdeas.length === 0 ? (
            <div className="bg-white dark:bg-navy-900 rounded-2xl p-10 text-center text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-navy-800">
              No active trading ideas matching this filter in the database.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIdeas.slice(0, 6).map((idea) => (
                <IdeaCard key={idea._id} idea={idea} />
              ))}
            </div>
          )}
        </section>

        {/* Platform Feature Showcase */}
        <section className="bg-white dark:bg-navy-900 rounded-3xl p-8 border border-slate-200 dark:border-navy-800 shadow-sm transition-colors duration-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Built for Modern Smart Traders</h2>
            <p className="text-slate-600 dark:text-gray-400 text-sm mt-2">All the analytics, setups, and portfolio management tools you need in one place.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 dark:bg-navy-950 p-6 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xl font-bold mb-4">
                🎯
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Research Signals</h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                Clear entry, target, and stop-loss levels backed by technical indicators & SEBI expert analysis.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-navy-950 p-6 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-bold mb-4">
                📈
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Interactive Charts</h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                Recharts & TradingView candle visualizations to inspect price movements across timeframes.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-navy-950 p-6 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold mb-4">
                📂
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Statement Import</h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                Upload Zerodha, Groww, or Angel One holdings CSV files to instantly track P&L and metrics.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-navy-950 p-6 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold mb-4">
                ⭐
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Smart Watchlists</h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                Create custom lists, organize favorite Indian stocks, and keep an eye on breaking signals.
              </p>
            </div>
          </div>
        </section>

        {/* Live IPO Tracker Section */}
        <section className="bg-slate-900 dark:bg-navy-950 rounded-3xl p-8 text-white border border-slate-800 dark:border-navy-800 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase mb-2">
                <span>🚀 Primary Market Tracker ({activeIpos.length} Active)</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">Active & Upcoming IPOs</h2>
              <p className="text-gray-300 dark:text-gray-400 text-sm mt-1">Track subscription status, price bands, and listing dates from database</p>
            </div>
            <Link 
              to="/ipos" 
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition shadow-md"
            >
              Explore Full IPO Board →
            </Link>
          </div>

          {activeIpos.length === 0 ? (
            <div className="bg-slate-800 dark:bg-navy-900 rounded-2xl p-8 text-center text-gray-300 dark:text-gray-400 border border-slate-700 dark:border-navy-800">
              No open IPO subscription windows in database right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeIpos.map((ipo) => (
                <IPOCard key={ipo._id} ipo={ipo} />
              ))}
            </div>
          )}
        </section>

        {/* Financial Education & Blog Commentary */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Market Commentary & Knowledge</h2>
              <p className="text-slate-600 dark:text-gray-400 text-sm mt-1">Deep dives into stock valuation, technical analysis, and market trends ({featuredBlogs.length} articles)</p>
            </div>
            <Link to="/blog" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-bold text-sm transition">
              Read All Guides →
            </Link>
          </div>

          {featuredBlogs.length === 0 ? (
            <div className="bg-white dark:bg-navy-900 rounded-2xl p-8 text-center text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-navy-800">
              No educational blogs available in database right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredBlogs.slice(0, 3).map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          )}
        </section>

        {/* Bottom CTA Banner */}
        <section className="bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-700 rounded-3xl p-10 text-white shadow-2xl text-center relative overflow-hidden">
          <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Start Building Your Wealth Strategy Today</h2>
            <p className="text-emerald-100 text-base mb-8 max-w-xl mx-auto">
              Join thousands of investors using JodhpurTraders to track portfolios, spot high-probability trading setups, and stay ahead of the market.
            </p>
            <div className="flex flex-nowrap justify-center items-center gap-3 sm:gap-4 overflow-x-auto whitespace-nowrap py-1">
              <Link
                to="/login"
                className="px-6 sm:px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-xl transition transform hover:-translate-y-0.5 shrink-0 whitespace-nowrap"
              >
                Sign In to Get Started →
              </Link>
              <Link
                to="/stocks"
                className="px-6 sm:px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl backdrop-blur-md border border-white/20 transition shrink-0 whitespace-nowrap"
              >
                Browse Indian Stocks
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};
