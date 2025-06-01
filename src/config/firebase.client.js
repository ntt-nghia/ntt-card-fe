import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithCustomToken,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth';

// Firebase client configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Export auth instance and helper functions
export { auth };

/**
 * Sign in with custom token and get ID token
 * @param {string} customToken - Custom token from backend
 * @returns {Promise<string>} ID token
 */
export const signInWithCustomTokenAndGetIdToken = async (customToken) => {
  try {
    const userCredential = await signInWithCustomToken(auth, customToken);
    const idToken = await userCredential.user.getIdToken();
    return idToken;
  } catch (error) {
    console.error('Error signing in with custom token:', error);
    throw error;
  }
};

/**
 * Get current user's ID token
 * @param {boolean} forceRefresh - Force token refresh
 * @returns {Promise<string|null>} ID token or null if not authenticated
 */
export const getCurrentUserIdToken = async (forceRefresh = false) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
};

/**
 * Check if current user's token is about to expire
 * @param {number} bufferMinutes - Minutes before expiration to consider "about to expire"
 * @returns {Promise<boolean>} True if token is about to expire
 */
export const isTokenAboutToExpire = async (bufferMinutes = 5) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return true;
    }

    const tokenResult = await user.getIdTokenResult();
    const expirationTime = new Date(tokenResult.expirationTime);
    const now = new Date();
    const bufferMs = bufferMinutes * 60 * 1000;

    return expirationTime.getTime() - now.getTime() < bufferMs;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Refresh ID token using stored custom token
 * @returns {Promise<string|null>} New ID token or null if failed
 */
export const refreshIdToken = async () => {
  try {
    const customToken = localStorage.getItem('customToken');
    if (!customToken) {
      return null;
    }

    return await signInWithCustomTokenAndGetIdToken(customToken);
  } catch (error) {
    console.error('Error refreshing token:', error);
    // Remove invalid custom token
    localStorage.removeItem('customToken');
    return null;
  }
};

/**
 * Sign out user
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    localStorage.removeItem('customToken');
    localStorage.removeItem('authToken');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Set up auth state listener
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
