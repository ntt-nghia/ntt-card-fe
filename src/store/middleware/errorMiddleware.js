export const errorMiddleware = (store) => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    console.error('Redux middleware error:', {
      action,
      error: error.message,
      stack: error.stack,
    });

    // Send to error tracking
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          redux: {
            action: action.type,
            payload: action.payload,
          },
        },
      });
    }

    throw error;
  }
};
