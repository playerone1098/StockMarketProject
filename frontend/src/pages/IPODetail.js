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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-extrabold text-navy-950">IPO Entry Not Found</h2>
        <p className="text-gray-500 text-sm mt-2">The IPO data you requested is unavailable or has been removed.</p>
        <Link to="/ipos" className="mt-6 inline-block px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-sm transition">
          Back to IPO Board
        </Link>
      </div>
    );
  }

  const getStatusColors = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-brand-50 text-brand-700 border-brand-200';
      case 'listed': return 'bg-navy-50 text-navy-700 border-navy-200';
      case 'closed': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
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
    <>
      <Helmet>
        <title>{`${ipo.companyName} IPO Date, Price Band & Status | StockVista`}</title>
        <meta name="description" content={`Get latest details of ${ipo.companyName} IPO: Price band, issue size, bidding window timeline, registrar information, and subscription stats.`} />
        <meta property="og:title" content={`${ipo.companyName} IPO Date, Price Band & Status | StockVista`} />
        <meta property="og:description" content={`Get latest details of ${ipo.companyName} IPO: Price band, issue size, bidding window timeline, registrar information, and subscription stats.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.origin + window.location.pathname} />
        {ipo.imageUrl && <meta property="og:image" content={ipo.imageUrl} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${ipo.companyName} IPO Date, Price Band & Status | StockVista`} />
        <meta name="twitter:description" content={`Get latest details of ${ipo.companyName} IPO: Price band, issue size, bidding window timeline, registrar information, and subscription stats.`} />
        {ipo.imageUrl && <meta name="twitter:image" content={ipo.imageUrl} />}
        <link rel="canonical" href={window.location.origin + window.location.pathname} />
        <script type="application/ld+json">
          {JSON.stringify(ipoJsonLd)}
        </script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation Breadcrumb */}
        <div className="text-xs font-semibold text-gray-400 mb-6 flex items-center space-x-1">
          <Link to="/" className="hover:text-brand-600">Home</Link>
          <span>/</span>
          <Link to="/ipos" className="hover:text-brand-600">IPO Tracker</Link>
          <span>/</span>
          <span className="text-navy-950 truncate max-w-[200px]">{ipo.companyName}</span>
        </div>

        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
          <div className="flex items-center">
            {ipo.imageUrl ? (
              <img src={ipo.imageUrl} alt={ipo.companyName} className="w-16 h-16 rounded-2xl mr-4 object-contain bg-gray-50 border border-gray-100 p-1.5" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-navy-100 text-navy-800 flex items-center justify-center font-black text-2xl mr-4 border border-navy-200">
                {ipo.companyName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-navy-950 leading-tight">
                {ipo.companyName} IPO
              </h1>
              <p className="text-sm text-gray-500 mt-1">{ipo.symbol ? `Proposed Ticker: ${ipo.symbol}` : 'Equity Share Listing'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`text-xs px-3 py-1 rounded-full font-extrabold uppercase border ${getStatusColors(ipo.status)}`}>
              STATUS: {ipo.status}
            </span>
            <span className="text-xs font-bold bg-navy-50 text-navy-800 border border-navy-100 px-3 py-1 rounded-full capitalize">
              {ipo.sector} Sector
            </span>
          </div>
        </div>

        {/* Timelines Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex items-center">
            <span className="text-2xl mr-3">📅</span>
            <div>
              <span className="block text-[10px] text-gray-400 font-semibold uppercase">Open Date</span>
              <span className="text-sm font-bold text-navy-950">{formatDate(ipo.openDate)}</span>
            </div>
          </div>
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex items-center">
            <span className="text-2xl mr-3">📅</span>
            <div>
              <span className="block text-[10px] text-gray-400 font-semibold uppercase">Close Date</span>
              <span className="text-sm font-bold text-navy-950">{formatDate(ipo.closeDate)}</span>
            </div>
          </div>
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex items-center">
            <span className="text-2xl mr-3">🔔</span>
            <div>
              <span className="block text-[10px] text-gray-400 font-semibold uppercase">Listing Date</span>
              <span className="text-sm font-bold text-navy-950">{formatDate(ipo.listingDate)}</span>
            </div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <h2 className="text-lg font-extrabold text-navy-950 mb-4">IPO Details & Issue Structure</h2>
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mb-8 overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-50">
              <tr>
                <td className="py-3.5 text-gray-400 font-medium">Price Band</td>
                <td className="py-3.5 text-right font-bold text-navy-950">
                  {ipo.priceRange?.min && ipo.priceRange?.max
                    ? `₹${ipo.priceRange.min} - ₹${ipo.priceRange.max} per share`
                    : 'To Be Announced'}
                </td>
              </tr>
              <tr>
                <td className="py-3.5 text-gray-400 font-medium">Lot Size</td>
                <td className="py-3.5 text-right font-bold text-navy-950">{ipo.lotSize ? `${ipo.lotSize} Shares` : 'TBA'}</td>
              </tr>
              <tr>
                <td className="py-3.5 text-gray-400 font-medium">Issue Size</td>
                <td className="py-3.5 text-right font-bold text-navy-950">{ipo.issueSize || 'TBA'}</td>
              </tr>
              <tr>
                <td className="py-3.5 text-gray-400 font-medium">Issue Type</td>
                <td className="py-3.5 text-right font-bold text-navy-950 capitalize">{ipo.issueType || 'Fresh Issue & OFS'}</td>
              </tr>
              {ipo.listingPrice > 0 && (
                <tr className="bg-brand-50/50">
                  <td className="py-3.5 px-2 text-brand-800 font-semibold">Actual Listing Price</td>
                  <td className="py-3.5 px-2 text-right font-black text-brand-700">{formatCurrency(ipo.listingPrice)}</td>
                </tr>
              )}
              {ipo.registrar && (
                <tr>
                  <td className="py-3.5 text-gray-400 font-medium">IPO Registrar</td>
                  <td className="py-3.5 text-right font-semibold text-navy-800">{ipo.registrar}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Subscription Status Block */}
        {ipo.subscriptionStatus && Object.keys(ipo.subscriptionStatus).length > 0 && (
          <>
            <h2 className="text-lg font-extrabold text-navy-950 mb-4">Subscription Status</h2>
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mb-8 overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Retail Indiv.</span>
                  <span className="text-base font-extrabold text-navy-950 mt-1 block">{ipo.subscriptionStatus.retail || 0}x</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Non-Inst. (NII)</span>
                  <span className="text-base font-extrabold text-navy-950 mt-1 block">{ipo.subscriptionStatus.nii || 0}x</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Qualified (QIB)</span>
                  <span className="text-base font-extrabold text-navy-950 mt-1 block">{ipo.subscriptionStatus.qib || 0}x</span>
                </div>
                <div className="p-3 bg-brand-50 rounded-2xl">
                  <span className="block text-[10px] text-brand-800 font-bold uppercase">Grand Total</span>
                  <span className="text-base font-black text-brand-700 mt-1 block">{ipo.subscriptionStatus.total || 0}x</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* About/Description Block */}
        <h2 className="text-lg font-extrabold text-navy-950 mb-4">About the Company</h2>
        <div className="prose prose-navy max-w-none text-navy-950 text-sm leading-relaxed whitespace-pre-line bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mb-8">
          {ipo.description}
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-50 border border-gray-150 rounded-2xl p-5 text-xs text-gray-500 leading-relaxed">
          <h4 className="font-bold text-navy-950 mb-1.5">Mandatory Investment Disclaimer</h4>
          <p>
            Initial Public Offerings (IPOs) are high-risk financial instruments. Bidding is subject to significant capital risk, including the loss of principal. Subscription multiples do not guarantee positive listing gains. Please read the draft red herring prospectus (DRHP) filed with SEBI carefully and consult a certified financial planner before subscribing.
          </p>
        </div>
      </div>
    </>
  );
};
