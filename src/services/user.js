import { apiMethods, ENDPOINTS } from './api';

// User service functions
export const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await apiMethods.get(ENDPOINTS.USERS.PROFILE);
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await apiMethods.patch(ENDPOINTS.USERS.PROFILE, profileData);
    return response.data;
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    const response = await apiMethods.patch(ENDPOINTS.USERS.PREFERENCES, {
      preferences
    });
    return response.data;
  },

  // Update language preference
  updateLanguage: async (language) => {
    const response = await apiMethods.patch(ENDPOINTS.USERS.LANGUAGE, {
      language
    });
    return response.data;
  },

  // Get user statistics
  getStatistics: async () => {
    const response = await apiMethods.get(ENDPOINTS.USERS.STATISTICS);
    return response.data;
  },

  // Record game completion
  recordGameCompletion: async (gameData) => {
    const response = await apiMethods.post(ENDPOINTS.USERS.GAME_COMPLETION, gameData);
    return response.data;
  },

  // Get user's unlocked decks
  getUserDecks: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const url = params ? `${ENDPOINTS.USERS.DECKS}?${params}` : ENDPOINTS.USERS.DECKS;
    const response = await apiMethods.get(url);
    return response.data;
  },

  // Get purchase history
  getPurchaseHistory: async () => {
    const response = await apiMethods.get(ENDPOINTS.USERS.PURCHASES);
    return response.data;
  },

  // Delete user account
  deleteAccount: async () => {
    const response = await apiMethods.delete(ENDPOINTS.USERS.ACCOUNT);
    return response.data;
  },
};

// Export individual functions for easier importing
export const getProfile = userService.getProfile;
export const updateProfile = userService.updateProfile;
export const updatePreferences = userService.updatePreferences;
export const updateLanguage = userService.updateLanguage;
export const getStatistics = userService.getStatistics;
export const recordGameCompletion = userService.recordGameCompletion;
export const getUserDecks = userService.getUserDecks;
export const getPurchaseHistory = userService.getPurchaseHistory;
export const deleteAccount = userService.deleteAccount;
