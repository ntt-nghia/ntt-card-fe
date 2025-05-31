import { apiMethods, ENDPOINTS } from './api';

// Authentication service functions
export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await apiMethods.post(ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await apiMethods.post(ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await apiMethods.post(ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await apiMethods.get(ENDPOINTS.USERS.PROFILE);
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await apiMethods.patch(ENDPOINTS.AUTH.UPDATE_PROFILE, profileData);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await apiMethods.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  },
};

// Export individual functions for easier importing
export const register = authService.register;
export const login = authService.login;
export const logout = authService.logout;
export const getProfile = authService.getProfile;
export const updateProfile = authService.updateProfile;
export const forgotPassword = authService.forgotPassword;
