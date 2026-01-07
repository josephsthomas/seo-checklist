import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

/**
 * Error Boundary component to catch React rendering errors
 * Prevents the entire app from crashing when a component fails
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log error to console only in development
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { variant = 'default', toolName } = this.props;

      // Full page error for tool/page level boundaries
      if (variant === 'page' || variant === 'tool') {
        return (
          <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white flex items-center justify-center">
            <div className="max-w-md mx-auto px-4 text-center">
              <div className={`w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/25`}>
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-charcoal-900 mb-3">
                {toolName ? `${toolName} Error` : 'Something went wrong'}
              </h2>
              <p className="text-charcoal-600 mb-8">
                {this.props.message || 'An error occurred while loading this page. Please try again.'}
              </p>

              {import.meta.env.DEV && this.state.error && (
                <details className="mb-6 text-left card p-4 bg-charcoal-50">
                  <summary className="text-sm font-medium text-charcoal-700 cursor-pointer">
                    Error Details (Dev Only)
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-40 font-mono">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex gap-3 justify-center">
                <button
                  onClick={this.handleRetry}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                {variant === 'tool' ? (
                  <button
                    onClick={this.handleGoBack}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                  </button>
                ) : (
                  <button
                    onClick={this.handleGoHome}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Go Home
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      }

      // Inline/section error (default)
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/25">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-charcoal-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-charcoal-600 mb-6">
              {this.props.message || 'An error occurred while loading this section. Please try again.'}
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left card p-4 bg-charcoal-50">
                <summary className="text-sm font-medium text-charcoal-700 cursor-pointer">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-40 font-mono">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="btn btn-primary flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Tool-specific Error Boundary wrapper
 */
export function ToolErrorBoundary({ children, toolName, toolColor, message }) {
  return (
    <ErrorBoundary
      variant="tool"
      toolName={toolName}
      toolColor={toolColor}
      message={message || `Failed to load ${toolName}. This might be a temporary issue.`}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Page-level Error Boundary wrapper
 */
export function PageErrorBoundary({ children, message }) {
  return (
    <ErrorBoundary variant="page" message={message}>
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
