import { combineReducers } from '@reduxjs/toolkit';

import authReducer from './auth/authSlice';
import gameReducer from './game/gameSlice';
import userReducer from './user/userSlice';
import deckReducer from './deck/deckSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  game: gameReducer,
  user: userReducer,
  deck: deckReducer,
});

export default rootReducer;
