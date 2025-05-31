import { call, put, takeEvery, takeLatest, delay } from 'redux-saga/effects';
import toast from 'react-hot-toast';

import { authActions } from './authSlice';
import { userActions } from '../user/userSlice';
import * as authAPI from '../../services/auth';
import { setAuthToken, removeAuthToken } from '@services/api';

/**
 * Storage utilities for token management
 */
const getStoredToken = () => {
  try {
    return localStorage.getItem('authToken');
  } catch (error) {
    console.warn('Failed to get stored token:', error);
    return null;
  }
};

const storeToken = (token) => {
  try {
    localStorage.setItem('authToken', token);
  } catch (error) {
    console.warn('Failed to store token:', error);
  }
};

const removeStoredToken = () => {
  try {
    localStorage.removeItem('authToken');
  } catch (error) {
    console.warn('Failed to remove stored token:', error);
  }
};

/**
 * Check authentication state on app startup
 */
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

    // Load user profile data into user store
    yield put(userActions.getUserProfileSuccess({
      user: response.data.user
    }));

  } catch (error) {
    // Token is invalid or expired - clean up
    yield call(handleAuthFailure, error);
    yield put(authActions.clearAuthState());
  }
}

/**
 * Handle user login
 */
function* loginSaga(action) {
  try {
    const { email, password } = action.payload;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const response = yield call(authAPI.login, { email, password });

    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    const { user, token } = response.data;

    if (!user || !token) {
      throw new Error('Invalid login response');
    }

    // Store token and set in API headers
    yield call(storeToken, token);
    yield call(setAuthToken, token);

    yield put(authActions.loginSuccess({ user, token }));

    // Load user data into user store
    yield put(userActions.getUserProfileSuccess({ user }));

    toast.success(`Welcome back, ${user.displayName || user.email}!`);

  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Login failed. Please check your credentials.');
    yield put(authActions.loginFailure(errorMessage));

    // Clean up any stored tokens on login failure
    yield call(removeStoredToken);
    yield call(removeAuthToken);

    toast.error(errorMessage);
  }
}

/**
 * Handle user registration
 */
function* registerSaga(action) {
  try {
    const userData = action.payload;

    if (!userData.email || !userData.password || !userData.displayName) {
      throw new Error('Required fields are missing');
    }

    // Validate age requirement
    if (userData.birthDate) {
      const birthDate = new Date(userData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 18) {
        throw new Error('You must be at least 18 years old to register');
      }
    }

    const response = yield call(authAPI.register, userData);

    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    const { user, token } = response.data;

    if (!user || !token) {
      throw new Error('Invalid registration response');
    }

    // Store token and set in API headers
    yield call(storeToken, token);
    yield call(setAuthToken, token);

    yield put(authActions.registerSuccess({ user, token }));

    // Load user data into user store
    yield put(userActions.getUserProfileSuccess({ user }));

    toast.success(`Welcome to Connection Game, ${user.displayName}!`);

  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Registration failed. Please try again.');
    yield put(authActions.registerFailure(errorMessage));

    // Clean up any stored tokens on registration failure
    yield call(removeStoredToken);
    yield call(removeAuthToken);

    toast.error(errorMessage);
  }
}

/**
 * Handle user logout
 */
function* logoutSaga() {
  try {
    // Call logout API (non-blocking)
    yield call(authAPI.logout);
  } catch (error) {
    // Continue with logout even if API call fails
    console.warn('Logout API call failed:', error);
  } finally {
    // Always clear local storage and state
    yield call(removeStoredToken);
    yield call(removeAuthToken);

    // Clear user data from all stores
    yield put(authActions.logoutSuccess());
    yield put(userActions.clearUserData());

    toast.success('Logged out successfully');
  }
}

/**
 * Handle profile updates
 */
function* updateProfileSaga(action) {
  try {
    const response = yield call(authAPI.updateProfile, action.payload);

    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    const updatedUser = response.data.user;

    yield put(authActions.updateProfileSuccess({
      user: updatedUser
    }));

    // Update user data in user store as well
    yield put(userActions.updateUserProfileSuccess({
      user: updatedUser
    }));

    toast.success('Profile updated successfully');

  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Profile update failed');
    yield put(authActions.updateProfileFailure(errorMessage));
    toast.error(errorMessage);
  }
}

/**
 * Handle forgot password
 */
function* forgotPasswordSaga(action) {
  try {
    const { email } = action.payload;

    if (!email) {
      throw new Error('Email address is required');
    }

    yield call(authAPI.forgotPassword, email);

    yield put(authActions.forgotPasswordSuccess());
    toast.success('Password reset email sent. Please check your inbox.');

  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Failed to send password reset email');
    yield put(authActions.forgotPasswordFailure(errorMessage));
    toast.error(errorMessage);
  }
}

/**
 * Handle token refresh (automatic retry on 401 errors)
 */
function* refreshTokenSaga() {
  try {
    // Check if we have a stored token
    const token = yield call(getStoredToken);

    if (!token) {
      yield put(authActions.clearAuthState());
      return;
    }

    // Try to refresh by getting user profile
    yield call(setAuthToken, token);
    const response = yield call(authAPI.getProfile);

    yield put(authActions.setAuthState({
      user: response.data.user,
      token
    }));

  } catch (error) {
    // Refresh failed - clear auth state
    yield call(handleAuthFailure, error);
    yield put(authActions.clearAuthState());
  }
}

/**
 * Handle authentication failures with proper cleanup
 */
function* handleAuthFailure(error) {
  try {
    yield call(removeStoredToken);
    yield call(removeAuthToken);

    // Clear user data
    yield put(userActions.clearUserData());

    // Don't show error toast for token expiration (natural flow)
    const isTokenExpired = error?.response?.status === 401;
    if (!isTokenExpired) {
      console.error('Authentication error:', error);
    }

  } catch (cleanupError) {
    console.error('Failed to cleanup after auth failure:', cleanupError);
  }
}

/**
 * Auto-retry authentication on network failures
 */
function* autoRetryAuthSaga(action) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      yield call(checkAuthStateSaga);
      return; // Success - exit retry loop
    } catch (error) {
      retryCount++;

      if (retryCount < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delayMs = Math.pow(2, retryCount) * 1000;
        yield delay(delayMs);
      }
    }
  }

  // All retries failed
  yield put(authActions.clearAuthState());
}

/**
 * Extract error message from different error types
 */
const getErrorMessage = (error, defaultMessage) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return defaultMessage;
};

/**
 * Root auth saga
 */
export default function* authSaga() {
  yield takeLatest(authActions.checkAuthState.type, checkAuthStateSaga);
  yield takeEvery(authActions.loginRequest.type, loginSaga);
  yield takeEvery(authActions.registerRequest.type, registerSaga);
  yield takeEvery(authActions.logoutRequest.type, logoutSaga);
  yield takeEvery(authActions.updateProfileRequest.type, updateProfileSaga);
  yield takeEvery(authActions.forgotPasswordRequest.type, forgotPasswordSaga);

  // Additional error handling sagas
  yield takeLatest('AUTH_REFRESH_TOKEN', refreshTokenSaga);
  yield takeLatest('AUTH_AUTO_RETRY', autoRetryAuthSaga);
}
