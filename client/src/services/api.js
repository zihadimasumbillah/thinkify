import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for HttpOnly cookies
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add token to headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - could trigger logout
          // window.location.href = '/login';
          break;
        case 403:
          // Forbidden
          break;
        case 404:
          // Not found
          break;
        case 429:
          // Rate limited
          console.error('Rate limited. Please try again later.');
          break;
        case 500:
          // Server error
          console.error('Server error. Please try again later.');
          break;
        default:
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
