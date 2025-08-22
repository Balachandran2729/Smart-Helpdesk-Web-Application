// src/services/api.js
import axios from 'axios';

// Create an axios instance with default config
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'; // Default to localhost if env var not set

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Get token from localStorage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors (like 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors globally if needed
    // For example, redirect to login on 401
    // if (error.response?.status === 401) {
    //   // Clear token and redirect
    //   localStorage.removeItem('token');
    //   localStorage.removeItem('user');
    //   window.location.href = '/login'; // Or use navigate from react-router-dom context
    // }
    return Promise.reject(error);
  }
);

export default api;