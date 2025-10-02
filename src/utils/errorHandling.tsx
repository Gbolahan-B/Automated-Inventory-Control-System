export interface ErrorDetails {
  code: string;
  message: string;
  userMessage: string;
  suggestion?: string;
  action?: 'retry' | 'signin' | 'contact_support' | 'reload' | 'none';
}

// Error type definitions
export const ERROR_TYPES = {
  // Authentication Errors
  AUTH_INVALID_CREDENTIALS: 'auth.invalid_credentials',
  AUTH_EMAIL_EXISTS: 'auth.email_exists',
  AUTH_WEAK_PASSWORD: 'auth.weak_password',
  AUTH_INVALID_EMAIL: 'auth.invalid_email',
  AUTH_TOO_MANY_REQUESTS: 'auth.too_many_requests',
  AUTH_SESSION_EXPIRED: 'auth.session_expired',
  AUTH_EMAIL_NOT_CONFIRMED: 'auth.email_not_confirmed',
  
  // Network Errors
  NETWORK_OFFLINE: 'network.offline',
  NETWORK_TIMEOUT: 'network.timeout',
  NETWORK_CONNECTION_FAILED: 'network.connection_failed',
  
  // Server Errors
  SERVER_INTERNAL_ERROR: 'server.internal_error',
  SERVER_MAINTENANCE: 'server.maintenance',
  SERVER_NOT_FOUND: 'server.not_found',
  
  // Data Errors
  DATA_NOT_FOUND: 'data.not_found',
  DATA_VALIDATION_ERROR: 'data.validation_error',
  DATA_DUPLICATE: 'data.duplicate',
  
  // Permission Errors
  PERMISSION_DENIED: 'permission.denied',
  PERMISSION_UNAUTHORIZED: 'permission.unauthorized',
  
  // Unknown Error
  UNKNOWN: 'unknown'
} as const;

export class AppError extends Error {
  public readonly code: string;
  public readonly userMessage: string;
  public readonly suggestion?: string;
  public readonly action?: string;
  public readonly originalError?: Error;

  constructor(details: ErrorDetails, originalError?: Error) {
    super(details.message);
    this.name = 'AppError';
    this.code = details.code;
    this.userMessage = details.userMessage;
    this.suggestion = details.suggestion;
    this.action = details.action;
    this.originalError = originalError;
  }
}

// Enhanced error classification function
export function classifyError(error: any): ErrorDetails {
  // Handle our custom AppError
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      suggestion: error.suggestion,
      action: error.action
    };
  }

  // Handle standard errors with message classification
  const message = error?.message || error?.error || String(error);
  const lowerMessage = message.toLowerCase();

  // Authentication errors
  if (lowerMessage.includes('invalid login credentials') || 
      lowerMessage.includes('invalid credentials')) {
    return {
      code: ERROR_TYPES.AUTH_INVALID_CREDENTIALS,
      message,
      userMessage: 'Invalid email or password. Please check your credentials and try again.',
      suggestion: 'Make sure you\'re using the correct email and password.',
      action: 'retry'
    };
  }

  if (lowerMessage.includes('already registered') || 
      lowerMessage.includes('user already exists') ||
      lowerMessage.includes('email already exists')) {
    return {
      code: ERROR_TYPES.AUTH_EMAIL_EXISTS,
      message,
      userMessage: 'An account with this email address already exists.',
      suggestion: 'Try signing in with your existing account instead.',
      action: 'signin'
    };
  }

  if (lowerMessage.includes('password should be at least') ||
      lowerMessage.includes('password must be at least') ||
      lowerMessage.includes('weak password')) {
    return {
      code: ERROR_TYPES.AUTH_WEAK_PASSWORD,
      message,
      userMessage: 'Password does not meet security requirements.',
      suggestion: 'Please create a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.',
      action: 'retry'
    };
  }

  if (lowerMessage.includes('invalid email') || 
      lowerMessage.includes('email format')) {
    return {
      code: ERROR_TYPES.AUTH_INVALID_EMAIL,
      message,
      userMessage: 'Please enter a valid email address.',
      suggestion: 'Check that your email address is in the correct format (example@domain.com).',
      action: 'retry'
    };
  }

  if (lowerMessage.includes('too many requests') ||
      lowerMessage.includes('rate limit')) {
    return {
      code: ERROR_TYPES.AUTH_TOO_MANY_REQUESTS,
      message,
      userMessage: 'Too many login attempts. Please wait a moment before trying again.',
      suggestion: 'Wait 5-10 minutes before attempting to sign in again.',
      action: 'retry'
    };
  }

  if (lowerMessage.includes('email not confirmed') ||
      lowerMessage.includes('confirm your email')) {
    return {
      code: ERROR_TYPES.AUTH_EMAIL_NOT_CONFIRMED,
      message,
      userMessage: 'Please confirm your email address before signing in.',
      suggestion: 'Check your email for a confirmation link.',
      action: 'contact_support'
    };
  }

  if (lowerMessage.includes('session') && lowerMessage.includes('expired')) {
    return {
      code: ERROR_TYPES.AUTH_SESSION_EXPIRED,
      message,
      userMessage: 'Your session has expired. Please sign in again.',
      suggestion: 'Sign out and sign back in to refresh your session.',
      action: 'signin'
    };
  }

  // Network errors
  if (lowerMessage.includes('failed to fetch') ||
      lowerMessage.includes('network error') ||
      lowerMessage.includes('connection refused')) {
    return {
      code: ERROR_TYPES.NETWORK_CONNECTION_FAILED,
      message,
      userMessage: 'Cannot connect to server. Please check your internet connection.',
      suggestion: 'Verify your internet connection and try again.',
      action: 'retry'
    };
  }

  if (lowerMessage.includes('timeout')) {
    return {
      code: ERROR_TYPES.NETWORK_TIMEOUT,
      message,
      userMessage: 'Request timed out. The server is taking too long to respond.',
      suggestion: 'Please try again in a moment.',
      action: 'retry'
    };
  }

  // Server errors
  if (lowerMessage.includes('500') || 
      lowerMessage.includes('internal server error')) {
    return {
      code: ERROR_TYPES.SERVER_INTERNAL_ERROR,
      message,
      userMessage: 'Server error occurred. Our team has been notified.',
      suggestion: 'Please try again in a few minutes.',
      action: 'retry'
    };
  }

  if (lowerMessage.includes('503') || 
      lowerMessage.includes('service unavailable')) {
    return {
      code: ERROR_TYPES.SERVER_MAINTENANCE,
      message,
      userMessage: 'Service is temporarily unavailable.',
      suggestion: 'We may be performing maintenance. Please try again later.',
      action: 'retry'
    };
  }

  if (lowerMessage.includes('404') || 
      lowerMessage.includes('not found')) {
    return {
      code: ERROR_TYPES.SERVER_NOT_FOUND,
      message,
      userMessage: 'The requested resource was not found.',
      suggestion: 'Please refresh the page and try again.',
      action: 'reload'
    };
  }

  if (lowerMessage.includes('401') || 
      lowerMessage.includes('unauthorized')) {
    return {
      code: ERROR_TYPES.PERMISSION_UNAUTHORIZED,
      message,
      userMessage: 'Authentication required. Please sign in again.',
      suggestion: 'Your session may have expired.',
      action: 'signin'
    };
  }

  if (lowerMessage.includes('403') || 
      lowerMessage.includes('forbidden')) {
    return {
      code: ERROR_TYPES.PERMISSION_DENIED,
      message,
      userMessage: 'You don\'t have permission to perform this action.',
      suggestion: 'Contact support if you believe this is an error.',
      action: 'contact_support'
    };
  }

  // Data errors
  if (lowerMessage.includes('validation') || 
      lowerMessage.includes('invalid input')) {
    return {
      code: ERROR_TYPES.DATA_VALIDATION_ERROR,
      message,
      userMessage: 'Please check your input and try again.',
      suggestion: 'Make sure all required fields are filled correctly.',
      action: 'retry'
    };
  }

  // Default unknown error
  return {
    code: ERROR_TYPES.UNKNOWN,
    message,
    userMessage: 'An unexpected error occurred. Please try again.',
    suggestion: 'If the problem persists, please contact support.',
    action: 'retry'
  };
}

// Error logging utility
export function logError(error: any, context?: string) {
  const errorDetails = classifyError(error);
  
  console.error('Error Details:', {
    context,
    code: errorDetails.code,
    message: errorDetails.message,
    userMessage: errorDetails.userMessage,
    suggestion: errorDetails.suggestion,
    action: errorDetails.action,
    timestamp: new Date().toISOString(),
    stack: error?.stack
  });
  
  return errorDetails;
}

// Utility to create standardized error responses
export function createErrorResponse(error: any, context?: string): ErrorDetails {
  const errorDetails = logError(error, context);
  return errorDetails;
}