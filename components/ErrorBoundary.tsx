import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleBack = () => {
    window.history.back();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full space-y-4">
            <div className="flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-sm text-gray-600 mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              
              <div className="space-y-2">
                <button
                  onClick={this.handleRefresh}
                  className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                           active:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                
                <button
                  onClick={this.handleBack}
                  className="w-full p-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 
                           active:bg-gray-400"
                >
                  Go Back
                </button>
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <div className="mt-4 p-4 bg-gray-900 text-gray-100 rounded overflow-auto text-xs">
                <pre>{this.state.errorInfo.componentStack}</pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;