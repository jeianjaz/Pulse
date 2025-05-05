import axios from 'axios';
import { getCsrfToken } from './csrf';

const isClient = typeof window !== 'undefined';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    const proxyPaths = [
      '/schedule',
      '/appointments',
      '/patients',
      '/consultation-request',
      '/consultation-record',
      '/consultations', // Add the new consultations endpoint
      '/volunteers',
      '/patient',
      '/availability', // New API path
      '/auth',         // Authentication endpoints
    ];
    
    if (config.url && proxyPaths.some(path => config.url?.startsWith(path))) {
      const originalUrl = config.url;
      const originalMethod = config.method?.toUpperCase() || 'GET';
      const originalData = config.data;
      const originalParams = config.params;
      
      config.url = '/proxy';
      config.method = 'POST';
      config.data = {
        url: `/api${originalUrl}`,
        method: originalMethod,
        data: originalData,
        params: originalParams
      };
    }
    
    // console.log('Request URL:', config.url);
    // console.log('Request headers:', config.headers);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {

      if (error.response.status === 401) {
        console.error('Unauthorized access');
      } else if (error.response.status === 403) {
        console.error('Forbidden access');
      } else if (error.response.status === 500) {
        console.error('Server error');
      }
    } else if (error.request) {
      console.error('No response received', error.request);
    } else {
      console.error('Error setting up request', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;