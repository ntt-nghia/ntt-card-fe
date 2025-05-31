import { call, put, takeEvery, takeLatest, select } from 'redux-saga/effects';
import toast from 'react-hot-toast';

import { deckActions } from './deckSlice';
import { deckSelectors } from './deckSelectors';
import * as deckAPI from '@services/deck';

function* getAllDecksSaga(action) {
  try {
    const { filters, page = 1 } = action.payload || {};
    const currentPage = yield select(deckSelectors.getCurrentPage);
    const actualPage = page || currentPage;

    const response = yield call(deckAPI.getAllDecks, {
      ...filters,
      page: actualPage,
      limit: 12
    });

    yield put(deckActions.getAllDecksSuccess({
      decks: response.data.decks,
      total: response.data.count,
      page: actualPage
    }));

    // Apply filters after loading
    yield put(deckActions.applyFilters());
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to get decks';
    yield put(deckActions.getAllDecksFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getDeckByIdSaga(action) {
  try {
    const { deckId } = action.payload;
    const response = yield call(deckAPI.getDeckById, deckId);

    yield put(deckActions.getDeckByIdSuccess({
      deck: response.data.deck
    }));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to get deck';
    yield put(deckActions.getDeckByIdFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getDeckCardsSaga(action) {
  try {
    const { deckId, filters } = action.payload;
    const response = yield call(deckAPI.getDeckCards, deckId, filters);

    yield put(deckActions.getDeckCardsSuccess({
      cards: response.data.cards
    }));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to get deck cards';
    yield put(deckActions.getDeckCardsFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* unlockDeckSaga(action) {
  try {
    const { deckId, transactionId, paymentMethod } = action.payload;

    const response = yield call(deckAPI.unlockDeck, deckId, {
      transactionId,
      paymentMethod
    });

    yield put(deckActions.unlockDeckSuccess({
      deckId,
      unlockedDecks: response.data.unlockedDecks
    }));

    toast.success('Deck unlocked successfully!');
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to unlock deck';
    yield put(deckActions.unlockDeckFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getDeckStatisticsSaga(action) {
  try {
    const { deckId } = action.payload;
    const response = yield call(deckAPI.getDeckStatistics, deckId);

    yield put(deckActions.getDeckStatisticsSuccess({
      deckId,
      statistics: response.data.statistics
    }));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to get deck statistics';
    yield put(deckActions.getDeckStatisticsFailure(errorMessage));
    // Don't show toast for statistics errors as they're not critical
    console.error('Deck statistics error:', errorMessage);
  }
}

function* loadMoreDecksSaga() {
  try {
    const currentPage = yield select(deckSelectors.getCurrentPage);
    const filters = yield select(deckSelectors.getFilters);
    const hasMore = yield select(deckSelectors.getHasMore);

    if (!hasMore) return;

    // Trigger getAllDecks with next page
    yield put(deckActions.getAllDecksRequest({
      filters,
      page: currentPage + 1
    }));
  } catch (error) {
    console.error('Load more decks error:', error);
  }
}

function* setFiltersSaga(action) {
  try {
    // After setting filters, apply them
    yield put(deckActions.applyFilters());

    // Reset pagination and reload first page with new filters
    yield put(deckActions.resetPagination());

    const filters = yield select(deckSelectors.getFilters);
    yield put(deckActions.getAllDecksRequest({ filters, page: 1 }));
  } catch (error) {
    console.error('Set filters error:', error);
  }
}

export default function* deckSaga() {
  yield takeLatest(deckActions.getAllDecksRequest.type, getAllDecksSaga);
  yield takeEvery(deckActions.getDeckByIdRequest.type, getDeckByIdSaga);
  yield takeEvery(deckActions.getDeckCardsRequest.type, getDeckCardsSaga);
  yield takeEvery(deckActions.unlockDeckRequest.type, unlockDeckSaga);
  yield takeEvery(deckActions.getDeckStatisticsRequest.type, getDeckStatisticsSaga);
  yield takeEvery(deckActions.loadMoreDecks.type, loadMoreDecksSaga);
  yield takeEvery(deckActions.setFilters.type, setFiltersSaga);
}
