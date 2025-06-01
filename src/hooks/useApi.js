import { useState, useCallback } from 'react';
import { useErrorHandler } from '@hooks/useErrorHandler';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleError } = useErrorHandler();

  const execute = useCallback(
    async (apiCall, options = {}) => {
      const {
        onSuccess = () => {},
        onError = () => {},
        showErrorToast = true,
        context = {},
      } = options;

      setLoading(true);
      setError(null);

      try {
        const result = await apiCall();
        onSuccess(result);
        return result;
      } catch (err) {
        const appError = showErrorToast ? handleError(err, context) : err;
        setError(appError);
        onError(appError);
        throw appError;
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    reset,
  };
};
