import axios from 'axios';

const getBaseURL = () => {
  if (process.env.NODE_ENV === 'development') {
    return '/api';
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
    return `http://${hostname}:5000/api`;
  }

  // Use environment variable or fallback to production Railway URL
  const apiBase = process.env.REACT_APP_API_URL || 'https://cashbackproject-production.up.railway.app';
  return `${apiBase}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
});


// Add authentication token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('adminToken');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
