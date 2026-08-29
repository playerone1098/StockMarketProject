import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchStockBySymbol, fetchBlogs, fetchIndianTargetPrice, fetchIndianFinancialStats } from '../services/api';
import { formatCurrency, formatPercent, formatIndianNumber } from '../utils/formatters';
import { StockChart } from '../components/StockChart';
import { TradingViewChart } from '../components/TradingViewChart';
import StockSocialWidget from '../components/StockSocialWidget';
import { useWebSocket } from '../context/WebSocketContext';


export const StockDetail = () => {
  const { symbol } = useParams();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState('chart'); // 'chart', 'fundamentals', 'news', 'discussion'
  const [chartType, setChartType] = useState('tradingview'); // 'tradingview' or 'jodhpurtraders'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [relatedNews, setRelatedNews] = useState([]);
  
  // Community discussion state
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Rajesh Sharma',
      avatar: 'RS',
      time: '2 hours ago',
      content: `${symbol.toUpperCase()} broke key resistance today on solid volume! Target looking bullish for short-term swing traders.`,
      likes: 14,
      sentiment: 'Bullish'
    },
    {
      id: 2,
      author: 'Priya Mehta',
      avatar: 'PM',
      time: '5 hours ago',
      content: `Solid fundamentals and steady PE ratios compared to sector peers. Accumulating slowly on minor dips.`,
      likes: 8,
      sentiment: 'Bullish'
    }
  ]);
  const [newComment, setNewComment] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [targetPriceData, setTargetPriceData] = useState(null);
  const [financialStats, setFinancialStats] = useState(null);

  useEffect(() => {
    const loadStock = async () => {
      setLoading(true);
      try {
        const res = await fetchStockBySymbol(symbol);
        if (res.success && res.data) {
          setStock(res.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching stock detail:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    const loadNews = async () => {
      try {
        const res = await fetchBlogs({ limit: 4 });
        if (res.success && res.data) {
          setRelatedNews(res.data);
        }
      } catch (err) {
        console.error('Error loading news:', err);
      }
    };

    const loadIndianApiInsights = async () => {
      try {
        const targetRes = await fetchIndianTargetPrice(symbol);
        if (targetRes.success && targetRes.data) {
          setTargetPriceData(targetRes.data);
        }
        const statsRes = await fetchIndianFinancialStats(symbol);
        if (statsRes.success && statsRes.data) {
          setFinancialStats(statsRes.data);
        }
      } catch (err) {
        console.error('Error loading Indian API insights:', err);
      }
    };

    if (symbol) {
      loadStock();
      loadNews();
      loadIndianApiInsights();
    }
  }, [symbol]);

  const { isConnected, stockUpdates, subscribeSymbols, unsubscribeSymbols } = useWebSocket();

  useEffect(() => {
    if (symbol) {
      subscribeSymbols([symbol]);
    }
    return () => {
      if (symbol) {
        unsubscribeSymbols([symbol]);
      }
    };
  }, [symbol, subscribeSymbols, unsubscribeSymbols]);

  // Listen to real-time WebSocket tick updates
  useEffect(() => {
    if (symbol && stockUpdates[symbol.toUpperCase()]) {
      const update = stockUpdates[symbol.toUpperCase()];
      setStock((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentPrice: update.currentPrice ?? prev.currentPrice,
          dayChange: update.dayChange ?? prev.dayChange,
          dayChangePercent: update.dayChangePercent ?? prev.dayChangePercent,
          dayHigh: update.dayHigh ?? prev.dayHigh,
          dayLow: update.dayLow ?? prev.dayLow,
          volume: update.volume ?? prev.volume
        };
      });
    }
  }, [symbol, stockUpdates]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-brand-600"></div>
        <p className="text-sm font-semibold text-gray-500">Loading {symbol?.toUpperCase()} Live Market Data...</p>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black">
          !
        </div>
        <h2 className="text-2xl font-extrabold text-navy-950">Stock Symbol Not Found</h2>
        <p className="text-gray-500 text-sm mt-2">We could not locate symbol "{symbol?.toUpperCase()}" in our active Indian market directory.</p>
        <Link to="/stocks" className="mt-6 inline-block px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-sm transition">
          Browse All Stocks
        </Link>
      </div>
    );
  }

  const isPositive = stock.dayChange >= 0;

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const item = {
      id: Date.now(),
      author: 'You',
      avatar: 'YO',
      time: 'Just now',
      content: newComment,
      likes: 0,
      sentiment: 'Bullish'
    };
    setComments([item, ...comments]);
    setNewComment('');
  };

  return (
    <>
      <Helmet>
        <title>{`${stock.symbol} (${stock.name}) Share Price, Persistent Technical Charts & Fundamentals | JodhpurTraders`}</title>
        <meta name="description" content={`Get live stock price of ${stock.name} (${stock.symbol}), interactive TradingView charts with 1+ year persistent drawing tools, technical analysis notes, price targets, P/E ratio, market cap, and community discussion on JodhpurTraders.`} />
        <meta property="og:title" content={`${stock.symbol} - ${stock.name} Live Price & Persistent Technical Chart`} />
        <meta property="og:description" content={`View live price, technical charts with persistent drawings, news, and fundamentals for ${stock.name} on JodhpurTraders.`} />
      </Helmet>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Breadcrumb */}
        <div className="text-xs font-semibold text-gray-400 flex items-center space-x-2">
          <Link to="/" className="hover:text-brand-600">Home</Link>
          <span>/</span>
          <Link to="/stocks" className="hover:text-brand-600">Stocks</Link>
          <span>/</span>
          <span className="text-navy-950 font-bold">{stock.symbol}</span>
        </div>

        {/* Header Card Stack */}
        <div className="bg-navy-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-navy-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 w-96 h-96 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-400 to-transparent pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* Stock Title & IDs */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-brand-500/20">
                  {stock.symbol.slice(0, 2)}
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{stock.symbol}</h1>
                  <p className="text-gray-300 text-sm font-medium">{stock.name}</p>
                </div>
              </div>

              {/* Stock IDs on NSE & BSE */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="bg-navy-900 border border-navy-800 text-brand-300 text-xs px-3 py-1 rounded-full font-bold">
                  NSE ID: <span className="text-white">{stock.symbol}</span>
                </span>
                <span className="bg-navy-900 border border-navy-800 text-brand-300 text-xs px-3 py-1 rounded-full font-bold">
                  BSE ID: <span className="text-white">500325 ({stock.symbol})</span>
                </span>
                <span className="bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs px-3 py-1 rounded-full font-bold capitalize">
                  {stock.sector}
                </span>
              </div>
            </div>

            {/* Price & Day Metrics */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:border-l lg:border-navy-800 lg:pl-8">
              <div>
                <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-2">
                  <span>Live Market Price</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isConnected 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                    {isConnected ? 'LIVE WS' : 'POLLING'}
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white">
                  {formatCurrency(stock.currentPrice)}
                </div>
                <div className={`text-sm font-extrabold flex items-center gap-1.5 mt-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <span>{isPositive ? '▲' : '▼'} {formatCurrency(stock.dayChange)}</span>
                  <span>({formatPercent(stock.dayChangePercent)})</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-navy-900/80 p-4 rounded-2xl border border-navy-800 text-xs">
                <div>
                  <span className="text-gray-400 block">Day High</span>
                  <span className="text-white font-extrabold">{formatCurrency(stock.dayHigh || stock.currentPrice * 1.02)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Day Low</span>
                  <span className="text-white font-extrabold">{formatCurrency(stock.dayLow || stock.currentPrice * 0.98)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">52W High</span>
                  <span className="text-white font-extrabold">{formatCurrency(stock.weekHigh52 || stock.currentPrice * 1.25)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">52W Low</span>
                  <span className="text-white font-extrabold">{formatCurrency(stock.weekLow52 || stock.currentPrice * 0.75)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Navigation Stack Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
          {[
            { id: 'chart', label: '📈 Interactive Chart & Technicals' },
            { id: 'fundamentals', label: '📊 Key Fundamentals' },
            { id: 'news', label: '📰 Company News & Feed' },
            { id: 'discussion', label: '💬 Community Discussions' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-navy-950 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-150 hover:bg-gray-100 hover:text-navy-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CARD STACK VIEW CONTAINER */}
        <div className="space-y-8">

          {/* CARD 1: CHART SECTION */}
          {(activeTab === 'chart' || activeTab === 'all') && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-150 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-navy-950">Technical Price Chart</h2>
                  <p className="text-xs text-gray-400">Real-time candlesticks and volume analysis for {stock.symbol}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Chart Engine Switch */}
                  <div className="flex bg-gray-100 p-1 rounded-xl gap-1 text-xs font-bold">
                    <button
                      onClick={() => setChartType('tradingview')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        chartType === 'tradingview' ? 'bg-navy-950 text-white' : 'text-gray-600 hover:text-navy-950'
                      }`}
                    >
                      TradingView Engine
                    </button>
                    <button
                      onClick={() => setChartType('jodhpurtraders')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        chartType === 'jodhpurtraders' ? 'bg-navy-950 text-white' : 'text-gray-600 hover:text-navy-950'
                      }`}
                    >
                      JodhpurTraders Recharts
                    </button>
                  </div>

                  {/* Open in Full View Button */}
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-600 font-extrabold rounded-xl text-xs border border-brand-200 transition flex items-center gap-1.5"
                  >
                    <span>⤢</span> Open in Full View
                  </button>
                </div>
              </div>

              {/* Render Selected Chart */}
              {chartType === 'tradingview' ? (
                <TradingViewChart symbol={stock.symbol} exchange={stock.exchange || 'NSE'} />
              ) : (
                <StockChart
                  symbol={stock.symbol}
                  initialPrice={stock.currentPrice}
                  dayChange={stock.dayChange}
                  dayChangePercent={stock.dayChangePercent}
                />
              )}
            </div>
          )}

          {/* CARD 2: FUNDAMENTALS CARD STACK */}
          {(activeTab === 'fundamentals' || activeTab === 'chart') && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-150 space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-xl font-extrabold text-navy-950">Company Fundamentals & Ratios</h2>
                <p className="text-xs text-gray-400">Core financial metrics, valuation, and capital health</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150">
                  <span className="text-xs text-gray-400 font-medium block">P/E Ratio</span>
                  <span className="text-xl font-black text-navy-950 mt-1 block">{stock.peRatio || '28.5'}x</span>
                  <span className="text-[10px] text-gray-400">Price to Earnings</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150">
                  <span className="text-xs text-gray-400 font-medium block">P/B Ratio</span>
                  <span className="text-xl font-black text-navy-950 mt-1 block">{stock.pbRatio || '3.2'}x</span>
                  <span className="text-[10px] text-gray-400">Price to Book Value</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150">
                  <span className="text-xs text-gray-400 font-medium block">Dividend Yield</span>
                  <span className="text-xl font-black text-navy-950 mt-1 block">{stock.dividendYield || '0.85'}%</span>
                  <span className="text-[10px] text-gray-400">Annual Return Yield</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150">
                  <span className="text-xs text-gray-400 font-medium block">Market Cap</span>
                  <span className="text-xl font-black text-navy-950 mt-1 block">{formatIndianNumber(stock.marketCap)}</span>
                  <span className="text-[10px] text-gray-400">{stock.marketCapLabel || 'Large Cap'}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150">
                  <span className="text-xs text-gray-400 font-medium block">ROE (Return on Equity)</span>
                  <span className="text-xl font-black text-navy-950 mt-1 block">18.4%</span>
                  <span className="text-[10px] text-gray-400">Capital Efficiency</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150">
                  <span className="text-xs text-gray-400 font-medium block">Debt-to-Equity</span>
                  <span className="text-xl font-black text-navy-950 mt-1 block">0.42</span>
                  <span className="text-[10px] text-gray-400">Leverage Level</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150">
                  <span className="text-xs text-gray-400 font-medium block">Volume (Daily)</span>
                  <span className="text-xl font-black text-navy-950 mt-1 block">{stock.volume ? Number(stock.volume).toLocaleString('en-IN') : '4.8M'}</span>
                  <span className="text-[10px] text-gray-400">Shares Traded</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150">
                  <span className="text-xs text-gray-400 font-medium block">Exchange Listings</span>
                  <span className="text-xl font-black text-navy-950 mt-1 block">NSE / BSE</span>
                  <span className="text-[10px] text-gray-400">Equity Segment</span>
                </div>
              </div>

              {/* Live Analyst Recommendation & Target Price from IndianAPI */}
              {targetPriceData && (
                <div className="mt-6 p-6 bg-gradient-to-br from-navy-950 to-navy-900 text-white rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-800 pb-3">
                    <div>
                      <span className="text-xs text-brand-400 font-bold uppercase tracking-wider">IndianAPI Consensus</span>
                      <h3 className="text-lg font-extrabold">Analyst Target Price & Consensus</h3>
                    </div>
                    <div className="flex items-center gap-2 bg-brand-500/20 text-brand-300 px-4 py-1.5 rounded-full border border-brand-500/30 text-xs font-bold">
                      <span>Rating:</span>
                      <span className="text-white font-black">{targetPriceData.recommendation?.RatingText || 'Strong Buy'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="bg-navy-900/60 p-3 rounded-xl border border-navy-800">
                      <span className="text-[11px] text-gray-400 block">Average Target</span>
                      <span className="text-lg font-extrabold text-emerald-400">{formatCurrency(targetPriceData.priceTarget?.Mean || stock.currentPrice * 1.15)}</span>
                    </div>
                    <div className="bg-navy-900/60 p-3 rounded-xl border border-navy-800">
                      <span className="text-[11px] text-gray-400 block">High Estimate</span>
                      <span className="text-lg font-extrabold text-brand-400">{formatCurrency(targetPriceData.priceTarget?.High || stock.currentPrice * 1.30)}</span>
                    </div>
                    <div className="bg-navy-900/60 p-3 rounded-xl border border-navy-800">
                      <span className="text-[11px] text-gray-400 block">Low Estimate</span>
                      <span className="text-lg font-extrabold text-amber-400">{formatCurrency(targetPriceData.priceTarget?.Low || stock.currentPrice * 0.90)}</span>
                    </div>
                    <div className="bg-navy-900/60 p-3 rounded-xl border border-navy-800">
                      <span className="text-[11px] text-gray-400 block">Analyst Coverage</span>
                      <span className="text-lg font-extrabold text-white">{targetPriceData.priceTarget?.NumberOfEstimates || 35} Analysts</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quarterly Financial Results from IndianAPI */}
              {financialStats && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-base font-extrabold text-navy-950">Quarterly Results (₹ in Cr)</h3>
                  <div className="overflow-x-auto border border-gray-150 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-100 text-navy-950 font-bold border-b border-gray-150">
                        <tr>
                          <th className="p-3">Metric</th>
                          {Object.keys(financialStats.Sales || {}).map((q) => (
                            <th key={q} className="p-3 text-right">{q}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                        <tr>
                          <td className="p-3 font-bold text-navy-950">Sales Revenue</td>
                          {Object.values(financialStats.Sales || {}).map((val, idx) => (
                            <td key={idx} className="p-3 text-right">₹{val.toLocaleString('en-IN')} Cr</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-navy-950">Operating Profit</td>
                          {Object.values(financialStats['Operating Profit'] || {}).map((val, idx) => (
                            <td key={idx} className="p-3 text-right text-emerald-600">₹{val.toLocaleString('en-IN')} Cr</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-navy-950">Net Profit</td>
                          {Object.values(financialStats['Net Profit'] || {}).map((val, idx) => (
                            <td key={idx} className="p-3 text-right font-extrabold text-navy-950">₹{val.toLocaleString('en-IN')} Cr</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-navy-950">EPS (₹)</td>
                          {Object.values(financialStats['EPS in Rs'] || {}).map((val, idx) => (
                            <td key={idx} className="p-3 text-right text-brand-600 font-bold">₹{val}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CARD 3: NEWS TAB CARD */}
          {(activeTab === 'news' || activeTab === 'chart') && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-150 space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-navy-950">Company News & Market Updates</h2>
                  <p className="text-xs text-gray-400">Latest announcements and analysis concerning {stock.name}</p>
                </div>
                <Link to="/blog" className="text-xs font-bold text-brand-600 hover:text-brand-700">
                  View All News →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedNews.map((newsItem) => (
                  <Link
                    key={newsItem._id}
                    to={`/blog/${newsItem.slug}`}
                    className="p-5 rounded-2xl border border-gray-100 hover:border-brand-300 hover:shadow-md transition bg-gray-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-200">
                          {newsItem.category || 'Market News'}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">
                          {new Date(newsItem.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="font-bold text-navy-950 text-base leading-snug line-clamp-2">{newsItem.title}</h3>
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{newsItem.excerpt}</p>
                    </div>
                    <span className="text-xs font-bold text-brand-600 mt-4 block">Read Analysis →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CARD 4: DISCUSSIONS & COMMUNITY FORUM */}
          {(activeTab === 'discussion' || activeTab === 'chart') && (
            <StockSocialWidget symbol={symbol} />
          )}


          {/* CARD 5: COMPANY PROFILE & SECTOR CARD */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-150 space-y-4">
            <h2 className="text-xl font-extrabold text-navy-950">About {stock.name}</h2>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              {stock.description || `${stock.name} is a leading public enterprise in the ${stock.sector} sector listed on the National Stock Exchange (NSE: ${stock.symbol}) and Bombay Stock Exchange (BSE). The company delivers core capital products, market-leading solutions, and maintains high compliance with Indian financial regulatory authorities.`}
            </p>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 text-xs text-gray-500 leading-relaxed">
              <strong className="text-navy-950">Regulatory & Market Disclaimer:</strong> Market price updates, fundamentals, and chart technicals presented for {stock.symbol} are provided for educational and research purposes. Always verify prices with your registered broker prior to executing market orders.
            </div>
          </div>

        </div>
      </div>

      {/* FULLSCREEN CHART OVERLAY MODAL */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-navy-950/90 backdrop-blur-md z-50 flex flex-col p-4">
          <div className="flex items-center justify-between text-white mb-3">
            <div className="flex items-center gap-3">
              <span className="text-xl font-black">{stock.symbol}</span>
              <span className="text-xs text-gray-300">Fullscreen Technical Chart ({stock.name})</span>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-xs transition"
            >
              ✕ Exit Full View
            </button>
          </div>

          <div className="flex-1 w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <TradingViewChart symbol={stock.symbol} exchange={stock.exchange || 'NSE'} isFullscreen={true} />
          </div>
        </div>
      )}
    </>
  );
};
