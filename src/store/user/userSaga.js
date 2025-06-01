// src/store/user/userSaga.js - Enhanced with better error handling and data validation
import { call, put, takeEvery, takeLatest, select } from 'redux-saga/effects';
import toast from 'react-hot-toast';

import { userActions } from './userSlice';
import { userSelectors } from './userSelectors';
import { authSelectors } from '../auth/authSelectors';
import * as userAPI from '@services/user';
import { handleApiError } from '@utils/errorHandler';

function* getUserProfileSaga() {
  try {
    // Check if user is authenticated
    const isAuthenticated = yield select(authSelectors.getIsAuthenticated);
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    const response = yield call(userAPI.getProfile);

    if (!response.data?.user) {
      throw new Error('Invalid profile data received');
    }

    yield put(userActions.getUserProfileSuccess({
      user: response.data.user
    }));

  } catch (error) {
    const appError = yield call(handleApiError, error);
    yield put(userActions.getUserProfileFailure(appError.message));

    // Don't show toast for authentication errors (handled by auth saga)
    if (appError.code !== 'AUTH_ERROR') {
      toast.error(appError.message);
    }

    console.error('Get user profile error:', {
      error: appError.message,
      code: appError.code,
      originalError: error
    });
  }
}

function* updateUserProfileSaga(action) {
  try {
    const updateData = action.payload;

    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('No update data provided');
    }

    // Validate update data
    const validFields = ['displayName', 'avatar', 'language', 'preferences'];
    const invalidFields = Object.keys(updateData).filter(field => !validFields.includes(field));

    if (invalidFields.length > 0) {
      throw new Error(`Invalid fields: ${invalidFields.join(', ')}`);
    }

    const response = yield call(userAPI.updateProfile, updateData);

    if (!response.data?.user) {
      throw new Error('Invalid response data');
    }

    yield put(userActions.updateUserProfileSuccess({
      user: response.data.user
    }));

    toast.success('Profile updated successfully');

  } catch (error) {
    const appError = yield call(handleApiError, error);
    yield put(userActions.updateUserProfileFailure(appError.message));
    toast.error(appError.message);

    console.error('Update user profile error:', {
      error: appError.message,
      updateData: action.payload,
      originalError: error
    });
  }
}

function* updateUserPreferencesSaga(action) {
  try {
    const preferences = action.payload;

    if (!preferences || typeof preferences !== 'object') {
      throw new Error('Invalid preferences data');
    }

    // Validate preferences structure
    const validPreferenceKeys = ['relationshipTypes', 'contentFilters'];
    const invalidKeys = Object.keys(preferences).filter(key => !validPreferenceKeys.includes(key));

    if (invalidKeys.length > 0) {
      console.warn('Unknown preference keys:', invalidKeys);
    }

    const response = yield call(userAPI.updatePreferences, preferences);

    if (!response.data?.user?.preferences) {
      throw new Error('Invalid preferences response');
    }

    yield put(userActions.updateUserPreferencesSuccess({
      preferences: response.data.user.preferences
    }));

    toast.success('Preferences updated successfully');

  } catch (error) {
    const appError = yield call(handleApiError, error);
    yield put(userActions.updateUserPreferencesFailure(appError.message));
    toast.error(appError.message);

    console.error('Update user preferences error:', {
      error: appError.message,
      preferences: action.payload,
      originalError: error
    });
  }
}

function* updateLanguageSaga(action) {
  try {
    const { language } = action.payload;

    if (!language) {
      throw new Error('Language is required');
    }

    // Validate language
    const supportedLanguages = ['en', 'vn'];
    if (!supportedLanguages.includes(language)) {
      throw new Error(`Unsupported language: ${language}. Supported: ${supportedLanguages.join(', ')}`);
    }

    const response = yield call(userAPI.updateLanguage, language);

    if (!response.data?.language) {
      throw new Error('Invalid language response');
    }

    yield put(userActions.updateLanguageSuccess({
      language: response.data.language
    }));

    toast.success('Language updated successfully');

    // Update any cached content or reload if necessary
    yield call(handleLanguageChange, language);

  } catch (error) {
    const appError = yield call(handleApiError, error);
    yield put(userActions.updateLanguageFailure(appError.message));
    toast.error(appError.message);

    console.error('Update language error:', {
      error: appError.message,
      language: action.payload?.language,
      originalError: error
    });
  }
}

function* getUserStatisticsSaga() {
  try {
    const response = yield call(userAPI.getStatistics);

    // Validate statistics data
    const statistics = response.data?.statistics || {};

    // Ensure required fields have default values
    const validatedStats = {
      totalSessions: 0,
      relationshipTypeUsage: {},
      averageSessionDuration: 0,
      favoriteRelationshipType: null,
      gamesPlayed: 0,
      connectionLevelsReached: {},
      ...statistics
    };

    yield put(userActions.getUserStatisticsSuccess({
      statistics: validatedStats
    }));

  } catch (error) {
    const appError = yield call(handleApiError, error);
    yield put(userActions.getUserStatisticsFailure(appError.message));

    // Don't show toast for statistics errors - they're not critical
    console.error('Get user statistics error:', {
      error: appError.message,
      originalError: error
    });
  }
}

function* recordGameCompletionSaga(action) {
  try {
    const gameData = action.payload;

    if (!gameData) {
      throw new Error('Game data is required');
    }

    // Validate game data
    const requiredFields = ['relationshipType', 'connectionLevel'];
    const missingFields = requiredFields.filter(field => !gameData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate values
    if (gameData.connectionLevel < 1 || gameData.connectionLevel > 4) {
      throw new Error('Connection level must be between 1 and 4');
    }

    const validRelationshipTypes = ['friends', 'colleagues', 'new_couples', 'established_couples', 'family'];
    if (!validRelationshipTypes.includes(gameData.relationshipType)) {
      throw new Error(`Invalid relationship type: ${gameData.relationshipType}`);
    }

    const response = yield call(userAPI.recordGameCompletion, gameData);

    if (!response.data?.statistics) {
      throw new Error('Invalid game completion response');
    }

    yield put(userActions.recordGameCompletionSuccess({
      statistics: response.data.statistics
    }));

    toast.success('Game completion recorded');

    // Update cached statistics
    yield call(refreshUserStatistics);

  } catch (error) {
    const appError = yield call(handleApiError, error);
    yield put(userActions.recordGameCompletionFailure(appError.message));
    toast.error(appError.message);

    console.error('Record game completion error:', {
      error: appError.message,
      gameData: action.payload,
      originalError: error
    });
  }
}

function* getUserDecksSaga(action) {
  try {
    const filters = action.payload || {};

    const response = yield call(userAPI.getUserDecks, filters);

    if (!response.data?.decks) {
      throw new Error('Invalid decks response');
    }

    // Validate deck data
    const decks = response.data.decks.map(deck => ({
      id: deck.id || 'unknown',
      name: deck.name || { en: 'Unknown Deck' },
      tier: deck.tier || 'FREE',
      isUnlocked: deck.isUnlocked || false,
      hasAccess: deck.hasAccess || false,
      relationshipType: deck.relationshipType || 'friends',
      ...deck
    }));

    yield put(userActions.getUserDecksSuccess({
      decks
    }));

  } catch (error) {
    const appError = yield call(handleApiError, error);
    yield put(userActions.getUserDecksFailure(appError.message));
    toast.error(appError.message);

    console.error('Get user decks error:', {
      error: appError.message,
      filters: action.payload,
      originalError: error
    });
  }
}

function* getPurchaseHistorySaga() {
  try {
    const response = yield call(userAPI.getPurchaseHistory);

    if (!response.data?.purchases) {
      throw new Error('Invalid purchase history response');
    }

    // Validate and sort purchase history
    const purchases = response.data.purchases
      .filter(purchase => purchase.deckId && purchase.purchaseDate)
      .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

    yield put(userActions.getPurchaseHistorySuccess({
      purchases
    }));

  } catch (error) {
    const appError = yield call(handleApiError, error);
    yield put(userActions.getPurchaseHistoryFailure(appError.message));
    toast.error(appError.message);

    console.error('Get purchase history error:', {
      error: appError.message,
      originalError: error
    });
  }
}

function* deleteAccountSaga() {
  try {
    // Show confirmation (this should be handled in the component)
    const confirmed = yield call(confirmAccountDeletion);

    if (!confirmed) {
      return; // User cancelled
    }

    yield call(userAPI.deleteAccount);

    yield put(userActions.deleteAccountSuccess());

    toast.success('Account deleted successfully');

    // Logout user and clear all data
    yield call(handleAccountDeletion);

  } catch (error) {
    const appError = yield call(handleApiError, error);
    yield put(userActions.deleteAccountFailure(appError.message));
    toast.error(appError.message);

    console.error('Delete account error:', {
      error: appError.message,
      originalError: error
    });
  }
}

// Helper functions
function* handleLanguageChange(newLanguage) {
  try {
    // Clear any language-specific cached data
    if (typeof window !== 'undefined' && window.localStorage) {
      const cacheKeys = ['cachedCards', 'cachedDecks'];
      cacheKeys.forEach(key => {
        localStorage.removeItem(key);
      });
    }

    // Update document language
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLanguage;
    }
  } catch (error) {
    console.warn('Language change handling failed:', error);
  }
}

function* refreshUserStatistics() {
  try {
    yield put(userActions.getUserStatisticsRequest());
  } catch (error) {
    console.warn('Failed to refresh user statistics:', error);
  }
}

function* confirmAccountDeletion() {
  try {
    if (typeof window !== 'undefined') {
      return window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      );
    }
    return false;
  } catch (error) {
    console.warn('Account deletion confirmation failed:', error);
    return false;
  }
}

function* handleAccountDeletion() {
  try {
    // Clear all stored data
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }

    // Redirect to home page
    window.location.href = '/';
  } catch (error) {
    console.warn('Account deletion cleanup failed:', error);
  }
}

// Error recovery saga
function* handleUserError(action) {
  try {
    const error = action.payload;

    // If it's an auth error, try to refresh auth state
    if (error.includes('authentication') || error.includes('token')) {
      const isAuthenticated = yield select(authSelectors.getIsAuthenticated);

      if (!isAuthenticated) {
        // Clear user data if not authenticated
        yield put(userActions.clearUserData());
      }
    }
  } catch (recoveryError) {
    console.error('User error recovery failed:', recoveryError);
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

  // Error recovery watchers
  yield takeEvery([
    userActions.getUserProfileFailure.type,
    userActions.updateUserProfileFailure.type,
    userActions.getUserStatisticsFailure.type
  ], handleUserError);
}
