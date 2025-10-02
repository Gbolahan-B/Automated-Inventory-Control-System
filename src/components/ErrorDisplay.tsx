import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw, LogIn, Mail } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  code?: string;
  action?: 'retry' | 'signin' | 'contact_support' | 'reload' | 'none';
  suggestion?: string;
  onRetry?: () => void;
  onSignIn?: () => void;
  onReload?: () => void;
  className?: string;
}

export function ErrorDisplay({ 
  error, 
  code, 
  action, 
  suggestion, 
  onRetry, 
  onSignIn, 
  onReload,
  className = ""
}: ErrorDisplayProps) {
  const getErrorVariant = () => {
    if (code?.includes('auth.email_exists')) return 'default';
    return 'destructive';
  };

  const getErrorIcon = () => {
    if (code?.includes('auth.email_exists')) return <LogIn className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const renderActionButton = () => {
    switch (action) {
      case 'retry':
        return onRetry ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="mt-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Try Again
          </Button>
        ) : null;
        
      case 'signin':
        return onSignIn ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSignIn}
            className="mt-2"
          >
            <LogIn className="h-3 w-3 mr-1" />
            Sign In Instead
          </Button>
        ) : null;
        
      case 'reload':
        return onReload ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReload}
            className="mt-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reload Page
          </Button>
        ) : null;
        
      case 'contact_support':
        return (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open('mailto:support@example.com', '_blank')}
            className="mt-2"
          >
            <Mail className="h-3 w-3 mr-1" />
            Contact Support
          </Button>
        );
        
      default:
        return null;
    }
  };

  return (
    <Alert variant={getErrorVariant()} className={`border-red-300 bg-red-50 ${className}`}>
      <div className="flex items-start space-x-2">
        {getErrorIcon()}
        <div className="flex-1">
          <AlertDescription className="text-red-800">
            <div className="font-medium mb-1">{error}</div>
            {suggestion && (
              <div className="text-sm text-red-700 mt-1">{suggestion}</div>
            )}
            {renderActionButton()}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}

// Enhanced error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error!} />;
      }
      
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <ErrorDisplay
              error="Something went wrong"
              suggestion="Please refresh the page and try again. If the problem persists, contact support."
              action="reload"
              onReload={() => window.location.reload()}
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}