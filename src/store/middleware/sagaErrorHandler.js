import { put, delay, select } from 'redux-saga/effects';

// Circuit breaker state management
const circuitBreakerState = new Map();

export class SagaCircuitBreaker {
  constructor(actionType, options = {}) {
    this.actionType = actionType;
    this.maxFailures = options.maxFailures || 3;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    this.backoffMultiplier = options.backoffMultiplier || 2;
    this.maxBackoff = options.maxBackoff || 30000; // 30 seconds

    if (!circuitBreakerState.has(actionType)) {
      circuitBreakerState.set(actionType, {
        failures: 0,
        lastFailure: null,
        state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
        nextRetryTime: null,
        backoffDelay: 1000,
      });
    }
  }

  getState() {
    return circuitBreakerState.get(this.actionType);
  }

  updateState(updates) {
    const current = this.getState();
    circuitBreakerState.set(this.actionType, { ...current, ...updates });
  }

  shouldAllowRequest() {
    const state = this.getState();
    const now = Date.now();

    switch (state.state) {
      case 'CLOSED':
        return true;

      case 'OPEN':
        if (now >= state.nextRetryTime) {
          this.updateState({ state: 'HALF_OPEN' });
          return true;
        }
        return false;

      case 'HALF_OPEN':
        return true;

      default:
        return true;
    }
  }

  recordSuccess() {
    this.updateState({
      failures: 0,
      state: 'CLOSED',
      nextRetryTime: null,
      backoffDelay: 1000,
    });
  }

  recordFailure() {
    const state = this.getState();
    const failures = state.failures + 1;
    const now = Date.now();

    if (failures >= this.maxFailures) {
      const backoffDelay = Math.min(state.backoffDelay * this.backoffMultiplier, this.maxBackoff);

      this.updateState({
        failures,
        lastFailure: now,
        state: 'OPEN',
        nextRetryTime: now + this.resetTimeout,
        backoffDelay,
      });
    } else {
      this.updateState({
        failures,
        lastFailure: now,
        backoffDelay: Math.min(state.backoffDelay * this.backoffMultiplier, this.maxBackoff),
      });
    }
  }

  getBackoffDelay() {
    return this.getState().backoffDelay;
  }
}

// Enhanced saga error handler
export function* createSagaErrorHandler(actionType, options = {}) {
  const circuitBreaker = new SagaCircuitBreaker(actionType, options);

  return function* sagaWithErrorHandling(sagaFunction) {
    return function* wrappedSaga(action) {
      // Check circuit breaker
      if (!circuitBreaker.shouldAllowRequest()) {
        console.warn(`Circuit breaker OPEN for ${actionType}. Request blocked.`);

        yield put({
          type: `${actionType.replace('Request', 'Failure')}`,
          payload: 'Service temporarily unavailable. Please try again later.',
          meta: { circuitBreakerBlocked: true },
        });
        return;
      }

      try {
        // Execute the original saga
        yield* sagaFunction(action);

        // Record success
        circuitBreaker.recordSuccess();
      } catch (error) {
        console.error(`Saga error in ${actionType}:`, error);

        // Record failure
        circuitBreaker.recordFailure();

        // Determine error type and response
        const errorMessage = getErrorMessage(error);
        const shouldRetry = shouldRetryError(error);

        // Dispatch failure action
        yield put({
          type: `${actionType.replace('Request', 'Failure')}`,
          payload: errorMessage,
          meta: {
            originalError: error.message,
            shouldRetry,
            circuitBreakerState: circuitBreaker.getState().state,
            actionType,
          },
        });

        // Add backoff delay for retryable errors
        if (shouldRetry) {
          const backoffDelay = circuitBreaker.getBackoffDelay();
          console.warn(`Applying backoff delay of ${backoffDelay}ms for ${actionType}`);
          yield delay(Math.min(backoffDelay, 5000)); // Cap at 5 seconds for UX
        }
      }
    };
  };
}

// Error categorization
function getErrorMessage(error) {
  if (!error.response) {
    return 'Network connection failed. Please check your internet connection.';
  }

  const { status } = error.response;

  switch (status) {
    case 400:
      return error.response.data?.message || 'Invalid request';
    case 401:
      return 'Authentication required. Please log in again.';
    case 403:
      return "You don't have permission to access this resource";
    case 404:
      return 'Resource not found';
    case 429:
      return 'Too many requests. Please wait before trying again.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Server error. Please try again later.';
    default:
      return error.response.data?.message || 'An unexpected error occurred';
  }
}

// Determine if error should trigger retry
function shouldRetryError(error) {
  if (!error.response) {
    return true; // Network errors are retryable
  }

  const { status } = error.response;

  // Don't retry client errors (4xx) except 429 (rate limit)
  if (status >= 400 && status < 500) {
    return status === 429;
  }

  // Retry server errors (5xx)
  return status >= 500;
}

// Saga factory with circuit breaker
export function* createProtectedSaga(actionType, sagaFunction, options = {}) {
  const errorHandler = yield* createSagaErrorHandler(actionType, options);
  return yield* errorHandler(sagaFunction);
}

// Reset circuit breaker manually (for admin or retry buttons)
export function resetCircuitBreaker(actionType) {
  if (circuitBreakerState.has(actionType)) {
    circuitBreakerState.set(actionType, {
      failures: 0,
      lastFailure: null,
      state: 'CLOSED',
      nextRetryTime: null,
      backoffDelay: 1000,
    });
  }
}

// Get circuit breaker stats (for debugging)
export function getCircuitBreakerStats() {
  const stats = {};
  for (const [actionType, state] of circuitBreakerState.entries()) {
    stats[actionType] = { ...state };
  }
  return stats;
}
