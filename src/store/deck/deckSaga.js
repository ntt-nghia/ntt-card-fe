// src/store/deck/deckSaga.js - Updated with circuit breaker protection
import { call, put, takeEvery, takeLatest, select } from 'redux-saga/effects';
import toast from 'react-hot-toast';

import { deckActions } from './deckSlice';
import { deckSelectors } from './deckSelectors';
import * as deckAPI from '@services/deck';
import {
  createProtectedSaga,
  resetCircuitBreaker,
  SagaCircuitBreaker,
} from '@store/middleware/sagaErrorHandler';

function* getAllDecksBaseSaga(action) {
  const { filters, page = 1 } = action.payload || {};
  const currentPage = yield select(deckSelectors.getCurrentPage);
  const actualPage = page || currentPage;

  const response = yield call(deckAPI.getAllDecks, {
    ...filters,
    page: actualPage,
    limit: 12,
  });

  yield put(
    deckActions.getAllDecksSuccess({
      decks: response.data.decks,
      total: response.data.count,
      page: actualPage,
    })
  );

  // Apply filters after loading
  yield put(deckActions.applyFilters());
}

function* getDeckByIdBaseSaga(action) {
  const { deckId } = action.payload;
  const response = yield call(deckAPI.getDeckById, deckId);

  yield put(
    deckActions.getDeckByIdSuccess({
      deck: response.data.deck,
    })
  );
}

function* getDeckCardsBaseSaga(action) {
  const { deckId, filters } = action.payload;
  const response = yield call(deckAPI.getDeckCards, deckId, filters);

  yield put(
    deckActions.getDeckCardsSuccess({
      cards: response.data.cards,
    })
  );
}

function* unlockDeckBaseSaga(action) {
  const { deckId, transactionId, paymentMethod } = action.payload;

  const response = yield call(deckAPI.unlockDeck, deckId, {
    transactionId,
    paymentMethod,
  });

  yield put(
    deckActions.unlockDeckSuccess({
      deckId,
      unlockedDecks: response.data.unlockedDecks,
    })
  );

  toast.success('Deck unlocked successfully!');
}

function* getDeckStatisticsBaseSaga(action) {
  const { deckId } = action.payload;
  const response = yield call(deckAPI.getDeckStatistics, deckId);

  yield put(
    deckActions.getDeckStatisticsSuccess({
      deckId,
      statistics: response.data.statistics,
    })
  );
}

// Protected saga wrappers
function* getAllDecksSaga(action) {
  yield* createProtectedSaga(deckActions.getAllDecksRequest.type, getAllDecksBaseSaga, {
    maxFailures: 3,
    resetTimeout: 30000, // 30 seconds
    maxBackoff: 10000, // 10 seconds max backoff
  })(action);
}

function* getDeckByIdSaga(action) {
  yield* createProtectedSaga(deckActions.getDeckByIdRequest.type, getDeckByIdBaseSaga, {
    maxFailures: 2,
    resetTimeout: 15000,
  })(action);
}

function* getDeckCardsSaga(action) {
  yield* createProtectedSaga(deckActions.getDeckCardsRequest.type, getDeckCardsBaseSaga)(action);
}

function* unlockDeckSaga(action) {
  yield* createProtectedSaga(deckActions.unlockDeckRequest.type, unlockDeckBaseSaga)(action);
}

function* getDeckStatisticsSaga(action) {
  yield* createProtectedSaga(deckActions.getDeckStatisticsRequest.type, getDeckStatisticsBaseSaga, {
    maxFailures: 1, // Don't retry stats as much
    resetTimeout: 60000, // 1 minute
  })(action);
}

// Enhanced error recovery and retry logic
function* handleDeckErrorSaga(action) {
  const { payload, meta } = action;

  // If circuit breaker blocked the request, don't show toast
  if (meta?.circuitBreakerBlocked) {
    console.warn('Deck request blocked by circuit breaker');
    return;
  }

  // Show user-friendly error messages
  if (!meta?.shouldRetry) {
    toast.error(payload);
  } else {
    // For retryable errors, show a more informative message
    console.warn(`Deck service error (retryable): ${payload}`);
  }
}

// Manual retry with circuit breaker reset
function* retryDeckRequestSaga(action) {
  const { actionType, originalPayload } = action.payload;

  // Reset circuit breaker for this action type
  resetCircuitBreaker(actionType);

  // Retry the original request
  yield put({
    type: actionType,
    payload: originalPayload,
  });

  toast.info('Retrying request...');
}

function* loadMoreDecksSaga() {
  const currentPage = yield select(deckSelectors.getCurrentPage);
  const filters = yield select(deckSelectors.getFilters);
  const hasMore = yield select(deckSelectors.getHasMore);

  if (!hasMore) return;

  // Trigger getAllDecks with next page
  yield put(
    deckActions.getAllDecksRequest({
      filters,
      page: currentPage + 1,
    })
  );
}

function* setFiltersSaga(action) {
  // After setting filters, apply them
  yield put(deckActions.applyFilters());

  // Reset pagination and reload first page with new filters
  yield put(deckActions.resetPagination());

  const filters = yield select(deckSelectors.getFilters);
  yield put(deckActions.getAllDecksRequest({ filters, page: 1 }));
}

export default function* deckSaga() {
  yield takeLatest(deckActions.getAllDecksRequest.type, getAllDecksSaga);
  yield takeEvery(deckActions.getDeckByIdRequest.type, getDeckByIdSaga);
  yield takeEvery(deckActions.getDeckCardsRequest.type, getDeckCardsSaga);
  yield takeEvery(deckActions.unlockDeckRequest.type, unlockDeckSaga);
  yield takeEvery(deckActions.getDeckStatisticsRequest.type, getDeckStatisticsSaga);
  yield takeEvery(deckActions.loadMoreDecks.type, loadMoreDecksSaga);
  yield takeEvery(deckActions.setFilters.type, setFiltersSaga);

  // Error handling
  yield takeEvery(
    [
      deckActions.getAllDecksFailure.type,
      deckActions.getDeckByIdFailure.type,
      deckActions.getDeckCardsFailure.type,
      deckActions.getDeckStatisticsFailure.type,
    ],
    handleDeckErrorSaga
  );

  // Manual retry handler
  yield takeEvery('RETRY_DECK_REQUEST', retryDeckRequestSaga);
}
