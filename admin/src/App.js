import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { PrivateRoute } from './components/PrivateRoute';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { TradingIdeas } from './pages/TradingIdeas';
import { TradingIdeaForm } from './pages/TradingIdeaForm';
import { IPOs } from './pages/IPOs';
import { IPOForm } from './pages/IPOForm';
import { BlogPosts } from './pages/BlogPosts';
import { BlogPostForm } from './pages/BlogPostForm';
import { Stocks } from './pages/Stocks';
import { StockForm } from './pages/StockForm';
import { Sectors } from './pages/Sectors';
import { Analytics } from './pages/Analytics';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Dashboard Route */}
        <Route path="/" element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } />

        {/* Protected Trading Ideas Routes */}
        <Route path="/trading-ideas" element={
          <PrivateRoute>
            <Layout>
              <TradingIdeas />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/trading-ideas/new" element={
          <PrivateRoute>
            <Layout>
              <TradingIdeaForm />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/trading-ideas/:id/edit" element={
          <PrivateRoute>
            <Layout>
              <TradingIdeaForm />
            </Layout>
          </PrivateRoute>
        } />

        {/* Protected IPO Tracker Routes */}
        <Route path="/ipos" element={
          <PrivateRoute>
            <Layout>
              <IPOs />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/ipos/new" element={
          <PrivateRoute>
            <Layout>
              <IPOForm />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/ipos/:id/edit" element={
          <PrivateRoute>
            <Layout>
              <IPOForm />
            </Layout>
          </PrivateRoute>
        } />

        {/* Protected Blog Posts Routes */}
        <Route path="/blogs" element={
          <PrivateRoute>
            <Layout>
              <BlogPosts />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/blogs/new" element={
          <PrivateRoute>
            <Layout>
              <BlogPostForm />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/blogs/:id/edit" element={
          <PrivateRoute>
            <Layout>
              <BlogPostForm />
            </Layout>
          </PrivateRoute>
        } />

        {/* Protected Stock Directory Routes */}
        <Route path="/stocks" element={
          <PrivateRoute>
            <Layout>
              <Stocks />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/stocks/new" element={
          <PrivateRoute>
            <Layout>
              <StockForm />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/stocks/:id/edit" element={
          <PrivateRoute>
            <Layout>
              <StockForm />
            </Layout>
          </PrivateRoute>
        } />

        {/* Protected Sectors & Analytics Routes */}
        <Route path="/sectors" element={
          <PrivateRoute>
            <Layout>
              <Sectors />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/analytics" element={
          <PrivateRoute>
            <Layout>
              <Analytics />
            </Layout>
          </PrivateRoute>
        } />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex w-full min-h-screen relative overflow-hidden">
      {/* Sidebar Backdrop Overlay on Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Navbar for Mobile/Tablet */}
        <header className="flex md:hidden items-center justify-between px-6 py-4 bg-zinc-950 text-white border-b border-zinc-900 shadow-sm z-30">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              StockVista
            </h1>
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold px-1.5 py-0.5 bg-zinc-900 rounded">
              Admin
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-label="Open sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </header>

        {/* Inner Main Content */}
        <main className="flex-1 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default App;
