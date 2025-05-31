import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import toast from 'react-hot-toast';

import { userActions } from './userSlice';
import * as userAPI from '@services/user';

function* getUserProfileSaga() {
  try {
    const response = yield call(userAPI.getProfile);

    yield put(userActions.getUserProfileSuccess({
      user: response.data.user
    }));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to get profile';
    yield put(userActions.getUserProfileFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* updateUserProfileSaga(action) {
  try {
    const response = yield call(userAPI.updateProfile, action.payload);

    yield put(userActions.updateUserProfileSuccess({
      user: response.data.user
    }));

    toast.success('Profile updated successfully');
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update profile';
    yield put(userActions.updateUserProfileFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* updateUserPreferencesSaga(action) {
  try {
    const response = yield call(userAPI.updatePreferences, action.payload);

    yield put(userActions.updateUserPreferencesSuccess({
      preferences: response.data.user.preferences
    }));

    toast.success('Preferences updated successfully');
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update preferences';
    yield put(userActions.updateUserPreferencesFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* updateLanguageSaga(action) {
  try {
    const response = yield call(userAPI.updateLanguage, action.payload);

    yield put(userActions.updateLanguageSuccess({
      language: response.data.language
    }));

    toast.success('Language updated successfully');
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update language';
    yield put(userActions.updateLanguageFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getUserStatisticsSaga() {
  try {
    const response = yield call(userAPI.getStatistics);

    yield put(userActions.getUserStatisticsSuccess({
      statistics: response.data.statistics
    }));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to get statistics';
    yield put(userActions.getUserStatisticsFailure(errorMessage));
    console.error('Statistics error:', errorMessage);
  }
}

function* recordGameCompletionSaga(action) {
  try {
    const response = yield call(userAPI.recordGameCompletion, action.payload);

    yield put(userActions.recordGameCompletionSuccess({
      statistics: response.data.statistics
    }));

    toast.success('Game completion recorded');
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to record game completion';
    yield put(userActions.recordGameCompletionFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getUserDecksSaga(action) {
  try {
    const response = yield call(userAPI.getUserDecks, action.payload);

    yield put(userActions.getUserDecksSuccess({
      decks: response.data.decks
    }));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to get user decks';
    yield put(userActions.getUserDecksFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getPurchaseHistorySaga() {
  try {
    const response = yield call(userAPI.getPurchaseHistory);

    yield put(userActions.getPurchaseHistorySuccess({
      purchases: response.data.purchases
    }));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to get purchase history';
    yield put(userActions.getPurchaseHistoryFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* deleteAccountSaga() {
  try {
    yield call(userAPI.deleteAccount);

    yield put(userActions.deleteAccountSuccess());

    toast.success('Account deleted successfully');
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to delete account';
    yield put(userActions.deleteAccountFailure(errorMessage));
    toast.error(errorMessage);
  }
}

export default function* userSaga() {
  yield takeLatest(userActions.getUserProfileRequest.type, getUserProfileSaga);
  yield takeEvery(userActions.updateUserProfileRequest.type, updateUserProfileSaga);
  yield takeEvery(userActions.updateUserPreferencesRequest.type, updateUserPreferencesSaga);
  yield takeEvery(userActions.updateLanguageRequest.type, updateLanguageSaga);
  yield takeLatest(userActions.getUserStatisticsRequest.type, getUserStatisticsSaga);
  yield takeEvery(userActions.recordGameCompletionRequest.type, recordGameCompletionSaga);
  yield takeLatest(userActions.getUserDecksRequest.type, getUserDecksSaga);
  yield takeLatest(userActions.getPurchaseHistoryRequest.type, getPurchaseHistorySaga);
  yield takeEvery(userActions.deleteAccountRequest.type, deleteAccountSaga);
}
