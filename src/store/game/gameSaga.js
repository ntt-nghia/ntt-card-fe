import { call, put, takeEvery, takeLatest, select } from 'redux-saga/effects';
import toast from 'react-hot-toast';

import { gameActions } from './gameSlice';
import { gameSelectors } from './gameSelectors';
import * as gameAPI from '@services/game';

// Navigation helper - works without connected-react-router too
function* navigateToGame(sessionId) {
  try {
    // Use window.location for navigation if connected-react-router isn't available
    if (typeof window !== 'undefined') {
      window.location.href = `/game/${sessionId}`;
    }
  } catch (error) {
    console.warn('Navigation failed:', error);
  }
}

function* startSessionSaga(action) {
  try {
    const response = yield call(gameAPI.startSession, action.payload);
    const { session } = response.data;

    yield put(gameActions.startSessionSuccess({
      session
    }));

    // Navigate to game page after successful session creation
    if (session.id) {
      yield call(navigateToGame, session.id);
    }

    toast.success('Game session started!');
  } catch (error) {
    const errorMessage = error.response?.data?.message ||
                        error.message ||
                        'Failed to start session';

    yield put(gameActions.startSessionFailure(errorMessage));
    toast.error(errorMessage);

    // Log error for debugging
    console.error('Start session error:', {
      error: errorMessage,
      payload: action.payload,
      response: error.response?.data
    });
  }
}

function* getSessionSaga(action) {
  try {
    const { sessionId } = action.payload;

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const response = yield call(gameAPI.getSession, sessionId);

    yield put(gameActions.getSessionSuccess({
      session: response.data.session
    }));
  } catch (error) {
    const errorMessage = error.response?.data?.message ||
                        error.message ||
                        'Failed to get session';

    yield put(gameActions.getSessionFailure(errorMessage));

    // Don't show toast for 404s (session not found)
    if (error.response?.status !== 404) {
      toast.error(errorMessage);
    }

    console.error('Get session error:', {
      error: errorMessage,
      sessionId: action.payload?.sessionId,
      response: error.response?.data
    });
  }
}

function* drawCardSaga(action) {
  try {
    const { sessionId } = action.payload;

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    // Check if session is still active
    const currentSession = yield select(gameSelectors.getCurrentSession);
    if (!currentSession || currentSession.status === 'completed') {
      throw new Error('Session is no longer active');
    }

    const response = yield call(gameAPI.drawCard, sessionId);

    yield put(gameActions.drawCardSuccess(response.data));

    // Optional: Auto-save game state
    yield call(saveGameState, response.data.card);

  } catch (error) {
    const errorMessage = error.response?.data?.message ||
                        error.message ||
                        'Failed to draw card';

    yield put(gameActions.drawCardFailure(errorMessage));
    toast.error(errorMessage);

    console.error('Draw card error:', {
      error: errorMessage,
      sessionId: action.payload?.sessionId,
      response: error.response?.data
    });
  }
}

function* completeCardSaga(action) {
  try {
    const { sessionId, cardId } = action.payload;

    if (!sessionId || !cardId) {
      throw new Error('Session ID and Card ID are required');
    }

    const response = yield call(gameAPI.completeCard, sessionId, cardId);

    yield put(gameActions.completeCardSuccess({
      cardId,
      ...response.data
    }));

    toast.success('Card completed!');

    // Check for level progression
    const newLevel = response.data.currentLevel;
    const currentLevel = yield select(gameSelectors.getCurrentLevel);

    if (newLevel > currentLevel) {
      toast.success(`🎉 Level up! You've reached connection level ${newLevel}!`, {
        duration: 5000,
      });
    }

  } catch (error) {
    const errorMessage = error.response?.data?.message ||
                        error.message ||
                        'Failed to complete card';

    yield put(gameActions.completeCardFailure(errorMessage));
    toast.error(errorMessage);

    console.error('Complete card error:', {
      error: errorMessage,
      payload: action.payload,
      response: error.response?.data
    });
  }
}

function* skipCardSaga(action) {
  try {
    const { sessionId, cardId } = action.payload;

    if (!sessionId || !cardId) {
      throw new Error('Session ID and Card ID are required');
    }

    const response = yield call(gameAPI.skipCard, sessionId, cardId);

    yield put(gameActions.skipCardSuccess({
      cardId,
      ...response.data
    }));

    toast.success('Card skipped');

  } catch (error) {
    const errorMessage = error.response?.data?.message ||
                        error.message ||
                        'Failed to skip card';

    yield put(gameActions.skipCardFailure(errorMessage));
    toast.error(errorMessage);

    console.error('Skip card error:', {
      error: errorMessage,
      payload: action.payload,
      response: error.response?.data
    });
  }
}

function* endSessionSaga(action) {
  try {
    const { sessionId } = action.payload;

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const response = yield call(gameAPI.endSession, sessionId);

    yield put(gameActions.endSessionSuccess(response.data));

    toast.success('Session ended successfully!');

    // Clear any cached game state
    yield call(clearGameState);

  } catch (error) {
    const errorMessage = error.response?.data?.message ||
                        error.message ||
                        'Failed to end session';

    yield put(gameActions.endSessionFailure(errorMessage));
    toast.error(errorMessage);

    console.error('End session error:', {
      error: errorMessage,
      sessionId: action.payload?.sessionId,
      response: error.response?.data
    });
  }
}

function* getSessionStatsSaga(action) {
  try {
    const { sessionId } = action.payload;

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const response = yield call(gameAPI.getSessionStatistics, sessionId);

    yield put(gameActions.getSessionStatsSuccess({
      statistics: response.data.statistics
    }));

  } catch (error) {
    const errorMessage = error.response?.data?.message ||
                        error.message ||
                        'Failed to get session statistics';

    yield put(gameActions.getSessionStatsFailure(errorMessage));

    // Don't show toast for stats errors - they're not critical
    console.error('Get session stats error:', {
      error: errorMessage,
      sessionId: action.payload?.sessionId,
      response: error.response?.data
    });
  }
}

// Helper functions
function* saveGameState(cardData) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const gameState = yield select(gameSelectors.getGameState);
      localStorage.setItem('gameState', JSON.stringify({
        ...gameState,
        lastCard: cardData,
        savedAt: new Date().toISOString()
      }));
    }
  } catch (error) {
    console.warn('Failed to save game state:', error);
  }
}

function* clearGameState() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('gameState');
    }
  } catch (error) {
    console.warn('Failed to clear game state:', error);
  }
}

// Error recovery saga
function* handleGameError(action) {
  try {
    const error = action.payload;

    // If it's a session-related error, try to recover
    if (error.includes('session') || error.includes('Session')) {
      const currentSession = yield select(gameSelectors.getCurrentSession);

      if (currentSession?.id) {
        // Try to refresh session data
        yield put(gameActions.getSessionRequest({ sessionId: currentSession.id }));
      }
    }
  } catch (recoveryError) {
    console.error('Error recovery failed:', recoveryError);
  }
}

export default function* gameSaga() {
  yield takeLatest(gameActions.startSessionRequest.type, startSessionSaga);
  yield takeLatest(gameActions.getSessionRequest.type, getSessionSaga);
  yield takeEvery(gameActions.drawCardRequest.type, drawCardSaga);
  yield takeEvery(gameActions.completeCardRequest.type, completeCardSaga);
  yield takeEvery(gameActions.skipCardRequest.type, skipCardSaga);
  yield takeEvery(gameActions.endSessionRequest.type, endSessionSaga);
  yield takeLatest(gameActions.getSessionStatsRequest.type, getSessionStatsSaga);

  // Error recovery watchers
  yield takeEvery([
    gameActions.startSessionFailure.type,
    gameActions.getSessionFailure.type,
    gameActions.drawCardFailure.type
  ], handleGameError);
}
