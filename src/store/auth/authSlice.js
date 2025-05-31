import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Auth state management
    checkAuthState: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setAuthState: (state, action) => {
      const { user, token } = action.payload;
      state.isAuthenticated = true;
      state.user = user;
      state.token = token;
      state.isLoading = false;
      state.isInitialized = true;
      state.error = null;
    },
    clearAuthState: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.isLoading = false;
      state.isInitialized = true;
      state.error = null;
    },

    // Login
    loginRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.isAuthenticated = true;
      state.user = user;
      state.token = token;
      state.isLoading = false;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.isLoading = false;
      state.error = action.payload;
    },

    // Register
    registerRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.isAuthenticated = true;
      state.user = user;
      state.token = token;
      state.isLoading = false;
      state.error = null;
    },
    registerFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Logout
    logoutRequest: (state) => {
      state.isLoading = true;
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.isLoading = false;
      state.error = null;
    },

    // Update profile
    updateProfileRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action) => {
      state.user = { ...state.user, ...action.payload.user };
      state.isLoading = false;
      state.error = null;
    },
    updateProfileFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Forgot password
    forgotPasswordRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    forgotPasswordSuccess: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    forgotPasswordFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
