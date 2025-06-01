export class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', originalError = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SESSION_ERROR: 'SESSION_ERROR',
  CARD_ERROR: 'CARD_ERROR',
  DECK_ERROR: 'DECK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

export const handleApiError = (error) => {
  if (!error.response) {
    return new AppError(
      'Network connection failed. Please check your internet connection.',
      ERROR_CODES.NETWORK_ERROR,
      error
    );
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      return new AppError(data.message || 'Invalid request', ERROR_CODES.VALIDATION_ERROR, error);
    case 401:
      return new AppError('Please log in to continue', ERROR_CODES.AUTH_ERROR, error);
    case 403:
      return new AppError(
        "You don't have permission to access this resource",
        ERROR_CODES.AUTH_ERROR,
        error
      );
    case 404:
      return new AppError(data.message || 'Resource not found', ERROR_CODES.UNKNOWN_ERROR, error);
    case 429:
      return new AppError(
        'Too many requests. Please wait a moment and try again.',
        ERROR_CODES.NETWORK_ERROR,
        error
      );
    case 500:
    case 502:
    case 503:
    case 504:
      return new AppError(
        'Server error. Please try again later.',
        ERROR_CODES.UNKNOWN_ERROR,
        error
      );
    default:
      return new AppError(
        data.message || 'An unexpected error occurred',
        ERROR_CODES.UNKNOWN_ERROR,
        error
      );
  }
};

export const logError = (error, context = {}) => {
  console.error('Error logged:', {
    message: error.message,
    code: error.code,
    timestamp: error.timestamp,
    context,
    stack: error.stack,
  });

  if (window.Sentry) {
    window.Sentry.captureException(error, {
      contexts: { custom: context },
    });
  }
};
