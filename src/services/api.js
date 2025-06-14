// src/services/api.js - Enhanced with better retry logic and rate limiting protection
import axios from 'axios';
import { handleApiError } from '@utils/errorHandler';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Enhanced retry configuration
const MAX_RETRIES = 2; // Reduced from 3
const RETRY_DELAY = 2000; // Increased base delay
const RETRY_STATUS_CODES = [408, 500, 502, 503, 504]; // Removed 429 from auto-retry
const REQUEST_TIMEOUT = 30000;

// Rate limiting protection
class RateLimitProtection {
  constructor() {
    this.rateLimitedEndpoints = new Map();
    this.requestCounts = new Map();
    this.resetTimes = new Map();
  }

  isRateLimited(url) {
    const now = Date.now();
    const resetTime = this.resetTimes.get(url);

    if (resetTime && now < resetTime) {
      return true;
    }

    if (resetTime && now >= resetTime) {
      this.resetTimes.delete(url);
      this.requestCounts.delete(url);
      this.rateLimitedEndpoints.delete(url);
    }

    return false;
  }

  recordRateLimit(url, retryAfter = 60) {
    const resetTime = Date.now() + retryAfter * 1000;
    this.rateLimitedEndpoints.set(url, true);
    this.resetTimes.set(url, resetTime);

    console.warn(`Rate limited on ${url}. Reset at ${new Date(resetTime)}`);
  }

  canMakeRequest(url) {
    if (this.isRateLimited(url)) {
      return false;
    }

    // Track request frequency to prevent hitting rate limits
    const now = Date.now();
    const requests = this.requestCounts.get(url) || [];

    // Clean old requests (older than 1 minute)
    const recentRequests = requests.filter((time) => now - time < 60000);

    // If more than 50 requests in the last minute, slow down
    if (recentRequests.length >= 50) {
      console.warn(`High request frequency detected for ${url}. Throttling...`);
      return false;
    }

    recentRequests.push(now);
    this.requestCounts.set(url, recentRequests);

    return true;
  }

  getRemainingTime(url) {
    const resetTime = this.resetTimes.get(url);
    if (!resetTime) return 0;

    return Math.max(0, resetTime - Date.now());
  }
}

const rateLimitProtection = new RateLimitProtection();

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request ID for tracking
let requestId = 0;

// Request interceptor with rate limit protection
api.interceptors.request.use(
  (config) => {
    // Add request ID for tracking
    config.metadata = {
      requestId: ++requestId,
      startTime: Date.now(),
      url: config.url,
    };

    // Check rate limiting
    if (!rateLimitProtection.canMakeRequest(config.url)) {
      const remainingTime = rateLimitProtection.getRemainingTime(config.url);

      if (remainingTime > 0) {
        const error = new Error(
          `Rate limited. Try again in ${Math.ceil(remainingTime / 1000)} seconds.`,
        );
        error.code = 'RATE_LIMITED';
        error.remainingTime = remainingTime;
        return Promise.reject(error);
      }
    }

    // Add auth token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.debug(
      `[API Request ${config.metadata.requestId}] ${config.method?.toUpperCase()} ${config.url}`,
    );
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  },
);

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    console.debug(
      `[API Response ${response.config.metadata.requestId}] ${response.status} (${duration}ms)`,
    );
    return response;
  },
  async (error) => {
    const { config, response } = error;
    const requestId = config?.metadata?.requestId || 'unknown';

    // Handle rate limiting specifically
    if (response?.status === 429) {
      const retryAfter = parseInt(response.headers['retry-after']) || 60;
      rateLimitProtection.recordRateLimit(config.url, retryAfter);

      console.error(`[API Rate Limited ${requestId}] ${config?.url} - Retry after ${retryAfter}s`);

      // Don't auto-retry rate limited requests
      return Promise.reject(error);
    }

    // Log error
    console.error(`[API Error ${requestId}]`, {
      url: config?.url,
      method: config?.method,
      status: response?.status,
      message: response?.data?.message || error.message,
    });

    // Handle specific error cases
    if (response) {
      const { status } = response;

      switch (status) {
        case 401:
          console.warn('Authentication failed - clearing token');
          localStorage.removeItem('authToken');
          delete api.defaults.headers.common['Authorization'];

          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            setTimeout(() => {
              window.location.href = '/login';
            }, 100);
          }
          break;

        case 403:
          console.warn('Access forbidden:', response.data?.message);
          break;

        case 404:
          console.warn('Resource not found:', config?.url);
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors - implement limited retry with exponential backoff
          return handleRetryWithBackoff(error);

        default:
          console.error('API Error:', response.data?.message || error.message);
      }
    } else if (error.request) {
      console.error('Network error - no response received');
      return handleRetryWithBackoff(error);
    } else if (error.code === 'RATE_LIMITED') {
      // Our custom rate limit error
      return Promise.reject(error);
    } else {
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  },
);

// Enhanced retry logic with exponential backoff and limits
const handleRetryWithBackoff = async (error) => {
  const { config } = error;

  // Initialize retry count
  config.__retryCount = config.__retryCount || 0;

  // Check if we should retry
  const shouldRetry =
    config.__retryCount < MAX_RETRIES &&
    (!error.response || RETRY_STATUS_CODES.includes(error.response.status)) &&
    config.method?.toLowerCase() === 'get' && // Only retry GET requests
    !rateLimitProtection.isRateLimited(config.url); // Don't retry if rate limited

  if (!shouldRetry) {
    return Promise.reject(error);
  }

  // Increment retry count
  config.__retryCount++;

  // Calculate delay with exponential backoff and jitter
  const delay = RETRY_DELAY * Math.pow(2, config.__retryCount - 1) + Math.random() * 1000;
  const cappedDelay = Math.min(delay, 15000); // Cap at 15 seconds

  console.warn(
    `[API Retry ${config.metadata?.requestId}] Attempt ${config.__retryCount}/${MAX_RETRIES} in ${Math.round(cappedDelay)}ms for ${config.url}`,
  );

  // Wait before retrying
  await new Promise((resolve) => setTimeout(resolve, cappedDelay));

  // Check rate limit again before retry
  if (rateLimitProtection.isRateLimited(config.url)) {
    console.warn('Retry aborted due to rate limiting');
    return Promise.reject(error);
  }

  // Retry the request
  return api(config);
};

// Enhanced API methods with better error handling
export const apiMethods = {
  get: async (url, config = {}) => {
    try {
      return await api.get(url, config);
    } catch (error) {
      if (error.code === 'RATE_LIMITED') {
        throw new Error(
          `Service temporarily unavailable. Please try again in ${Math.ceil(error.remainingTime / 1000)} seconds.`,
        );
      }
      throw handleApiError(error);
    }
  },

  post: async (url, data, config = {}) => {
    try {
      return await api.post(url, data, config);
    } catch (error) {
      if (error.code === 'RATE_LIMITED') {
        throw new Error(
          `Service temporarily unavailable. Please try again in ${Math.ceil(error.remainingTime / 1000)} seconds.`,
        );
      }
      throw handleApiError(error);
    }
  },

  patch: async (url, data, config = {}) => {
    try {
      return await api.patch(url, data, config);
    } catch (error) {
      if (error.code === 'RATE_LIMITED') {
        throw new Error(
          `Service temporarily unavailable. Please try again in ${Math.ceil(error.remainingTime / 1000)} seconds.`,
        );
      }
      throw handleApiError(error);
    }
  },

  delete: async (url, config = {}) => {
    try {
      return await api.delete(url, config);
    } catch (error) {
      if (error.code === 'RATE_LIMITED') {
        throw new Error(
          `Service temporarily unavailable. Please try again in ${Math.ceil(error.remainingTime / 1000)} seconds.`,
        );
      }
      throw handleApiError(error);
    }
  },
};

// Helper functions
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

// Existing endpoints configuration
export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/v1/auth/register',
    LOGIN: '/v1/auth/login',
    LOGOUT: '/v1/auth/logout',
    FORGOT_PASSWORD: '/v1/auth/forgot-password',
    UPDATE_PROFILE: '/v1/auth/update-profile',
  },
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
  DECKS: {
    LIST: '/v1/decks',
    GET: (id) => `/v1/decks/${id}`,
    CARDS: (id) => `/v1/decks/${id}/cards`,
    UNLOCK: (id) => `/v1/decks/${id}/unlock`,
    STATISTICS: (id) => `/v1/decks/${id}/statistics`,
  },
  CARDS: {
    LIST: '/v1/cards',
    GET: (id) => `/v1/cards/${id}`,
    UNASSIGNED: '/v1/cards/unassigned',
  },
  ADMIN: {
    DECKS: '/v1/admin/decks',
    CARDS: '/v1/admin/cards',
    CARDS_BULK: '/v1/admin/cards/bulk',
    CARDS_GENERATE: '/v1/admin/cards/generate',
    BATCH_GENERATE: '/v1/admin/batch-generate-cards', // NEW
    GENERATION_ANALYTICS: '/v1/admin/generation-analytics', // NEW
    APPROVE_CARDS: '/v1/admin/approve-cards', // NEW
    PENDING_REVIEW: '/v1/admin/pending-review-cards', // NEW
    REGENERATE_CARDS: '/v1/admin/regenerate-cards', // NEW
    ANALYTICS: '/v1/admin/analytics',
    DECK_ANALYTICS: (id) => `/v1/admin/analytics/decks/${id}`,
  },
};

export default api;
