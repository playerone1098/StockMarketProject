import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MarketIndicesBar } from './components/MarketIndicesBar';
import { Home } from './pages/Home';
import { TradingIdeas } from './pages/TradingIdeas';
import { TradingIdeaDetail } from './pages/TradingIdeaDetail';
import { IPOs } from './pages/IPOs';
import { IPODetail } from './pages/IPODetail';
import { Blog } from './pages/Blog';
import { BlogDetail } from './pages/BlogDetail';
import { Stocks } from './pages/Stocks';
import { StockDetail } from './pages/StockDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Portfolio } from './pages/Portfolio';
import { Watchlist } from './pages/Watchlist';
import { Settings } from './pages/Settings';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { Screener } from './pages/Screener';
import { Community } from './pages/Community';
import { NotFound } from './pages/NotFound';

import { trackPageView } from './services/api';

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white transition-colors duration-200 flex flex-col justify-between">
      <div>
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
            <Route path="/screener" element={<Screener />} />
            <Route path="/stocks/:symbol" element={<StockDetail />} />
            <Route path="/community" element={<Community />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Login />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/settings" element={<Settings />} />
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

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WebSocketProvider>
          <AppContent />
        </WebSocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
