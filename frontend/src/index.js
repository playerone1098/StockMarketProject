import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import axios from 'axios';
import './index.css';
import App from './App';

// Dynamically set API base URL based on environment and hostname
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'development') {
    return '';
  }
  
  // In production builds, dynamically connect to the local backend 
  // if accessed via localhost or a local network IP.
  const hostname = window.location.hostname;
  const isLocal = 
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.') || 
    hostname.startsWith('10.') || 
    (hostname.startsWith('172.') && parseInt(hostname.split('.')[1], 10) >= 16 && parseInt(hostname.split('.')[1], 10) <= 31) ||
    hostname.endsWith('.local');

  if (isLocal) {
    return `http://${hostname}:5000`;
  }

  // Use build-time environment variable if defined, fallback to Railway
  return process.env.REACT_APP_API_URL || 'https://cashbackproject-production.up.railway.app';
};

axios.defaults.baseURL = getBaseURL();


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

