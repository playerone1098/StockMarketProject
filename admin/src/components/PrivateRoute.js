import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/axios';

export const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  const [isValidating, setIsValidating] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const validateAdmin = async () => {
      if (!token) {
        setIsValidating(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.data.user?.role === 'admin') {
          setIsAdmin(true);
        } else {
          localStorage.removeItem('adminToken');
        }
      } catch (err) {
        console.error('Admin validation failed:', err);
        localStorage.removeItem('adminToken');
      } finally {
        setIsValidating(false);
      }
    };
    validateAdmin();
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
