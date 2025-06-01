import firebaseAuthService from './firebaseAuth';

// Authentication service functions using Firebase
export const authService = {
  // Register new user
  register: async (userData) => {
    return await firebaseAuthService.register(userData);
  },

  // Login user
  login: async (credentials) => {
    return await firebaseAuthService.login(credentials);
  },

  // Logout user
  logout: async () => {
    return await firebaseAuthService.signOut();
  },

  // Get user profile
  getProfile: async () => {
    return await firebaseAuthService.updateProfile({});
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return await firebaseAuthService.updateProfile(profileData);
  },

  // Forgot password
  forgotPassword: async (email) => {
    // This still goes directly to backend since it doesn't require auth
    const response = await fetch('/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send reset email');
    }

    return await response.json();
  },

  // Check auth state
  checkAuthState: async () => {
    return await firebaseAuthService.checkAuthState();
  },

  // Refresh token
  refreshToken: async () => {
    return await firebaseAuthService.refreshToken();
  },

  // Get current user
  getCurrentUser: () => {
    return firebaseAuthService.getCurrentUser();
  },

  // Check if authenticated
  isAuthenticated: () => {
    return firebaseAuthService.isAuthenticated();
  },
};

// Export individual functions for easier importing
export const register = authService.register;
export const login = authService.login;
export const logout = authService.logout;
export const getProfile = authService.getProfile;
export const updateProfile = authService.updateProfile;
export const forgotPassword = authService.forgotPassword;
export const checkAuthState = authService.checkAuthState;
export const refreshToken = authService.refreshToken;
export const getCurrentUser = authService.getCurrentUser;
export const isAuthenticated = authService.isAuthenticated;
