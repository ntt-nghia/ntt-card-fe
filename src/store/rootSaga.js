import { all, fork } from 'redux-saga/effects';

import authSaga from './auth/authSaga';
import gameSaga from './game/gameSaga';
import userSaga from './user/userSaga';
import deckSaga from './deck/deckSaga';

export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(gameSaga),
    fork(userSaga),
    fork(deckSaga),
  ]);
}
