import { combineReducers } from '@reduxjs/toolkit';

import authReducer from './auth/authSlice';
import gameReducer from './game/gameSlice';
import userReducer from './user/userSlice';
import deckReducer from './deck/deckSlice';
import adminReducer from './admin/adminSlice';
const rootReducer = combineReducers({
  auth: authReducer,
  game: gameReducer,
  user: userReducer,
  deck: deckReducer,
  admin: adminReducer,
});

export default rootReducer;
