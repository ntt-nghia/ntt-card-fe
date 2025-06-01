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
      retryCount: 0
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
      hasError: true
    });

    // Report to error tracking service
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      });
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
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
          <div className="p-4 border border-error-200 bg-error-50 rounded-lg">
            <div className="flex items-center text-error-700">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span className="font-medium">Component Error</span>
            </div>
            <p className="text-sm text-error-600 mt-1">
              Something went wrong with this component.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleRetry}
              className="mt-2"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Try Again
            </Button>
          </div>
        );
      }

      // Full page error
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-error-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-error-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>

            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. This has been reported to our team.
            </p>

            {retryCount < 3 && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                <Button
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  onClick={this.handleRetry}
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<Home className="w-4 h-4" />}
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
                  leftIcon={<Home className="w-4 h-4" />}
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
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
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
