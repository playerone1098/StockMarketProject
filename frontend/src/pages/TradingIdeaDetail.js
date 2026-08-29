import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchTradingIdeaBySlug } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StockChart } from '../components/StockChart';

export const TradingIdeaDetail = () => {
  const { slug } = useParams();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const getIdeaDetails = async () => {
      setLoading(true);
      try {
        const response = await fetchTradingIdeaBySlug(slug);
        if (response.success && response.data) {
          setIdea(response.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching trading idea details:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    getIdeaDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-extrabold text-navy-950">Trading Idea Not Found</h2>
        <p className="text-gray-500 text-sm mt-2">The article you are looking for does not exist or has been removed.</p>
        <Link to="/trading-ideas" className="mt-6 inline-block px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-sm transition">
          Back to Trading Ideas
        </Link>
      </div>
    );
  }

  const isBuy = idea.ideaType?.toLowerCase() === 'buy';
  const isSell = idea.ideaType?.toLowerCase() === 'sell';
  const signalColor = isBuy ? 'text-brand-600 bg-brand-50 border-brand-200' : isSell ? 'text-red-600 bg-red-50 border-red-200' : 'text-amber-600 bg-amber-50 border-amber-200';

  // Schema.org Structured Data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Report',
    'headline': idea.title,
    'description': idea.summary,
    'image': idea.imageUrl,
    'datePublished': idea.createdAt,
    'dateModified': idea.updatedAt,
    'author': {
      '@type': 'Organization',
      'name': 'JodhpurTraders Research Desk'
    },
    'about': {
      '@type': 'FinancialProduct',
      'name': idea.stockSymbol || 'Equity'
    }
  };

  return (
    <>
      <Helmet>
        <title>{`${idea.title} | JodhpurTraders Trading Idea`}</title>
        <meta name="description" content={idea.summary} />
        <meta property="og:title" content={`${idea.title} | JodhpurTraders Trading Idea`} />
        <meta property="og:description" content={idea.summary} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.origin + window.location.pathname} />
        {idea.imageUrl && <meta property="og:image" content={idea.imageUrl} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${idea.title} | JodhpurTraders Trading Idea`} />
        <meta name="twitter:description" content={idea.summary} />
        {idea.imageUrl && <meta name="twitter:image" content={idea.imageUrl} />}
        <link rel="canonical" href={window.location.origin + window.location.pathname} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation Breadcrumb */}
        <div className="text-xs font-semibold text-gray-400 mb-6 flex items-center space-x-1">
          <Link to="/" className="hover:text-brand-600">Home</Link>
          <span>/</span>
          <Link to="/trading-ideas" className="hover:text-brand-600">Trading Ideas</Link>
          <span>/</span>
          <span className="text-navy-950 truncate max-w-[200px]">{idea.title}</span>
        </div>

        {/* Article Meta */}
        <div className="flex items-center space-x-3 mb-4">
          <span className={`text-xs px-3 py-0.5 rounded-full font-extrabold uppercase border ${signalColor}`}>
            {idea.ideaType} SIGNAL
          </span>
          <span className="text-xs font-semibold text-navy-800 bg-navy-100 px-3 py-0.5 rounded-full capitalize">
            {idea.sector}
          </span>
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold text-navy-950 mb-4 leading-tight">
          {idea.title}
        </h1>

        <div className="flex items-center space-x-2 text-xs text-gray-400 font-semibold mb-6">
          <span>By {idea.author}</span>
          <span>•</span>
          <span>Published {formatDate(idea.createdAt)}</span>
          <span>•</span>
          <span>{idea.viewCount} views</span>
        </div>

        {/* Educational Disclaimer Banner */}
        <div className="mb-8 bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 flex items-center gap-3 shadow-xs">
          <span className="text-amber-600 flex-shrink-0 text-base">⚠️</span>
          <p className="leading-normal font-medium">
            <strong className="font-bold">Disclaimer:</strong> Trading ideas are for educational purposes only and are provided with proper stop loss and technical analysis. Please invest money only based on your own research.
          </p>
        </div>

        {/* Cover Image */}
        {idea.imageUrl && (
          <div className="rounded-3xl overflow-hidden h-[300px] md:h-[400px] mb-8 bg-gray-150">
            <img src={idea.imageUrl} alt={idea.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Pricing Dashboard Panel */}
        <div className="bg-navy-950 text-white rounded-3xl p-6 md:p-8 mb-8 grid grid-cols-3 gap-4 text-center border border-navy-900">
          <div>
            <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Entry Price</span>
            <span className="text-xl md:text-3xl font-black text-white">{formatCurrency(idea.entryPrice)}</span>
          </div>
          <div>
            <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Target Price</span>
            <span className="text-xl md:text-3xl font-black text-brand-400">{formatCurrency(idea.targetPrice)}</span>
          </div>
          <div>
            <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Stop Loss</span>
            <span className="text-xl md:text-3xl font-black text-red-400">{formatCurrency(idea.stopLoss)}</span>
          </div>
        </div>

        {/* Interactive Stock Performance Chart */}
        {idea.stockSymbol && (
          <div className="mb-8">
            <h3 className="text-lg font-extrabold text-navy-950 mb-3 flex items-center gap-2">
              <span>📈</span> Live Stock Performance Chart ({idea.stockSymbol})
            </h3>
            <StockChart symbol={idea.stockSymbol} initialPrice={idea.entryPrice} />
          </div>
        )}

        {/* Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white border border-gray-100 rounded-2xl p-4 mb-8 text-center text-xs">
          <div>
            <span className="block text-gray-400 font-medium">Time Horizon</span>
            <span className="font-bold text-navy-900 capitalize mt-0.5 block">{idea.timeHorizon}</span>
          </div>
          <div>
            <span className="block text-gray-400 font-medium">Risk Profile</span>
            <span className="font-bold text-navy-900 capitalize mt-0.5 block">{idea.riskLevel} Risk</span>
          </div>
          <div>
            <span className="block text-gray-400 font-medium">Stock Symbol</span>
            <span className="font-bold text-navy-900 uppercase mt-0.5 block">{idea.stockSymbol || 'N/A'}</span>
          </div>
          <div>
            <span className="block text-gray-400 font-medium">Exchange</span>
            <span className="font-bold text-navy-900 uppercase mt-0.5 block">NSE</span>
          </div>
        </div>

        {/* Summary Block */}
        <div className="border-l-4 border-brand-500 bg-brand-50/50 p-5 rounded-r-2xl mb-8">
          <h3 className="font-bold text-navy-950 text-sm mb-1.5">Executive Summary</h3>
          <p className="text-xs text-gray-700 leading-relaxed font-medium">{idea.summary}</p>
        </div>

        {/* Main Content Body */}
        <div className="prose prose-navy max-w-none text-navy-950 text-sm leading-relaxed whitespace-pre-line mb-10">
          {idea.content}
        </div>

        {/* Article Tags */}
        {idea.tags && idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 py-4 border-t border-b border-gray-50">
            {idea.tags.map((tag) => (
              <span key={tag} className="text-[10px] font-bold text-navy-700 bg-navy-100 px-2.5 py-1 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Financial Disclaimer */}
        <div className="bg-gray-50 border border-gray-150 rounded-2xl p-5 text-xs text-gray-500 leading-relaxed">
          <h4 className="font-bold text-navy-950 mb-1.5">Important Investment Disclaimer</h4>
          <p>
            The analysis, research, and ideas presented here are for educational and informational purposes only. They are not intended as personal financial advice or recommendations to buy, sell, or hold any financial instrument. Investing in stock markets carries significant financial risk. Please consult a registered investment advisor before acting on any information. JodhpurTraders does not guarantee the accuracy, completeness, or timeliness of any market info presented.
          </p>
        </div>
      </div>
    </>
  );
};
