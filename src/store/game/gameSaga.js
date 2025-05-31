import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import toast from 'react-hot-toast';

import { gameActions } from './gameSlice';
import * as gameAPI from '@services/game';

function* startSessionSaga(action) {
  try {
    const response = yield call(gameAPI.startSession, action.payload);

    yield put(gameActions.startSessionSuccess({
      session: response.data.session
    }));

    toast.success('Game session started!');
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to start session';
    yield put(gameActions.startSessionFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getSessionSaga(action) {
  try {
    const { sessionId } = action.payload;
    const response = yield call(gameAPI.getSession, sessionId);

    yield put(gameActions.getSessionSuccess({
      session: response.data.session
    }));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to get session';
    yield put(gameActions.getSessionFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* drawCardSaga(action) {
  try {
    const { sessionId } = action.payload;
    const response = yield call(gameAPI.drawCard, sessionId);

    yield put(gameActions.drawCardSuccess(response.data));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to draw card';
    yield put(gameActions.drawCardFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* completeCardSaga(action) {
  try {
    const { sessionId, cardId } = action.payload;
    const response = yield call(gameAPI.completeCard, sessionId, cardId);

    yield put(gameActions.completeCardSuccess({
      cardId,
      ...response.data
    }));

    toast.success('Card completed!');
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to complete card';
    yield put(gameActions.completeCardFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* skipCardSaga(action) {
  try {
    const { sessionId, cardId } = action.payload;
    const response = yield call(gameAPI.skipCard, sessionId, cardId);

    yield put(gameActions.skipCardSuccess({
      cardId,
      ...response.data
    }));

    toast.success('Card skipped');
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to skip card';
    yield put(gameActions.skipCardFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* endSessionSaga(action) {
  try {
    const { sessionId } = action.payload;
    const response = yield call(gameAPI.endSession, sessionId);

    yield put(gameActions.endSessionSuccess(response.data));

    toast.success('Session ended successfully!');
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to end session';
    yield put(gameActions.endSessionFailure(errorMessage));
    toast.error(errorMessage);
  }
}

export default function* gameSaga() {
  yield takeLatest(gameActions.startSessionRequest.type, startSessionSaga);
  yield takeLatest(gameActions.getSessionRequest.type, getSessionSaga);
  yield takeEvery(gameActions.drawCardRequest.type, drawCardSaga);
  yield takeEvery(gameActions.completeCardRequest.type, completeCardSaga);
  yield takeEvery(gameActions.skipCardRequest.type, skipCardSaga);
  yield takeEvery(gameActions.endSessionRequest.type, endSessionSaga);
}
