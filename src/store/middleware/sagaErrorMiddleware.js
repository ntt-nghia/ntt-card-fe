import { put, call } from 'redux-saga/effects';

export function* sagaErrorHandler(error, action, context = {}) {
  try {
    console.error('Saga error:', {
      action: action?.type,
      error: error.message,
      context
    });

    // Log to error tracking service
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          saga: {
            action: action?.type,
            context
          }
        }
      });
    }

    // You could dispatch a global error action here if needed
    // yield put({ type: 'GLOBAL_ERROR', payload: error.message });

  } catch (loggingError) {
    console.error('Error in saga error handler:', loggingError);
  }
}
