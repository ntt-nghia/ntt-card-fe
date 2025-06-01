import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import rootReducer from './rootReducer';
import rootSaga from './rootSaga';
import { performanceMiddleware } from './middleware/performanceMiddleware';
import { errorMiddleware } from './middleware/errorMiddleware';

// Create saga middleware with error handling
const sagaMiddleware = createSagaMiddleware({
  onError: (error, { sagaStack }) => {
    console.error('Saga error:', error);
    console.error('Saga stack:', sagaStack);

    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: { saga: { stack: sagaStack } }
      });
    }
  }
});

// Configure store with optimized settings
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'auth/loginRequest',
          'auth/registerRequest',
          'game/startSessionRequest',
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: [
          'auth.user.createdAt',
          'auth.user.lastLoginAt',
          'user.profile.createdAt',
          'game.currentSession.createdAt',
        ],
        // Timing checks - warn if serialization takes too long
        warnAfter: 32,
      },
      immutableCheck: {
        warnAfter: 32,
      },
    })
    .concat(
      errorMiddleware,
      performanceMiddleware,
      sagaMiddleware
    ),
  devTools: process.env.NODE_ENV !== 'production' ? {
    trace: true,
    traceLimit: 25,
    actionSanitizer: (action) => ({
      ...action,
      // Sanitize sensitive data in dev tools
      ...(action.type.includes('login') && {
        payload: { ...action.payload, password: '[REDACTED]' }
      }),
    }),
    stateSanitizer: (state) => ({
      ...state,
      auth: {
        ...state.auth,
        token: state.auth.token ? '[REDACTED]' : null,
      },
    }),
  } : false,
});

// Run saga middleware
sagaMiddleware.run(rootSaga);

// Hot module replacement for development
if (import.meta.hot) {
  import.meta.hot.accept('./rootReducer', (newModule) => {
    const newRootReducer = newModule.default;
    store.replaceReducer(newRootReducer);
  });
}

export default store;
