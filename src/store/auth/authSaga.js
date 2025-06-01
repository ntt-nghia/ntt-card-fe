// src/store/auth/authSaga.js - Fixed with better token management and error handling
import { call, put, takeEvery, takeLatest, select, delay } from 'redux-saga/effects';
import toast from 'react-hot-toast';

import { authActions } from './authSlice';
import { authSelectors } from './authSelectors';
import { userActions } from '../user/userSlice';
import * as authAPI from '@services/auth';
import { setAuthToken, removeAuthToken } from '@services/api';
import { getStoredToken, storeToken, removeStoredToken } from '@services/storage';

// Token refresh interval (15 minutes)
const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000;

function* checkAuthStateSaga() {
  try {
    const token = yield call(getStoredToken);

    if (!token) {
      yield put(authActions.clearAuthState());
      return;
    }

    // Set token in API headers
    yield call(setAuthToken, token);

    // Verify token by getting user profile
    const response = yield call(authAPI.getProfile);

    yield put(authActions.setAuthState({
      user: response.data.user,
      token
    }));

    // Start token refresh cycle
    yield call(startTokenRefreshCycle);

  } catch (error) {
    console.warn('Auth check failed:', error.message);

    // Token is invalid or expired
    yield call(removeStoredToken);
    yield call(removeAuthToken);
    yield put(authActions.clearAuthState());
  }
}

function* loginSaga(action) {
  try {
    const { email, password } = action.payload;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const response = yield call(authAPI.login, { email, password });
    const { user, token } = response.data;

    if (!token || !user) {
      throw new Error('Invalid response from server');
    }

    // Store token and set in API headers
    yield call(storeToken, token);
    yield call(setAuthToken, token);

    yield put(authActions.loginSuccess({ user, token }));

    // Load user profile data
    yield put(userActions.getUserProfileRequest());

    // Start token refresh cycle
    yield call(startTokenRefreshCycle);

    toast.success(`Welcome back, ${user.displayName || user.email}!`);

    // Navigate to dashboard
    yield call(navigateToDashboard);

  } catch (error) {
    const errorMessage = error.response?.data?.message ||
                        error.message ||
                        'Login failed';

    yield put(authActions.loginFailure(errorMessage));
    toast.error(errorMessage);

    console.error('Login error:', {
      error: errorMessage,
      email: action.payload?.email,
      response: error.response?.data
    });
  }
}

function* registerSaga(action) {
  try {
    const userData = action.payload;

    // Validate required fields
    const requiredFields = ['email', 'password', 'displayName', 'birthDate'];
    const missingFields = requiredFields.filter(field => !userData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const response = yield call(authAPI.register, userData);
    const { user, token } = response.data;

    if (!token || !user) {
      throw new Error('Invalid response from server');
    }

    // Store token and set in API headers
    yield call(storeToken, token);
    yield call(setAuthToken, token);

    yield put(authActions.registerSuccess({ user, token }));

    // Initialize user profile data
    yield put(userActions.getUserProfileRequest());

    // Start token refresh cycle
    yield call(startTokenRefreshCycle);

    toast.success(`Welcome to Connection Game, ${user.displayName}!`);

    // Navigate to dashboard
    yield call(navigateToDashboard);

  } catch (error) {
    const errorMessage = error.response?.data?.message ||
                        error.message ||
                        'Registration failed';

    yield put(authActions.registerFailure(errorMessage));
    toast.error(errorMessage);

    console.error('Registration error:', {
      error: errorMessage,
      email: action.payload?.email,
      response: error.response?.data
    });
  }
}

function* logoutSaga() {
  try {
    // Stop token refresh
    yield call(stopTokenRefreshCycle);

    // Call logout API (continue even if it fails)
    try {
      yield call(authAPI.logout);
    } catch (apiError) {
      console.warn('Logout API call failed:', apiError.message);
    }

    // Clear user data
    yield put(userActions.clearUserData());

  } catch (error) {
    console.warn('Logout process error:', error.message);
  } finally {
    // Always clear local storage and state
    yield call(removeStoredToken);
    yield call(removeAuthToken);
    yield put(authActions.logoutSuccess());

    toast.success('Logged out successfully');

    // Navigate to home
    yield call(navigateToHome);
  }
}

function* updateProfileSaga(action) {
  try {
    const updateData = action.payload;

    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('No update data provided');
    }

    const response = yield call(authAPI.updateProfile, updateData);

    yield put(authActions.updateProfileSuccess({
      user: response.data.user
    }));

    // Also update user profile store
    yield put(userActions.updateUserProfileSuccess({
      user: response.data.user
    }));

    toast.success('Profile updated successfully');

  } catch (error) {
    const errorMessage = error.response?.data?.message ||
                        error.message ||
                        'Profile update failed';

    yield put(authActions.updateProfileFailure(errorMessage));
    toast.error(errorMessage);

    console.error('Profile update error:', {
      error: errorMessage,
      updateData: action.payload,
      response: error.response?.data
    });
  }
}

function* forgotPasswordSaga(action) {
  try {
    const { email } = action.payload;

    if (!email) {
      throw new Error('Email is required');
    }

    yield call(authAPI.forgotPassword, email);

    yield put(authActions.forgotPasswordSuccess());
    toast.success('Password reset email sent. Check your inbox!');

  } catch (error) {
    const errorMessage = error.response?.data?.message ||
                        error.message ||
                        'Failed to send reset email';

    yield put(authActions.forgotPasswordFailure(errorMessage));
    toast.error(errorMessage);

    console.error('Forgot password error:', {
      error: errorMessage,
      email: action.payload?.email,
      response: error.response?.data
    });
  }
}

// Token refresh management
let refreshTask = null;

function* startTokenRefreshCycle() {
  try {
    // Cancel existing refresh task
    if (refreshTask) {
      refreshTask.cancel();
    }

    // Start new refresh cycle
    refreshTask = yield call(tokenRefreshLoop);
  } catch (error) {
    console.error('Token refresh cycle error:', error);
  }
}

function* stopTokenRefreshCycle() {
  try {
    if (refreshTask) {
      refreshTask.cancel();
      refreshTask = null;
    }
  } catch (error) {
    console.error('Stop token refresh error:', error);
  }
}

function* tokenRefreshLoop() {
  while (true) {
    try {
      // Wait for refresh interval
      yield delay(TOKEN_REFRESH_INTERVAL);

      // Check if still authenticated
      const isAuthenticated = yield select(authSelectors.getIsAuthenticated);
      if (!isAuthenticated) {
        break;
      }

      // Refresh token by getting profile
      const response = yield call(authAPI.getProfile);

      // Update user data
      yield put(authActions.updateProfileSuccess({
        user: response.data.user
      }));

    } catch (error) {
      console.warn('Token refresh failed:', error.message);

      // If refresh fails, logout user
      yield put(authActions.logoutRequest());
      break;
    }
  }
}

// Navigation helpers
function* navigateToDashboard() {
  try {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.warn('Navigation to dashboard failed:', error);
  }
}

function* navigateToHome() {
  try {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  } catch (error) {
    console.warn('Navigation to home failed:', error);
  }
}

// Recovery saga for auth errors
function* handleAuthError(action) {
  try {
    const error = action.payload;

    // If it's a token-related error, try to refresh
    if (error.includes('token') || error.includes('unauthorized')) {
      const isAuthenticated = yield select(authSelectors.getIsAuthenticated);

      if (isAuthenticated) {
        // Try to refresh auth state
        yield put(authActions.checkAuthState());
      }
    }
  } catch (recoveryError) {
    console.error('Auth error recovery failed:', recoveryError);
  }
}

export default function* authSaga() {
  yield takeLatest(authActions.checkAuthState.type, checkAuthStateSaga);
  yield takeEvery(authActions.loginRequest.type, loginSaga);
  yield takeEvery(authActions.registerRequest.type, registerSaga);
  yield takeEvery(authActions.logoutRequest.type, logoutSaga);
  yield takeEvery(authActions.updateProfileRequest.type, updateProfileSaga);
  yield takeEvery(authActions.forgotPasswordRequest.type, forgotPasswordSaga);

  // Error recovery watchers
  yield takeEvery([
    authActions.loginFailure.type,
    authActions.updateProfileFailure.type
  ], handleAuthError);
}
