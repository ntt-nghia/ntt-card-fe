// src/store/admin/adminSaga.js - Redux saga for admin async actions
import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { adminActions } from './adminSlice';
import adminService from '@services/admin';

// Helper function to handle API errors
function* handleApiError(error, action) {
  let errorMessage = 'An unexpected error occurred';

  if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error.message) {
    errorMessage = error.message;
  }

  yield put(action(errorMessage));
}

// Card management sagas
function* getAllCardsSaga(action) {
  try {
    const response = yield call(adminService.getAllCards, action.payload);

    yield put(adminActions.getAllCardsSuccess({
      cards: response.data.data.cards,
      pagination: response.data.data.pagination,
      append: action.payload?.append || false,
    }));
  } catch (error) {
    yield* handleApiError(error, adminActions.getAllCardsFailure);
  }
}

function* getCardSaga(action) {
  try {
    const { cardId } = action.payload;
    const response = yield call(adminService.getCard, cardId);

    yield put(adminActions.getCardSuccess(response.data.data));
  } catch (error) {
    yield* handleApiError(error, adminActions.getCardFailure);
  }
}

function* createCardSaga(action) {
  try {
    const response = yield call(adminService.createCard, action.payload);

    yield put(adminActions.createCardSuccess(response.data.data));
  } catch (error) {
    yield* handleApiError(error, adminActions.createCardFailure);
  }
}

function* updateCardSaga(action) {
  try {
    const { cardId, updates } = action.payload;
    const response = yield call(adminService.updateCard, cardId, updates);

    yield put(adminActions.updateCardSuccess({
      cardId,
      updates: response.data.data,
    }));
  } catch (error) {
    yield* handleApiError(error, adminActions.updateCardFailure);
  }
}

function* deleteCardSaga(action) {
  try {
    const { cardId } = action.payload;
    yield call(adminService.deleteCard, cardId);

    yield put(adminActions.deleteCardSuccess(cardId));
  } catch (error) {
    yield* handleApiError(error, adminActions.deleteCardFailure);
  }
}

function* bulkDeleteCardsSaga(action) {
  try {
    const { cardIds } = action.payload;

    // Delete cards one by one or use bulk delete API if available
    if (adminService.bulkDeleteCards) {
      yield call(adminService.bulkDeleteCards, cardIds);
    } else {
      // Fallback to individual deletions
      for (const cardId of cardIds) {
        yield call(adminService.deleteCard, cardId);
      }
    }

    yield put(adminActions.bulkDeleteCardsSuccess(cardIds));
  } catch (error) {
    yield* handleApiError(error, adminActions.bulkDeleteCardsFailure);
  }
}

// Card generation sagas
function* generateCardsSaga(action) {
  try {
    const response = yield call(adminService.generateCards, action.payload);

    yield put(adminActions.generateCardsSuccess(response.data.data.cards));
  } catch (error) {
    yield* handleApiError(error, adminActions.generateCardsFailure);
  }
}

function* batchGenerateCardsSaga(action) {
  try {
    const { configurations, theta } = action.payload;
    const response = yield call(adminService.batchGenerateCards, configurations, theta);

    yield put(adminActions.batchGenerateCardsSuccess(response.data.data.results));
  } catch (error) {
    yield* handleApiError(error, adminActions.batchGenerateCardsFailure);
  }
}

// Deck management sagas
function* getAllDecksSaga(action) {
  try {
    const response = yield call(adminService.getAllDecks, action.payload);

    yield put(adminActions.getAllDecksSuccess(response.data.data.decks));
  } catch (error) {
    yield* handleApiError(error, adminActions.getAllDecksFailure);
  }
}

function* createDeckSaga(action) {
  try {
    const response = yield call(adminService.createDeck, action.payload);

    yield put(adminActions.createDeckSuccess(response.data.data));

    // Refresh decks list
    yield put(adminActions.getAllDecksRequest());
  } catch (error) {
    yield* handleApiError(error, adminActions.createDeckFailure);
  }
}

function* updateDeckSaga(action) {
  try {
    const { deckId, updates } = action.payload;
    const response = yield call(adminService.updateDeck, deckId, updates);

    yield put(adminActions.updateDeckSuccess({
      deckId,
      updates: response.data.data,
    }));
  } catch (error) {
    yield* handleApiError(error, adminActions.updateDeckFailure);
  }
}

function* deleteDeckSaga(action) {
  try {
    const { deckId } = action.payload;
    yield call(adminService.deleteDeck, deckId);

    yield put(adminActions.deleteDeckSuccess(deckId));
  } catch (error) {
    yield* handleApiError(error, adminActions.deleteDeckFailure);
  }
}

// Analytics sagas
function* getAnalyticsSaga(action) {
  try {
    const response = yield call(adminService.getAnalytics, action.payload);

    yield put(adminActions.getAnalyticsSuccess(response.data.data));
  } catch (error) {
    yield* handleApiError(error, adminActions.getAnalyticsFailure);
  }
}

function* getGenerationAnalyticsSaga(action) {
  try {
    const response = yield call(adminService.getGenerationAnalytics);

    yield put(adminActions.getGenerationAnalyticsSuccess(response.data.data));
  } catch (error) {
    yield* handleApiError(error, adminActions.getGenerationAnalyticsFailure);
  }
}

function* getDeckAnalyticsSaga(action) {
  try {
    const { deckId, filters } = action.payload;
    const response = yield call(adminService.getDeckAnalytics, deckId, filters);

    yield put(adminActions.getDeckAnalyticsSuccess({
      deckId,
      analytics: response.data.data,
    }));
  } catch (error) {
    yield* handleApiError(error, adminActions.getDeckAnalyticsFailure);
  }
}

// User management sagas
function* getAllUsersSaga(action) {
  try {
    const response = yield call(adminService.getAllUsers, action.payload);

    yield put(adminActions.getAllUsersSuccess(response.data.data.users));
  } catch (error) {
    yield* handleApiError(error, adminActions.getAllUsersFailure);
  }
}

function* updateUserSaga(action) {
  try {
    const { userId, updates } = action.payload;
    const response = yield call(adminService.updateUser, userId, updates);

    yield put(adminActions.updateUserSuccess({
      userId,
      updates: response.data.data,
    }));
  } catch (error) {
    yield* handleApiError(error, adminActions.updateUserFailure);
  }
}

function* deleteUserSaga(action) {
  try {
    const { userId } = action.payload;
    yield call(adminService.deleteUser, userId);

    yield put(adminActions.deleteUserSuccess(userId));
  } catch (error) {
    yield* handleApiError(error, adminActions.deleteUserFailure);
  }
}

// Import/Export sagas
function* exportCardsSaga(action) {
  try {
    const response = yield call(adminService.exportCards, action.payload);

    // Handle file download
    const blob = new Blob([response.data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cards-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    yield put(adminActions.exportCardsSuccess());
  } catch (error) {
    yield* handleApiError(error, adminActions.exportCardsFailure);
  }
}

function* importCardsSaga(action) {
  try {
    const { file, options } = action.payload;
    const response = yield call(adminService.importCards, file, options);

    yield put(adminActions.importCardsSuccess(response.data.data));

    // Refresh cards list
    yield put(adminActions.getAllCardsRequest());
  } catch (error) {
    yield* handleApiError(error, adminActions.importCardsFailure);
  }
}

// Watcher saga
export default function* adminSaga() {
  // Card management watchers
  yield takeLatest(adminActions.getAllCardsRequest.type, getAllCardsSaga);
  yield takeLatest(adminActions.getCardRequest.type, getCardSaga);
  yield takeEvery(adminActions.createCardRequest.type, createCardSaga);
  yield takeEvery(adminActions.updateCardRequest.type, updateCardSaga);
  yield takeEvery(adminActions.deleteCardRequest.type, deleteCardSaga);
  yield takeEvery(adminActions.bulkDeleteCardsRequest.type, bulkDeleteCardsSaga);

  // Card generation watchers
  yield takeLatest(adminActions.generateCardsRequest.type, generateCardsSaga);
  yield takeLatest(adminActions.batchGenerateCardsRequest.type, batchGenerateCardsSaga);

  // Deck management watchers
  yield takeLatest(adminActions.getAllDecksRequest.type, getAllDecksSaga);

  // Analytics watchers
  yield takeLatest(adminActions.getAnalyticsRequest.type, getAnalyticsSaga);
  yield takeLatest(adminActions.getGenerationAnalyticsRequest.type, getGenerationAnalyticsSaga);

  // User management watchers
  yield takeLatest(adminActions.getAllUsersRequest.type, getAllUsersSaga);
}
