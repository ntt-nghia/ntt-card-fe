import axios from 'axios';

// API Base URL - can be configured via environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common HTTP errors
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('authToken');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden:', data.message);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', data.message);
          break;
        case 429:
          // Too many requests
          console.error('Rate limit exceeded');
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          console.error('Server error:', data.message);
          break;
        default:
          console.error('API Error:', data.message);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - please check your connection');
    } else {
      // Request setup error
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Helper functions for setting/removing auth token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('authToken', token);
  }
};

export const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
  localStorage.removeItem('authToken');
};

// API endpoint constants based on backend routes
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/v1/auth/register',
    LOGIN: '/v1/auth/login',
    LOGOUT: '/v1/auth/logout',
    FORGOT_PASSWORD: '/v1/auth/forgot-password',
    UPDATE_PROFILE: '/v1/auth/update-profile',
  },

  // User endpoints
  USERS: {
    PROFILE: '/v1/users/profile',
    STATISTICS: '/v1/users/statistics',
    PREFERENCES: '/v1/users/preferences',
    LANGUAGE: '/v1/users/language',
    GAME_COMPLETION: '/v1/users/game-completion',
    DECKS: '/v1/users/decks',
    PURCHASES: '/v1/users/purchases',
    ACCOUNT: '/v1/users/account',
  },

  // Session endpoints
  SESSIONS: {
    START: '/v1/sessions/start',
    ACTIVE: '/v1/sessions/active',
    GET: (id) => `/v1/sessions/${id}`,
    DRAW_CARD: (id) => `/v1/sessions/${id}/draw-card`,
    COMPLETE_CARD: (id) => `/v1/sessions/${id}/complete-card`,
    SKIP_CARD: (id) => `/v1/sessions/${id}/skip-card`,
    END: (id) => `/v1/sessions/${id}/end`,
    STATISTICS: (id) => `/v1/sessions/${id}/statistics`,
  },

  // Deck endpoints
  DECKS: {
    LIST: '/v1/decks',
    GET: (id) => `/v1/decks/${id}`,
    CARDS: (id) => `/v1/decks/${id}/cards`,
    UNLOCK: (id) => `/v1/decks/${id}/unlock`,
    STATISTICS: (id) => `/v1/decks/${id}/statistics`,
  },

  // Card endpoints
  CARDS: {
    LIST: '/v1/cards',
    GET: (id) => `/v1/cards/${id}`,
    UNASSIGNED: '/v1/cards/unassigned',
  },

  // Admin endpoints
  ADMIN: {
    DECKS: '/v1/admin/decks',
    CARDS: '/v1/admin/cards',
    CARDS_BULK: '/v1/admin/cards/bulk',
    CARDS_GENERATE: '/v1/admin/cards/generate',
    ANALYTICS: '/v1/admin/analytics',
    DECK_ANALYTICS: (id) => `/v1/admin/analytics/decks/${id}`,
  },
};

// Generic API methods
export const apiMethods = {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),
};

export default api;
