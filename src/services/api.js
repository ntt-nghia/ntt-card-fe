import axios from 'axios';
import { handleApiError } from '@utils/errorHandler';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const REQUEST_TIMEOUT = 30000;

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
