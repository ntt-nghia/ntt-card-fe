import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import toast from 'react-hot-toast';

import { authActions } from './authSlice';
import * as authAPI from '@services/auth';
import { setAuthToken, removeAuthToken } from '@services/api';
import { getStoredToken, storeToken, removeStoredToken } from '@services/storage';

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
  } catch (error) {
    // Token is invalid or expired
    yield call(removeStoredToken);
    yield call(removeAuthToken);
    yield put(authActions.clearAuthState());
  }
}

function* loginSaga(action) {
  try {
    const { email, password } = action.payload;

    const response = yield call(authAPI.login, { email, password });
    const { user, token } = response.data;

    // Store token
    yield call(storeToken, token);
    yield call(setAuthToken, token);

    yield put(authActions.loginSuccess({ user, token }));

    toast.success('Welcome back!');
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Login failed';
    yield put(authActions.loginFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* registerSaga(action) {
  try {
    const response = yield call(authAPI.register, action.payload);
    const { user, token } = response.data;

    // Store token
    yield call(storeToken, token);
    yield call(setAuthToken, token);

    yield put(authActions.registerSuccess({ user, token }));

    toast.success('Account created successfully!');
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Registration failed';
    yield put(authActions.registerFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* logoutSaga() {
  try {
    // Call logout API
    yield call(authAPI.logout);
  } catch (error) {
    // Continue with logout even if API call fails
    console.warn('Logout API call failed:', error);
  } finally {
    // Always clear local storage and state
    yield call(removeStoredToken);
    yield call(removeAuthToken);
    yield put(authActions.logoutSuccess());
    toast.success('Logged out successfully');
  }
}

function* updateProfileSaga(action) {
  try {
    const response = yield call(authAPI.updateProfile, action.payload);

    yield put(authActions.updateProfileSuccess({
      user: response.data.user
    }));

    toast.success('Profile updated successfully');
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Profile update failed';
    yield put(authActions.updateProfileFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* forgotPasswordSaga(action) {
  try {
    yield call(authAPI.forgotPassword, action.payload);

    yield put(authActions.forgotPasswordSuccess());
    toast.success('Password reset email sent');
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to send reset email';
    yield put(authActions.forgotPasswordFailure(errorMessage));
    toast.error(errorMessage);
  }
}

export default function* authSaga() {
  yield takeLatest(authActions.checkAuthState.type, checkAuthStateSaga);
  yield takeEvery(authActions.loginRequest.type, loginSaga);
  yield takeEvery(authActions.registerRequest.type, registerSaga);
  yield takeEvery(authActions.logoutRequest.type, logoutSaga);
  yield takeEvery(authActions.updateProfileRequest.type, updateProfileSaga);
  yield takeEvery(authActions.forgotPasswordRequest.type, forgotPasswordSaga);
}
