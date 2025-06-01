export const performanceMiddleware = (store) => (next) => (action) => {
  const startTime = performance.now();

  // Log slow actions in development
  if (process.env.NODE_ENV === 'development') {
    const result = next(action);
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 16) {
      // Log actions taking more than 16ms (one frame)
      console.warn(`Slow Redux action: ${action.type} took ${duration.toFixed(2)}ms`);
    }

    return result;
  }

  return next(action);
};
