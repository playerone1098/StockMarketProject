import React from 'react';
import { Navigate } from 'react-router-dom';

export const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  
  console.log('PrivateRoute checking token:', token);
  
  if (!token) {
    console.log('No token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('Token found, rendering protected content');
  return children;
};
