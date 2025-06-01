import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from '@components/common/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
      hasError: true,
    });

    // Report to error tracking service
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { error, retryCount } = this.state;
      const { fallback: Fallback, level = 'page' } = this.props;

      // Use custom fallback if provided
      if (Fallback) {
        return <Fallback error={error} retry={this.handleRetry} />;
      }

      // Different error displays based on level
      if (level === 'component') {
        return (
          <div className="rounded-lg border border-error-200 bg-error-50 p-4">
            <div className="flex items-center text-error-700">
              <AlertTriangle className="mr-2 h-5 w-5" />
              <span className="font-medium">Component Error</span>
            </div>
            <p className="mt-1 text-sm text-error-600">Something went wrong with this component.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleRetry}
              className="mt-2"
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Try Again
            </Button>
          </div>
        );
      }

      // Full page error
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-md text-center">
            <div className="mb-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error-100">
                <AlertTriangle className="h-8 w-8 text-error-600" />
              </div>
            </div>

            <h1 className="mb-2 text-2xl font-bold text-gray-900">Oops! Something went wrong</h1>

            <p className="mb-6 text-gray-600">
              We encountered an unexpected error. This has been reported to our team.
            </p>

            {retryCount < 3 && (
              <div className="mb-4 flex flex-col justify-center gap-3 sm:flex-row">
                <Button leftIcon={<RefreshCw className="h-4 w-4" />} onClick={this.handleRetry}>
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<Home className="h-4 w-4" />}
                  onClick={this.handleGoHome}
                >
                  Go Home
                </Button>
              </div>
            )}

            {retryCount >= 3 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  The issue persists. Please try refreshing the page or contact support.
                </p>
                <Button
                  variant="outline"
                  leftIcon={<Home className="h-4 w-4" />}
                  onClick={this.handleGoHome}
                  fullWidth
                >
                  Go to Homepage
                </Button>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 max-h-40 overflow-auto rounded bg-gray-100 p-3 text-xs">
                  {error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
