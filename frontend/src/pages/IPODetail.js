import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchIPOBySlug } from '../services/api';
import { formatDate, formatCurrency } from '../utils/formatters';

export const IPODetail = () => {
  const { slug } = useParams();
  const [ipo, setIpo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const getIpoDetails = async () => {
      setLoading(true);
      try {
        const response = await fetchIPOBySlug(slug);
        if (response.success && response.data) {
          setIpo(response.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching IPO details:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    getIpoDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !ipo) {
    return (
      <div className="min-h-screen bg-white dark:bg-navy-950 py-16 px-4 text-center">
        <h2 className="text-2xl font-extrabold text-navy-950 dark:text-white">IPO Entry Not Found</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-2">The IPO data you requested is unavailable or has been removed.</p>
        <Link to="/ipos" className="mt-6 inline-block px-6 py-2.5 bg-transparent border border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400 hover:border-brand-700 dark:hover:border-brand-300 font-bold rounded-xl text-sm transition">
          Back to IPO Board
        </Link>
      </div>
    );
  }

  const getStatusColors = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-transparent text-brand-600 dark:text-brand-400 border-brand-500';
      case 'listed': return 'bg-transparent text-navy-800 dark:text-slate-300 border-gray-300 dark:border-navy-600';
      case 'closed': return 'bg-transparent text-rose-600 dark:text-rose-400 border-rose-500';
      default: return 'bg-transparent text-blue-600 dark:text-blue-400 border-blue-500';
    }
  };

  const ipoJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': `${ipo.companyName} IPO Bidding Window`,
    'description': ipo.description || `Initial Public Offering of ${ipo.companyName}. Sector: ${ipo.sector}`,
    'startDate': ipo.openDate,
    'endDate': ipo.closeDate,
    'eventAttendanceMode': 'https://schema.org/OnlineEventAttendanceMode',
    'eventStatus': 'https://schema.org/EventScheduled',
    'location': {
      '@type': 'VirtualLocation',
      'url': window.location.origin + window.location.pathname
    },
    'organizer': {
      '@type': 'Organization',
      'name': ipo.companyName,
      'logo': ipo.imageUrl || `${window.location.origin}/logo.png`
    },
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'INR',
      'price': ipo.priceRange?.max || 0,
      'url': window.location.origin + window.location.pathname,
      'category': 'FinancialProduct'
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-navy-950 py-8">
      <Helmet>
        <title>{`${ipo.companyName} IPO Date, Price Band & Status | JodhpurTraders`}</title>
        <meta name="description" content={`Get latest details of ${ipo.companyName} IPO: Price band, issue size, bidding window timeline, registrar information, and subscription stats.`} />
        <meta property="og:title" content={`${ipo.companyName} IPO Date, Price Band & Status | JodhpurTraders`} />
        <meta property="og:description" content={`Get latest details of ${ipo.companyName} IPO: Price band, issue size, bidding window timeline, registrar information, and subscription stats.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.origin + window.location.pathname} />
        {ipo.imageUrl && <meta property="og:image" content={ipo.imageUrl} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${ipo.companyName} IPO Date, Price Band & Status | JodhpurTraders`} />
        <meta name="twitter:description" content={`Get latest details of ${ipo.companyName} IPO: Price band, issue size, bidding window timeline, registrar information, and subscription stats.`} />
        {ipo.imageUrl && <meta name="twitter:image" content={ipo.imageUrl} />}
        <link rel="canonical" href={window.location.origin + window.location.pathname} />
        <script type="application/ld+json">
          {JSON.stringify(ipoJsonLd)}
        </script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4">
        {/* Navigation Breadcrumb */}
        <div className="text-xs font-semibold text-gray-400 dark:text-slate-500 mb-6 flex items-center space-x-1">
          <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400">Home</Link>
          <span>/</span>
          <Link to="/ipos" className="hover:text-brand-600 dark:hover:text-brand-400">IPO Tracker</Link>
          <span>/</span>
          <span className="text-navy-950 dark:text-white truncate max-w-[200px]">{ipo.companyName}</span>
        </div>

        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-navy-800">
          <div className="flex items-center">
            {ipo.imageUrl ? (
              <img src={ipo.imageUrl} alt={ipo.companyName} className="w-16 h-16 rounded-2xl mr-4 object-contain bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 p-1.5" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-navy-900 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-2xl mr-4 border border-brand-500">
                {ipo.companyName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-navy-950 dark:text-white leading-tight">
                {ipo.companyName} IPO
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{ipo.symbol ? `Proposed Ticker: ${ipo.symbol}` : 'Equity Share Listing'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`text-xs px-3 py-1 rounded-full font-extrabold uppercase border ${getStatusColors(ipo.status)}`}>
              STATUS: {ipo.status}
            </span>
            <span className="text-xs font-bold border border-gray-300 dark:border-navy-700 text-navy-800 dark:text-slate-300 px-3 py-1 rounded-full capitalize">
              {ipo.sector} Sector
            </span>
          </div>
        </div>

        {/* Timelines Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 shadow-sm rounded-2xl p-4 flex items-center">
            <span className="w-10 h-10 rounded-xl border border-gray-200 dark:border-navy-700 flex items-center justify-center font-bold text-xs text-brand-600 dark:text-brand-400 mr-3 shrink-0">
              OP
            </span>
            <div>
              <span className="block text-[10px] text-gray-400 dark:text-slate-500 font-semibold uppercase">Open Date</span>
              <span className="text-sm font-bold text-navy-950 dark:text-white">{formatDate(ipo.openDate)}</span>
            </div>
          </div>
          <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 shadow-sm rounded-2xl p-4 flex items-center">
            <span className="w-10 h-10 rounded-xl border border-gray-200 dark:border-navy-700 flex items-center justify-center font-bold text-xs text-brand-600 dark:text-brand-400 mr-3 shrink-0">
              CL
            </span>
            <div>
              <span className="block text-[10px] text-gray-400 dark:text-slate-500 font-semibold uppercase">Close Date</span>
              <span className="text-sm font-bold text-navy-950 dark:text-white">{formatDate(ipo.closeDate)}</span>
            </div>
          </div>
          <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 shadow-sm rounded-2xl p-4 flex items-center">
            <span className="w-10 h-10 rounded-xl border border-gray-200 dark:border-navy-700 flex items-center justify-center font-bold text-xs text-brand-600 dark:text-brand-400 mr-3 shrink-0">
              LS
            </span>
            <div>
              <span className="block text-[10px] text-gray-400 dark:text-slate-500 font-semibold uppercase">Listing Date</span>
              <span className="text-sm font-bold text-navy-950 dark:text-white">{formatDate(ipo.listingDate)}</span>
            </div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <h2 className="text-lg font-extrabold text-navy-950 dark:text-white mb-4">IPO Details & Issue Structure</h2>
        <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm mb-8 overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
              <tr>
                <td className="py-3.5 text-gray-500 dark:text-slate-400 font-medium">Price Band</td>
                <td className="py-3.5 text-right font-bold text-navy-950 dark:text-white">
                  {ipo.priceRange?.min && ipo.priceRange?.max
                    ? `₹${ipo.priceRange.min} - ₹${ipo.priceRange.max} per share`
                    : 'To Be Announced'}
                </td>
              </tr>
              <tr>
                <td className="py-3.5 text-gray-500 dark:text-slate-400 font-medium">Lot Size</td>
                <td className="py-3.5 text-right font-bold text-navy-950 dark:text-white">{ipo.lotSize ? `${ipo.lotSize} Shares` : 'TBA'}</td>
              </tr>
              <tr>
                <td className="py-3.5 text-gray-500 dark:text-slate-400 font-medium">Issue Size</td>
                <td className="py-3.5 text-right font-bold text-navy-950 dark:text-white">{ipo.issueSize || 'TBA'}</td>
              </tr>
              <tr>
                <td className="py-3.5 text-gray-500 dark:text-slate-400 font-medium">Issue Type</td>
                <td className="py-3.5 text-right font-bold text-navy-950 dark:text-white capitalize">{ipo.issueType || 'Fresh Issue & OFS'}</td>
              </tr>
              {ipo.listingPrice > 0 && (
                <tr className="bg-brand-50/50 dark:bg-brand-950/20">
                  <td className="py-3.5 px-2 text-brand-800 dark:text-brand-300 font-semibold">Actual Listing Price</td>
                  <td className="py-3.5 px-2 text-right font-black text-brand-700 dark:text-brand-400">{formatCurrency(ipo.listingPrice)}</td>
                </tr>
              )}
              {ipo.registrar && (
                <tr>
                  <td className="py-3.5 text-gray-500 dark:text-slate-400 font-medium">IPO Registrar</td>
                  <td className="py-3.5 text-right font-semibold text-navy-950 dark:text-white">{ipo.registrar}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Subscription Status Block */}
        {ipo.subscriptionStatus && Object.keys(ipo.subscriptionStatus).length > 0 && (
          <>
            <h2 className="text-lg font-extrabold text-navy-950 dark:text-white mb-4">Subscription Status</h2>
            <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm mb-8 overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-2xl">
                  <span className="block text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase">Retail Indiv.</span>
                  <span className="text-base font-extrabold text-navy-950 dark:text-white mt-1 block">{ipo.subscriptionStatus.retail || 0}x</span>
                </div>
                <div className="p-3 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-2xl">
                  <span className="block text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase">Non-Inst. (NII)</span>
                  <span className="text-base font-extrabold text-navy-950 dark:text-white mt-1 block">{ipo.subscriptionStatus.nii || 0}x</span>
                </div>
                <div className="p-3 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-2xl">
                  <span className="block text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase">Qualified (QIB)</span>
                  <span className="text-base font-extrabold text-navy-950 dark:text-white mt-1 block">{ipo.subscriptionStatus.qib || 0}x</span>
                </div>
                <div className="p-3 bg-white dark:bg-navy-800 border border-brand-500 rounded-2xl">
                  <span className="block text-[10px] text-brand-600 dark:text-brand-400 font-bold uppercase">Grand Total</span>
                  <span className="text-base font-black text-brand-600 dark:text-brand-400 mt-1 block">{ipo.subscriptionStatus.total || 0}x</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* About/Description Block */}
        <h2 className="text-lg font-extrabold text-navy-950 dark:text-white mb-4">About the Company</h2>
        <div className="prose prose-navy max-w-none text-navy-950 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-line bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm mb-8">
          {ipo.description}
        </div>

        {/* Disclaimer */}
        <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-2xl p-5 text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
          <h4 className="font-bold text-navy-950 dark:text-white mb-1.5">Mandatory Investment Disclaimer</h4>
          <p>
            Initial Public Offerings (IPOs) are high-risk financial instruments. Bidding is subject to significant capital risk, including the loss of principal. Subscription multiples do not guarantee positive listing gains. Please read the draft red herring prospectus (DRHP) filed with SEBI carefully and consult a certified financial planner before subscribing.
          </p>
        </div>
      </div>
    </div>
  );
};
