import { call, put, takeEvery, takeLatest, delay, select, race } from 'redux-saga/effects';
import toast from 'react-hot-toast';

import { gameActions } from './gameSlice';
import { userActions } from '../user/userSlice';
import * as gameAPI from '../../services/game';

/**
 * Start a new game session
 */
function* startSessionSaga(action) {
  try {
    const sessionData = action.payload;

    // Validate session data
    if (!sessionData.relationshipType) {
      throw new Error('Relationship type is required');
    }

    if (!sessionData.selectedDeckIds || sessionData.selectedDeckIds.length === 0) {
      throw new Error('At least one deck must be selected');
    }

    const response = yield call(gameAPI.startSession, sessionData);

    if (!response.data || !response.data.session) {
      throw new Error('Invalid response from server');
    }

    const session = response.data.session;

    yield put(gameActions.startSessionSuccess({
      session
    }));

    toast.success('Game session started!');

    // Redirect to game page after successful session creation
    yield call(redirectToGame, session.id);

  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Failed to start session');
    yield put(gameActions.startSessionFailure(errorMessage));
    toast.error(errorMessage);
  }
}

/**
 * Get session details by ID
 */
function* getSessionSaga(action) {
  try {
    const { sessionId } = action.payload;

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const response = yield call(gameAPI.getSession, sessionId);

    if (!response.data || !response.data.session) {
      throw new Error('Session not found');
    }

    const session = response.data.session;

    yield put(gameActions.getSessionSuccess({
      session
    }));

    // If session is completed, update user statistics
    if (session.status === 'completed' && session.statistics) {
      yield put(userActions.recordGameCompletionSuccess({
        statistics: session.statistics
      }));
    }

  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Failed to get session');
    yield put(gameActions.getSessionFailure(errorMessage));

    // Handle session not found - redirect to dashboard
    if (error?.response?.status === 404) {
      toast.error('Game session not found');
      yield call(redirectToDashboard);
    } else {
      toast.error(errorMessage);
    }
  }
}

/**
 * Draw next card with enhanced error handling
 */
function* drawCardSaga(action) {
  try {
    const { sessionId } = action.payload;

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    // Check current session state before drawing
    const currentSession = yield select(state => state.game.currentSession);

    if (!currentSession) {
      throw new Error('No active session found');
    }

    if (currentSession.status !== 'active' && currentSession.status !== 'waiting') {
      throw new Error('Session is not active');
    }

    // Check if cards are available
    const cardsRemaining = yield select(state => state.game.cardsRemaining);
    if (cardsRemaining <= 0) {
      throw new Error('No more cards available in this session');
    }

    // Race between API call and timeout
    const { response, timeout } = yield race({
      response: call(gameAPI.drawCard, sessionId),
      timeout: delay(10000) // 10 second timeout
    });

    if (timeout) {
      throw new Error('Request timed out. Please try again.');
    }

    if (!response.data || !response.data.card) {
      throw new Error('No card returned from server');
    }

    yield put(gameActions.drawCardSuccess(response.data));

    // Track card draw for analytics
    yield call(trackCardDraw, response.data.card);

  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Failed to draw card');
    yield put(gameActions.drawCardFailure(errorMessage));

    // Handle specific error cases
    if (error.message?.includes('No more cards')) {
      toast.info('All cards have been drawn! Time to end the session.');
    } else if (error.message?.includes('timed out')) {
      toast.error('Connection timed out. Please check your internet and try again.');
    } else {
      toast.error(errorMessage);
    }
  }
}

/**
 * Complete a card with validation
 */
function* completeCardSaga(action) {
  try {
    const { sessionId, cardId } = action.payload;

    if (!sessionId || !cardId) {
      throw new Error('Session ID and Card ID are required');
    }

    // Validate that the card was actually drawn
    const drawnCards = yield select(state => state.game.drawnCards);
    if (!drawnCards.includes(cardId)) {
      throw new Error('Cannot complete a card that was not drawn');
    }

    // Check if card is already completed
    const completedCards = yield select(state => state.game.completedCards);
    if (completedCards.includes(cardId)) {
      throw new Error('Card is already completed');
    }

    const response = yield call(gameAPI.completeCard, sessionId, cardId);

    yield put(gameActions.completeCardSuccess({
      cardId,
      ...response.data
    }));

    toast.success('Card completed! Great job building connections.');

    // Check for level progression
    yield call(checkLevelProgression, response.data);

  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Failed to complete card');
    yield put(gameActions.completeCardFailure(errorMessage));
    toast.error(errorMessage);
  }
}

/**
 * Skip a card with validation
 */
function* skipCardSaga(action) {
  try {
    const { sessionId, cardId } = action.payload;

    if (!sessionId || !cardId) {
      throw new Error('Session ID and Card ID are required');
    }

    // Validate that the card was actually drawn
    const drawnCards = yield select(state => state.game.drawnCards);
    if (!drawnCards.includes(cardId)) {
      throw new Error('Cannot skip a card that was not drawn');
    }

    // Check if card is already skipped
    const skippedCards = yield select(state => state.game.skippedCards);
    if (skippedCards.includes(cardId)) {
      throw new Error('Card is already skipped');
    }

    const response = yield call(gameAPI.skipCard, sessionId, cardId);

    yield put(gameActions.skipCardSuccess({
      cardId,
      ...response.data
    }));

    toast.success('Card skipped');

    // Track skip for analytics
    yield call(trackCardSkip, cardId);

  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Failed to skip card');
    yield put(gameActions.skipCardFailure(errorMessage));
    toast.error(errorMessage);
  }
}

/**
 * End session with statistics recording
 */
function* endSessionSaga(action) {
  try {
    const { sessionId } = action.payload;

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const currentSession = yield select(state => state.game.currentSession);

    if (!currentSession) {
      throw new Error('No active session found');
    }

    if (currentSession.status === 'completed') {
      throw new Error('Session is already completed');
    }

    const response = yield call(gameAPI.endSession, sessionId);

    yield put(gameActions.endSessionSuccess(response.data));

    // Record game completion in user statistics
    if (response.data.statistics) {
      yield put(userActions.recordGameCompletionRequest({
        relationshipType: currentSession.relationshipType,
        connectionLevel: currentSession.currentLevel,
        sessionDuration: response.data.statistics.duration
      }));
    }

    toast.success('Session ended successfully!');

    // Delay before redirecting to allow user to see the success message
    yield delay(1500);
    yield call(redirectToDashboard);

  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Failed to end session');
    yield put(gameActions.endSessionFailure(errorMessage));
    toast.error(errorMessage);
  }
}

/**
 * Handle session timeout
 */
function* handleSessionTimeoutSaga() {
  try {
    const currentSession = yield select(state => state.game.currentSession);

    if (!currentSession) {
      return;
    }

    const sessionStartTime = new Date(currentSession.startedAt);
    const maxDuration = currentSession.configuration?.maxDuration || 7200000; // 2 hours default
    const elapsedTime = Date.now() - sessionStartTime.getTime();

    if (elapsedTime >= maxDuration) {
      toast.warning('Session has reached maximum duration. Ending session...');

      yield put(gameActions.endSessionRequest({
        sessionId: currentSession.id
      }));
    }

  } catch (error) {
    console.error('Error handling session timeout:', error);
  }
}

/**
 * Get session statistics
 */
function* getSessionStatsSaga(action) {
  try {
    const { sessionId } = action.payload;

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const response = yield call(gameAPI.getSessionStatistics, sessionId);

    yield put(gameActions.getSessionStatsSuccess(response.data));

  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Failed to get session statistics');
    yield put(gameActions.getSessionStatsFailure(errorMessage));
    // Don't show toast for stats errors as they're not critical
    console.error('Session stats error:', errorMessage);
  }
}

/**
 * Handle game session recovery after page refresh
 */
function* recoverSessionSaga() {
  try {
    // Check if there's a session in progress from localStorage
    const sessionId = localStorage.getItem('currentGameSession');

    if (sessionId) {
      yield put(gameActions.getSessionRequest({ sessionId }));
    }

  } catch (error) {
    console.error('Error recovering session:', error);
    localStorage.removeItem('currentGameSession');
  }
}

/**
 * Auto-save session progress
 */
function* autoSaveSessionSaga() {
  try {
    const currentSession = yield select(state => state.game.currentSession);

    if (currentSession && currentSession.id) {
      localStorage.setItem('currentGameSession', currentSession.id);
    } else {
      localStorage.removeItem('currentGameSession');
    }

  } catch (error) {
    console.error('Error auto-saving session:', error);
  }
}

/**
 * Utility functions
 */
function* redirectToGame(sessionId) {
  try {
    // Use window.location for navigation
    window.location.href = `/game/${sessionId}`;
  } catch (error) {
    console.error('Navigation error:', error);
  }
}

function* redirectToDashboard() {
  try {
    window.location.href = '/dashboard';
  } catch (error) {
    console.error('Navigation error:', error);
  }
}

function* checkLevelProgression(responseData) {
  try {
    if (responseData.currentLevel) {
      const previousLevel = yield select(state => state.game.currentLevel);

      if (responseData.currentLevel > previousLevel) {
        toast.success(`🎉 Connection Level ${responseData.currentLevel} unlocked!`);
      }
    }
  } catch (error) {
    console.error('Error checking level progression:', error);
  }
}

function* trackCardDraw(card) {
  try {
    // Analytics tracking would go here
    console.log('Card drawn:', card.type, card.connectionLevel);
  } catch (error) {
    console.error('Error tracking card draw:', error);
  }
}

function* trackCardSkip(cardId) {
  try {
    // Analytics tracking would go here
    console.log('Card skipped:', cardId);
  } catch (error) {
    console.error('Error tracking card skip:', error);
  }
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
 * Root game saga with session monitoring
 */
export default function* gameSaga() {
  yield takeLatest(gameActions.startSessionRequest.type, startSessionSaga);
  yield takeLatest(gameActions.getSessionRequest.type, getSessionSaga);
  yield takeEvery(gameActions.drawCardRequest.type, drawCardSaga);
  yield takeEvery(gameActions.completeCardRequest.type, completeCardSaga);
  yield takeEvery(gameActions.skipCardRequest.type, skipCardSaga);
  yield takeEvery(gameActions.endSessionRequest.type, endSessionSaga);
  yield takeLatest(gameActions.getSessionStatsRequest.type, getSessionStatsSaga);

  // Session management sagas
  yield takeLatest('GAME_RECOVER_SESSION', recoverSessionSaga);
  yield takeEvery(gameActions.startSessionSuccess.type, autoSaveSessionSaga);
  yield takeEvery(gameActions.endSessionSuccess.type, autoSaveSessionSaga);

  // Session monitoring (check timeout every 30 seconds)
  function* sessionMonitor() {
    while (true) {
      yield delay(30000); // 30 seconds
      yield call(handleSessionTimeoutSaga);
    }
  }

  yield call(sessionMonitor);
}
