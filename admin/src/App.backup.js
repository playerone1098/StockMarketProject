import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Deals } from './pages/Deals';
import { Users } from './pages/Users';
import { Rewards } from './pages/Rewards';
import { DealForm } from './pages/DealForm';
import { PrivateRoute } from './components/PrivateRoute';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/deals" element={
          <PrivateRoute>
            <Layout>
              <Deals />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/deals/new" element={
          <PrivateRoute>
            <Layout>
              <DealForm />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/deals/:id/edit" element={
          <PrivateRoute>
            <Layout>
              <DealForm />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/users" element={
          <PrivateRoute>
            <Layout>
              <Users />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/rewards" element={
          <PrivateRoute>
            <Layout>
              <Rewards />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function Layout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}

export default App;
