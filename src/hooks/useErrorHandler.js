import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { handleApiError, logError } from '@utils/errorHandler';

export const useErrorHandler = () => {
  const handleError = useCallback((error, context = {}) => {
    const appError = error instanceof Error ? handleApiError(error) : error;

    // Log error
    logError(appError, context);

    // Show user-friendly message
    toast.error(appError.message);

    return appError;
  }, []);

  const handleAsyncError = useCallback(async (asyncFn, context = {}) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  }, [handleError]);

  return { handleError, handleAsyncError };
};
