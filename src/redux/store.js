import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import questionsReducer from './slices/questionsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    questions: questionsReducer,
    ui: uiReducer,
  },
});