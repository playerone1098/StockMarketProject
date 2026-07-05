import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MarketTicker } from './components/MarketTicker';
import { Home } from './pages/Home';
import { TradingIdeas } from './pages/TradingIdeas';
import { TradingIdeaDetail } from './pages/TradingIdeaDetail';
import { IPOs } from './pages/IPOs';
import { IPODetail } from './pages/IPODetail';
import { Blog } from './pages/Blog';
import { BlogDetail } from './pages/BlogDetail';
import { Stocks } from './pages/Stocks';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { NotFound } from './pages/NotFound';
import { trackPageView } from './services/api';

function App() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <MarketTicker />
        <Navbar />
        <main className="pb-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trading-ideas" element={<TradingIdeas />} />
            <Route path="/trading-ideas/:slug" element={<TradingIdeaDetail />} />
            <Route path="/ipos" element={<IPOs />} />
            <Route path="/ipos/:slug" element={<IPODetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/stocks" element={<Stocks />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;
