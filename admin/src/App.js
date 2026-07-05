import React from 'react';
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
  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default App;
