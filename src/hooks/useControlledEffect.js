// src/hooks/useControlledEffect.js - Prevents infinite re-renders and request loops
import { useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Enhanced useEffect hook that prevents infinite loops and controls request frequency
 */
export const useControlledEffect = (effect, deps, options = {}) => {
  const { debounce = 0, maxExecutions = null, cooldown = 0, enabled = true } = options;

  const executionCount = useRef(0);
  const lastExecution = useRef(0);
  const timeoutRef = useRef(null);
  const depsRef = useRef(deps);

  // Deep compare dependencies to prevent unnecessary re-runs
  const depsChanged = useMemo(() => {
    if (!depsRef.current || !deps) return true;
    if (depsRef.current.length !== deps.length) return true;

    return deps.some((dep, index) => {
      const prevDep = depsRef.current[index];

      // Handle objects and arrays with shallow comparison
      if (
        typeof dep === 'object' &&
        dep !== null &&
        typeof prevDep === 'object' &&
        prevDep !== null
      ) {
        return JSON.stringify(dep) !== JSON.stringify(prevDep);
      }

      return dep !== prevDep;
    });
  }, deps);

  const executeEffect = useCallback(() => {
    if (!enabled) return;

    const now = Date.now();

    // Check cooldown period
    if (cooldown > 0 && now - lastExecution.current < cooldown) {
      console.warn('Effect execution skipped due to cooldown period');
      return;
    }

    // Check max executions limit
    if (maxExecutions !== null && executionCount.current >= maxExecutions) {
      console.warn(`Effect execution limit reached (${maxExecutions})`);
      return;
    }

    // Execute the effect
    try {
      executionCount.current++;
      lastExecution.current = now;
      depsRef.current = deps;

      const cleanup = effect();
      return cleanup;
    } catch (error) {
      console.error('Effect execution error:', error);
    }
  }, [effect, enabled, cooldown, maxExecutions, deps]);

  useEffect(() => {
    if (!depsChanged) return;

    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (debounce > 0) {
      // Debounced execution
      timeoutRef.current = setTimeout(() => {
        executeEffect();
      }, debounce);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    } else {
      // Immediate execution
      return executeEffect();
    }
  }, [depsChanged, executeEffect, debounce]);

  // Reset execution count when needed
  const resetExecutionCount = useCallback(() => {
    executionCount.current = 0;
    lastExecution.current = 0;
  }, []);

  return {
    executionCount: executionCount.current,
    resetExecutionCount,
    lastExecution: lastExecution.current,
  };
};

/**
 * Hook to safely dispatch Redux actions with built-in controls
 */
export const useControlledDispatch = (dispatch, options = {}) => {
  const {
    cooldown = 1000, // 1 second cooldown between same actions
    maxAttempts = 3,
    enabled = true,
  } = options;

  const actionHistory = useRef(new Map());
  const attemptCounts = useRef(new Map());

  const safeDispatch = useCallback(
    (action) => {
      if (!enabled) return false;

      const actionKey = action.type;
      const now = Date.now();
      const lastDispatch = actionHistory.current.get(actionKey) || 0;
      const attempts = attemptCounts.current.get(actionKey) || 0;

      // Check cooldown
      if (now - lastDispatch < cooldown) {
        console.warn(`Action ${actionKey} dispatched too frequently. Skipping.`);
        return false;
      }

      // Check max attempts
      if (attempts >= maxAttempts) {
        console.warn(`Action ${actionKey} exceeded max attempts (${maxAttempts}). Blocking.`);
        return false;
      }

      // Dispatch the action
      try {
        dispatch(action);
        actionHistory.current.set(actionKey, now);
        attemptCounts.current.set(actionKey, attempts + 1);
        return true;
      } catch (error) {
        console.error(`Error dispatching action ${actionKey}:`, error);
        return false;
      }
    },
    [dispatch, cooldown, maxAttempts, enabled]
  );

  const resetActionCount = useCallback((actionType) => {
    if (actionType) {
      attemptCounts.current.delete(actionType);
      actionHistory.current.delete(actionType);
    } else {
      attemptCounts.current.clear();
      actionHistory.current.clear();
    }
  }, []);

  return { safeDispatch, resetActionCount };
};

/**
 * Hook for controlled API calls with automatic retry and circuit breaker
 */
export const useControlledApiCall = (apiFunction, options = {}) => {
  const {
    maxRetries = 2,
    retryDelay = 2000,
    circuitBreakerThreshold = 3,
    circuitBreakerTimeout = 30000,
    enabled = true,
  } = options;

  const retryCount = useRef(0);
  const failureCount = useRef(0);
  const circuitBreakerOpen = useRef(false);
  const circuitBreakerOpenTime = useRef(0);

  const executeApiCall = useCallback(
    async (...args) => {
      if (!enabled) {
        throw new Error('API calls are disabled');
      }

      const now = Date.now();

      // Check circuit breaker
      if (circuitBreakerOpen.current) {
        if (now - circuitBreakerOpenTime.current > circuitBreakerTimeout) {
          // Reset circuit breaker
          circuitBreakerOpen.current = false;
          failureCount.current = 0;
          console.log('Circuit breaker reset');
        } else {
          throw new Error('Circuit breaker is open. Service temporarily unavailable.');
        }
      }

      try {
        const result = await apiFunction(...args);

        // Success - reset counters
        retryCount.current = 0;
        failureCount.current = 0;

        return result;
      } catch (error) {
        failureCount.current++;

        // Open circuit breaker if threshold reached
        if (failureCount.current >= circuitBreakerThreshold) {
          circuitBreakerOpen.current = true;
          circuitBreakerOpenTime.current = now;
          console.warn('Circuit breaker opened due to repeated failures');
          throw error;
        }

        // Retry logic for certain error types
        const shouldRetry =
          retryCount.current < maxRetries &&
          (error.status >= 500 || !error.status) && // Server errors or network errors
          error.status !== 429; // Don't retry rate limited requests

        if (shouldRetry) {
          retryCount.current++;
          console.warn(`API call failed, retrying (${retryCount.current}/${maxRetries})...`);

          await new Promise((resolve) => setTimeout(resolve, retryDelay * retryCount.current));
          return executeApiCall(...args);
        }

        throw error;
      }
    },
    [apiFunction, enabled, maxRetries, retryDelay, circuitBreakerThreshold, circuitBreakerTimeout]
  );

  const resetCircuitBreaker = useCallback(() => {
    circuitBreakerOpen.current = false;
    circuitBreakerOpenTime.current = 0;
    failureCount.current = 0;
    retryCount.current = 0;
  }, []);

  return {
    executeApiCall,
    resetCircuitBreaker,
    isCircuitBreakerOpen: circuitBreakerOpen.current,
    failureCount: failureCount.current,
  };
};
