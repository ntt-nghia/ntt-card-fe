import { useCallback } from 'react';
import { useApi } from './useApi';

export const useApiCall = (apiFunction, dependencies = []) => {
  const { loading, error, execute, reset } = useApi();

  const call = useCallback((...args) => {
    return execute(() => apiFunction(...args), {
      context: { function: apiFunction.name, args }
    });
  }, [execute, apiFunction, ...dependencies]);

  return {
    call,
    loading,
    error,
    reset
  };
};
