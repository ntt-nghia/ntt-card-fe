import ErrorBoundary from '@components/common/ErrorBoundary/index.js';

export const createAsyncThunk = (typePrefix, asyncFunction) => {
  const pending = `${typePrefix}/pending`;
  const fulfilled = `${typePrefix}/fulfilled`;
  const rejected = `${typePrefix}/rejected`;

  return {
    pending,
    fulfilled,
    rejected,

    // Action creators
    request: (payload) => ({ type: pending, payload }),
    success: (payload) => ({ type: fulfilled, payload }),
    failure: (error) => ({ type: rejected, payload: error, error: true }),

    // For use in reducers
    toString: () => typePrefix,
    type: typePrefix,
  };
};

// Store performance monitoring
export const monitorStorePerformance = (store) => {
  if (process.env.NODE_ENV !== 'development') return;

  let actionCount = 0;
  let lastLogTime = Date.now();

  const unsubscribe = store.subscribe(() => {
    actionCount++;

    // Log metrics every 5 seconds
    const now = Date.now();
    if (now - lastLogTime > 5000) {
      const actionsPerSecond = actionCount / ((now - lastLogTime) / 1000);

      if (actionsPerSecond > 10) {
        console.warn(`High Redux action frequency: ${actionsPerSecond.toFixed(2)} actions/second`);
      }

      actionCount = 0;
      lastLogTime = now;
    }
  });

  return unsubscribe;
};

// Enhanced error boundary for Redux components
export const withReduxErrorBoundary = (Component) => {
  return function ReduxErrorBoundary(props) {
    return (
      <ErrorBoundary
        fallback={({ error, retry }) => (
          <div className="p-4 text-center">
            <h3 className="mb-2 text-lg font-semibold text-error-700">Component Error</h3>
            <p className="mb-4 text-sm text-error-600">
              A Redux-related error occurred: {error.message}
            </p>
            <Button onClick={retry} size="sm">
              Retry Component
            </Button>
          </div>
        )}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};
