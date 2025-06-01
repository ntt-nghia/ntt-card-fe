import {
  auth,
  signInWithCustomTokenAndGetIdToken,
  onAuthStateChange,
  signOut,
} from '@/config/firebase.client';
import { setAuthToken, removeAuthToken } from './api';
import { apiMethods, ENDPOINTS } from './api';

class FirebaseAuthService {
  constructor() {
    this.unsubscribe = null;
    this.setupAuthListener();
  }

  /**
   * Set up Firebase auth state listener
   */
  setupAuthListener() {
    this.unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        try {
          // Get fresh ID token
          const idToken = await user.getIdToken(true);

          // Update API headers
          setAuthToken(idToken);

          // Store for persistence
          localStorage.setItem('authToken', idToken);

          console.log('Firebase auth state: User signed in');
        } catch (error) {
          console.error('Error getting ID token:', error);
          this.signOut();
        }
      } else {
        // User signed out
        removeAuthToken();
        localStorage.removeItem('authToken');
        localStorage.removeItem('customToken');
        console.log('Firebase auth state: User signed out');
      }
    });
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      // Call backend registration endpoint
      const response = await apiMethods.post(ENDPOINTS.AUTH.REGISTER, userData);
      const { customToken, user } = response.data.data;

      if (!customToken) {
        throw new Error('No custom token received from server');
      }

      // Store custom token for future refreshes
      localStorage.setItem('customToken', customToken);

      // Sign in with Firebase using custom token
      const idToken = await signInWithCustomTokenAndGetIdToken(customToken);

      // Update API headers
      setAuthToken(idToken);

      return { user, token: idToken };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login existing user
   */
  async login(credentials) {
    try {
      // Call backend login endpoint
      const response = await apiMethods.post(ENDPOINTS.AUTH.LOGIN, credentials);
      const { customToken, user } = response.data.data;

      if (!customToken) {
        throw new Error('No custom token received from server');
      }

      // Store custom token for future refreshes
      localStorage.setItem('customToken', customToken);

      // Sign in with Firebase using custom token
      const idToken = await signInWithCustomTokenAndGetIdToken(customToken);

      // Update API headers
      setAuthToken(idToken);

      return { user, token: idToken };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Check current authentication state
   */
  async checkAuthState() {
    try {
      const user = auth.currentUser;

      if (!user) {
        // Try to restore from stored custom token
        const customToken = localStorage.getItem('customToken');
        if (customToken) {
          const idToken = await signInWithCustomTokenAndGetIdToken(customToken);
          setAuthToken(idToken);

          // Get user data from backend
          const response = await apiMethods.get(ENDPOINTS.USERS.PROFILE);
          return { user: response.data.data.user, token: idToken };
        }
        return null;
      }

      // Get fresh ID token
      const idToken = await user.getIdToken(true);
      setAuthToken(idToken);

      // Get user data from backend
      const response = await apiMethods.get(ENDPOINTS.USERS.PROFILE);
      return { user: response.data.data.user, token: idToken };
    } catch (error) {
      console.error('Auth state check error:', error);
      await this.signOut();
      return null;
    }
  }

  /**
   * Refresh ID token
   */
  async refreshToken() {
    try {
      const user = auth.currentUser;

      if (!user) {
        // Try with stored custom token
        const customToken = localStorage.getItem('customToken');
        if (customToken) {
          const idToken = await signInWithCustomTokenAndGetIdToken(customToken);
          setAuthToken(idToken);
          return idToken;
        }
        throw new Error('No authenticated user');
      }

      // Force token refresh
      const idToken = await user.getIdToken(true);
      setAuthToken(idToken);
      localStorage.setItem('authToken', idToken);

      return idToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.signOut();
      throw error;
    }
  }

  /**
   * Sign out user
   */
  async signOut() {
    try {
      await signOut();
      removeAuthToken();
      localStorage.removeItem('authToken');
      localStorage.removeItem('customToken');
    } catch (error) {
      console.error('Sign out error:', error);
      // Force cleanup even if Firebase signOut fails
      removeAuthToken();
      localStorage.clear();
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updateData) {
    try {
      const response = await apiMethods.patch(ENDPOINTS.AUTH.UPDATE_PROFILE, updateData);
      return response.data.data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!auth.currentUser;
  }

  /**
   * Clean up listener
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;
