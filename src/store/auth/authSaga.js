import { call, put, takeEvery, takeLatest, select, delay, fork, cancel } from 'redux-saga/effects';
import toast from 'react-hot-toast';

import { authActions } from './authSlice';
import { authSelectors } from './authSelectors';
import { userActions } from '../user/userSlice';
import firebaseAuthService from '@services/firebaseAuth';

// Token refresh task reference
let tokenRefreshTask = null;

function* checkAuthStateSaga() {
  try {
    const authState = yield call([firebaseAuthService, 'checkAuthState']);

    if (authState) {
      const { user, token } = authState;

      yield put(authActions.setAuthState({ user, token }));

      // Load user profile data
      yield put(userActions.getUserProfileRequest());

      // Start token refresh monitoring
      yield fork(tokenRefreshMonitor);
    } else {
      yield put(authActions.clearAuthState());
    }
  } catch (error) {
    console.warn('Auth check failed:', error.message);
    yield put(authActions.clearAuthState());
  }
}

function* loginSaga(action) {
  try {
    const { email, password } = action.payload;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const result = yield call([firebaseAuthService, 'login'], { email, password });
    const { user, token } = result;

    if (!token || !user) {
      throw new Error('Invalid response from authentication service');
    }

    yield put(authActions.loginSuccess({ user, token }));

    // Load user profile data
    yield put(userActions.getUserProfileRequest());

    // Start token refresh monitoring
    yield fork(tokenRefreshMonitor);

    toast.success(`Welcome back, ${user.displayName || user.email}!`);

    // Navigate to dashboard
    yield call(navigateToDashboard);
  } catch (error) {
    const errorMessage = error.message || 'Login failed';
    yield put(authActions.loginFailure(errorMessage));
    toast.error(errorMessage);

    console.error('Login error:', {
      error: errorMessage,
      email: action.payload?.email,
    });
  }
}

function* registerSaga(action) {
  try {
    const userData = action.payload;

    // Validate required fields
    const requiredFields = ['email', 'password', 'displayName', 'birthDate'];
    const missingFields = requiredFields.filter((field) => !userData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const result = yield call([firebaseAuthService, 'register'], userData);
    const { user, token } = result;

    if (!token || !user) {
      throw new Error('Invalid response from registration service');
    }

    yield put(authActions.registerSuccess({ user, token }));

    // Load user profile data
    yield put(userActions.getUserProfileRequest());

    // Start token refresh monitoring
    yield fork(tokenRefreshMonitor);

    toast.success(`Welcome to Connection Game, ${user.displayName}!`);

    // Navigate to dashboard
    yield call(navigateToDashboard);
  } catch (error) {
    const errorMessage = error.message || 'Registration failed';
    yield put(authActions.registerFailure(errorMessage));
    toast.error(errorMessage);

    console.error('Registration error:', {
      error: errorMessage,
      email: action.payload?.email,
    });
  }
}

function* logoutSaga() {
  try {
    // Cancel token refresh monitoring
    if (tokenRefreshTask) {
      yield cancel(tokenRefreshTask);
      tokenRefreshTask = null;
    }

    // Call Firebase sign out
    yield call([firebaseAuthService, 'signOut']);

    // Clear user data
    yield put(userActions.clearUserData());
    yield put(authActions.logoutSuccess());

    toast.success('Logged out successfully');

    // Navigate to home
    yield call(navigateToHome);
  } catch (error) {
    console.warn('Logout error:', error.message);

    // Force logout even if Firebase call fails
    yield put(authActions.logoutSuccess());
    yield put(userActions.clearUserData());

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

    const result = yield call([firebaseAuthService, 'updateProfile'], updateData);

    yield put(
      authActions.updateProfileSuccess({
        user: result.user,
      })
    );

    // Also update user profile store
    yield put(
      userActions.updateUserProfileSuccess({
        user: result.user,
      })
    );

    toast.success('Profile updated successfully');
  } catch (error) {
    const errorMessage = error.message || 'Profile update failed';
    yield put(authActions.updateProfileFailure(errorMessage));
    toast.error(errorMessage);

    console.error('Profile update error:', {
      error: errorMessage,
      updateData: action.payload,
    });
  }
}

function* forgotPasswordSaga(action) {
  try {
    const { email } = action.payload;

    if (!email) {
      throw new Error('Email is required');
    }

    // Call backend forgot password endpoint
    const response = yield call(fetch, '/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = yield call([response, 'json']);
      throw new Error(errorData.message || 'Failed to send reset email');
    }

    yield put(authActions.forgotPasswordSuccess());
    toast.success('Password reset email sent. Check your inbox!');
  } catch (error) {
    const errorMessage = error.message || 'Failed to send reset email';
    yield put(authActions.forgotPasswordFailure(errorMessage));
    toast.error(errorMessage);

    console.error('Forgot password error:', {
      error: errorMessage,
      email: action.payload?.email,
    });
  }
}

// Token refresh monitoring
function* tokenRefreshMonitor() {
  try {
    while (true) {
      // Check every 10 minutes
      yield delay(10 * 60 * 1000);

      // Check if still authenticated
      const isAuthenticated = yield select(authSelectors.getIsAuthenticated);
      if (!isAuthenticated) {
        break;
      }

      try {
        // Refresh ID token
        const newToken = yield call([firebaseAuthService, 'refreshToken']);

        // Update token in state if needed
        const currentToken = yield select(authSelectors.getToken);
        if (newToken !== currentToken) {
          const user = yield select(authSelectors.getUser);
          yield put(authActions.setAuthState({ user, token: newToken }));
        }
      } catch (refreshError) {
        console.warn('Token refresh failed:', refreshError.message);

        // If refresh fails, logout user
        yield put(authActions.logoutRequest());
        break;
      }
    }
  } catch (error) {
    console.error('Token refresh monitor error:', error);
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

// Error recovery saga
function* handleAuthError(action) {
  try {
    const error = action.payload;

    // If it's a token-related error, try to refresh
    if (error.includes('token') || error.includes('unauthorized') || error.includes('expired')) {
      const isAuthenticated = yield select(authSelectors.getIsAuthenticated);

      if (isAuthenticated) {
        console.log('Attempting auth recovery...');

        try {
          // Try to refresh token
          yield call([firebaseAuthService, 'refreshToken']);
        } catch (refreshError) {
          console.warn('Auth recovery failed:', refreshError.message);
          // Force logout if refresh fails
          yield put(authActions.logoutRequest());
        }
      }
    }
  } catch (recoveryError) {
    console.error('Auth error recovery failed:', recoveryError);
  }
}

// Cleanup saga
function* cleanupSaga() {
  try {
    if (tokenRefreshTask) {
      yield cancel(tokenRefreshTask);
      tokenRefreshTask = null;
    }
  } catch (error) {
    console.error('Cleanup error:', error);
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
  yield takeEvery(
    [authActions.loginFailure.type, authActions.updateProfileFailure.type],
    handleAuthError
  );

  // Cleanup on saga cancellation
  yield takeEvery('@@cancel', cleanupSaga);
}
