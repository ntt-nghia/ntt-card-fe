import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // User profile data
  profile: null,
  statistics: null,
  preferences: null,

  // User's decks and purchases
  unlockedDecks: [],
  purchaseHistory: [],

  // UI state
  isLoading: false,
  isUpdating: false,
  error: null,

  // Statistics loading states
  statsLoading: false,
  statsError: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Get user profile
    getUserProfileRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getUserProfileSuccess: (state, action) => {
      state.profile = action.payload.user;
      state.isLoading = false;
      state.error = null;
    },
    getUserProfileFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update user profile
    updateUserProfileRequest: (state) => {
      state.isUpdating = true;
      state.error = null;
    },
    updateUserProfileSuccess: (state, action) => {
      state.profile = { ...state.profile, ...action.payload.user };
      state.isUpdating = false;
      state.error = null;
    },
    updateUserProfileFailure: (state, action) => {
      state.isUpdating = false;
      state.error = action.payload;
    },

    // Update user preferences
    updateUserPreferencesRequest: (state) => {
      state.isUpdating = true;
      state.error = null;
    },
    updateUserPreferencesSuccess: (state, action) => {
      state.preferences = action.payload.preferences;
      if (state.profile) {
        state.profile.preferences = action.payload.preferences;
      }
      state.isUpdating = false;
      state.error = null;
    },
    updateUserPreferencesFailure: (state, action) => {
      state.isUpdating = false;
      state.error = action.payload;
    },

    // Update language preference
    updateLanguageRequest: (state) => {
      state.isUpdating = true;
      state.error = null;
    },
    updateLanguageSuccess: (state, action) => {
      const { language } = action.payload;
      if (state.profile) {
        state.profile.language = language;
      }
      state.isUpdating = false;
      state.error = null;
    },
    updateLanguageFailure: (state, action) => {
      state.isUpdating = false;
      state.error = action.payload;
    },

    // Get user statistics
    getUserStatisticsRequest: (state) => {
      state.statsLoading = true;
      state.statsError = null;
    },
    getUserStatisticsSuccess: (state, action) => {
      state.statistics = action.payload.statistics;
      state.statsLoading = false;
      state.statsError = null;
    },
    getUserStatisticsFailure: (state, action) => {
      state.statsLoading = false;
      state.statsError = action.payload;
    },

    // Record game completion
    recordGameCompletionRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    recordGameCompletionSuccess: (state, action) => {
      state.statistics = { ...state.statistics, ...action.payload.statistics };
      state.isLoading = false;
      state.error = null;
    },
    recordGameCompletionFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Get user decks
    getUserDecksRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getUserDecksSuccess: (state, action) => {
      state.unlockedDecks = action.payload.decks;
      state.isLoading = false;
      state.error = null;
    },
    getUserDecksFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Get purchase history
    getPurchaseHistoryRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getPurchaseHistorySuccess: (state, action) => {
      state.purchaseHistory = action.payload.purchases;
      state.isLoading = false;
      state.error = null;
    },
    getPurchaseHistoryFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Delete account
    deleteAccountRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    deleteAccountSuccess: (state) => {
      // Clear all user data
      state.profile = null;
      state.statistics = null;
      state.preferences = null;
      state.unlockedDecks = [];
      state.purchaseHistory = [];
      state.isLoading = false;
      state.error = null;
    },
    deleteAccountFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Clear user data (for logout)
    clearUserData: (state) => {
      state.profile = null;
      state.statistics = null;
      state.preferences = null;
      state.unlockedDecks = [];
      state.purchaseHistory = [];
      state.isLoading = false;
      state.isUpdating = false;
      state.error = null;
      state.statsLoading = false;
      state.statsError = null;
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
      state.statsError = null;
    },
  },
});

export const userActions = userSlice.actions;
export default userSlice.reducer;
