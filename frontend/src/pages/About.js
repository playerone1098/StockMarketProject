import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>About Us | Learn Our Mission & Investment Principles | JodhpurTraders</title>
        <meta name="description" content="Discover JodhpurTraders's journey, professional core research values, and stats. We empower Indian retail investors with high-quality stock picks, blogs, and IPO information." />
        <meta property="og:title" content="About JodhpurTraders — Our Mission & Investment Principles" />
        <meta property="og:description" content="Discover JodhpurTraders's journey, professional core research values, and stats. We empower Indian retail investors with high-quality stock picks, blogs, and IPO information." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.origin + window.location.pathname} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About JodhpurTraders — Our Mission & Investment Principles" />
        <meta name="twitter:description" content="Discover JodhpurTraders's journey, professional core research values, and stats." />
        <link rel="canonical" href={window.location.origin + window.location.pathname} />
      </Helmet>
      
      {/* Hero Section */}
      <section className="text-center py-16 finance-gradient rounded-3xl text-white mb-16 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-900 opacity-20"></div>
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Empowering Your Financial Future
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed font-medium">
            We bridge the gap between complex market analytics and retail investors. Get access to professional stock screener directories, verified trading ideas, and comprehensive IPO trackers.
          </p>
          <Link
            to="/trading-ideas"
            className="inline-block bg-brand-500 text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg hover:bg-brand-600 transition-all hover:scale-105 duration-200"
          >
            Explore Trading Ideas
          </Link>
        </div>
      </section>

      {/* Our Mission & Vision */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-6 border border-brand-100">
            <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-navy-950 mb-4">Our Mission</h2>
          <p className="text-sm text-gray-600 leading-relaxed font-medium">
            To build the most analytical and transparent stock market resource platform. We aim to curate objective, high-probability trading signals and comprehensive educational content to help people make data-driven investment decisions.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center mb-6 border border-navy-150">
            <svg className="w-6 h-6 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-navy-950 mb-4">Our Vision</h2>
          <p className="text-sm text-gray-600 leading-relaxed font-medium">
            A financially literate India. We envision a future where retail market participation is guided by sound technical parameters, fundamental indicators, and comprehensive risk management, eliminating guesswork.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="mb-16">
        <h2 className="text-3xl font-black text-navy-950 text-center mb-12">Our Investing Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: 'Objectivity & Data',
              desc: 'Every trading idea is backed by support, resistance, indicators, or solid fundamental catalyst statistics.',
              color: 'border-brand-500'
            },
            {
              title: 'Risk First',
              desc: 'We emphasize setting strict Entry, Target, and Stop Loss thresholds on every single trading idea.',
              color: 'border-red-500'
            },
            {
              title: 'Timeliness',
              desc: 'IPOs, listing data, subscription stats, and news briefs are updated and audited continuously.',
              color: 'border-blue-500'
            },
            {
              title: 'Investor Education',
              desc: 'Curating guides and breakdowns to make complex finance topics accessible to beginners.',
              color: 'border-navy-700'
            }
          ].map((val, idx) => (
            <div key={idx} className={`bg-white p-6 rounded-2xl border-t-4 ${val.color} shadow-sm`}>
              <h3 className="font-extrabold text-navy-950 text-base mb-2">{val.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats / Numbers section */}
      <section className="bg-navy-950 text-white rounded-3xl p-12 mb-8 border border-navy-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-black text-brand-400 mb-2">15+</div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Top Indian Stocks Tracked</div>
          </div>
          <div>
            <div className="text-4xl font-black text-brand-400 mb-2">95%+</div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Screener Directory Accuracy</div>
          </div>
          <div>
            <div className="text-4xl font-black text-brand-400 mb-2">Hourly</div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Market Data Audits</div>
          </div>
        </div>
      </section>
    </div>
  );
};
