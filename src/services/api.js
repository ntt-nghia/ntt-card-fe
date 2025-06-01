import axios from 'axios';
import { handleApiError } from '@utils/errorHandler';

// API Base URL - can be configured via environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Request retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Base delay in ms
const RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for better UX
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request ID for tracking
let requestId = 0;

// Request interceptor for adding auth token and request tracking
api.interceptors.request.use(
  (config) => {
    // Add request ID for tracking
    config.metadata = {
      requestId: ++requestId,
      startTime: Date.now()
    };

    // Add auth token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request tracking
    console.debug(`[API Request ${config.metadata.requestId}] ${config.method?.toUpperCase()} ${config.url}`);

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic and error handling
api.interceptors.response.use(
  (response) => {
    // Log successful requests
    const duration = Date.now() - response.config.metadata.startTime;
    console.debug(`[API Response ${response.config.metadata.requestId}] ${response.status} (${duration}ms)`);

    return response;
  },
  async (error) => {
    const { config, response } = error;
    const requestId = config?.metadata?.requestId || 'unknown';

    // Log error
    console.error(`[API Error ${requestId}]`, {
      url: config?.url,
      method: config?.method,
      status: response?.status,
      message: response?.data?.message || error.message
    });

    // Handle specific error cases
    if (response) {
      const { status, data } = response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          console.warn('Authentication failed - clearing token');
          localStorage.removeItem('authToken');
          delete api.defaults.headers.common['Authorization'];

          // Only redirect if not already on auth pages
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
          break;

        case 403:
          // Forbidden - show error but don't redirect
          console.warn('Access forbidden:', data.message);
          break;

        case 404:
          // Not found - let component handle this
          console.warn('Resource not found:', config?.url);
          break;

        case 429:
          // Rate limited - implement retry with exponential backoff
          return handleRetry(error);

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors - implement retry
          return handleRetry(error);

        default:
          console.error('API Error:', data?.message || error.message);
      }
    } else if (error.request) {
      // Network error - implement retry
      console.error('Network error - no response received');
      return handleRetry(error);
    } else {
      // Request setup error
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Retry logic with exponential backoff
const handleRetry = async (error) => {
  const { config } = error;

  // Initialize retry count
  config.__retryCount = config.__retryCount || 0;

  // Check if we should retry
  const shouldRetry =
    config.__retryCount < MAX_RETRIES &&
    (
      !error.response ||
      RETRY_STATUS_CODES.includes(error.response.status)
    ) &&
    config.method?.toLowerCase() === 'get'; // Only retry GET requests

  if (!shouldRetry) {
    return Promise.reject(error);
  }

  // Increment retry count
  config.__retryCount++;

  // Calculate delay with exponential backoff and jitter
  const delay = RETRY_DELAY * Math.pow(2, config.__retryCount - 1) + Math.random() * 1000;

  console.warn(`[API Retry ${config.metadata?.requestId}] Attempt ${config.__retryCount}/${MAX_RETRIES} in ${Math.round(delay)}ms`);

  // Wait before retrying
  await new Promise(resolve => setTimeout(resolve, delay));

  // Retry the request
  return api(config);
};

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

// Enhanced API endpoint constants
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

// Enhanced API methods with better error handling
export const apiMethods = {
  get: async (url, config = {}) => {
    try {
      return await api.get(url, config);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  post: async (url, data, config = {}) => {
    try {
      return await api.post(url, data, config);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  put: async (url, data, config = {}) => {
    try {
      return await api.put(url, data, config);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  patch: async (url, data, config = {}) => {
    try {
      return await api.patch(url, data, config);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (url, config = {}) => {
    try {
      return await api.delete(url, config);
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Health check utility
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return {
      status: 'healthy',
      responseTime: Date.now() - response.config.metadata.startTime,
      version: response.data?.version
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

// Request cancellation utility
export const createCancelToken = () => {
  const source = axios.CancelToken.source();
  return {
    token: source.token,
    cancel: source.cancel
  };
};

// Upload utility with progress tracking
export const uploadFile = async (url, file, onProgress = () => {}) => {
  const formData = new FormData();
  formData.append('file', file);

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onProgress(percentCompleted);
    },
  };

  return apiMethods.post(url, formData, config);
};

export default api;
