import { toast } from 'sonner@2.0.3';
import { createErrorResponse } from './errorHandling';

export interface ToastOptions {
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export class ToastManager {
  static success(message: string, options?: ToastOptions) {
    return toast.success(message, {
      duration: options?.duration || 4000,
      dismissible: options?.dismissible !== false,
      action: options?.action,
    });
  }

  static error(error: any, context?: string, options?: ToastOptions) {
    const errorDetails = createErrorResponse(error, context);
    
    return toast.error(errorDetails.userMessage, {
      duration: options?.duration || 6000,
      dismissible: options?.dismissible !== false,
      description: errorDetails.suggestion,
      action: options?.action,
    });
  }

  static warning(message: string, options?: ToastOptions) {
    return toast.warning(message, {
      duration: options?.duration || 5000,
      dismissible: options?.dismissible !== false,
      action: options?.action,
    });
  }

  static info(message: string, options?: ToastOptions) {
    return toast.info(message, {
      duration: options?.duration || 4000,
      dismissible: options?.dismissible !== false,
      action: options?.action,
    });
  }

  static loading(message: string = 'Loading...') {
    return toast.loading(message);
  }

  static dismiss(toastId?: string | number) {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }

  // Specialized toasts for common scenarios
  static authError(error: any) {
    const errorDetails = createErrorResponse(error, 'authentication');
    
    return toast.error(errorDetails.userMessage, {
      duration: 7000,
      description: errorDetails.suggestion,
      action: errorDetails.action === 'signin' ? {
        label: 'Sign In',
        onClick: () => {
          // This would be handled by the calling component
          console.log('Navigate to sign in');
        }
      } : undefined,
    });
  }

  static networkError(error: any) {
    const errorDetails = createErrorResponse(error, 'network');
    
    return toast.error('Connection Failed', {
      duration: 8000,
      description: errorDetails.userMessage,
      action: {
        label: 'Retry',
        onClick: () => {
          // This would be handled by the calling component
          console.log('Retry network request');
        }
      }
    });
  }

  static validationError(message: string, fields?: string[]) {
    const fieldText = fields && fields.length > 0 ? `Check: ${fields.join(', ')}` : '';
    
    return toast.error('Validation Error', {
      duration: 6000,
      description: `${message}${fieldText ? ` (${fieldText})` : ''}`,
    });
  }

  static passwordStrengthError(feedback: string[]) {
    const mainIssue = feedback[0] || 'Password requirements not met';
    const otherIssues = feedback.slice(1);
    
    return toast.error('Password Too Weak', {
      duration: 8000,
      description: mainIssue,
      action: otherIssues.length > 0 ? {
        label: `${otherIssues.length} more issue${otherIssues.length > 1 ? 's' : ''}`,
        onClick: () => {
          // Show all issues in a separate toast
          toast.info('Password Requirements', {
            duration: 10000,
            description: otherIssues.join('. '),
          });
        }
      } : undefined,
    });
  }

  static operationSuccess(operation: string, entity?: string) {
    const message = entity ? `${entity} ${operation} successfully` : `${operation} completed successfully`;
    return this.success(message);
  }

  static operationError(operation: string, error: any, entity?: string) {
    const context = entity ? `${operation}_${entity}` : operation;
    const errorDetails = createErrorResponse(error, context);
    
    const message = entity 
      ? `Failed to ${operation.toLowerCase()} ${entity.toLowerCase()}`
      : `Failed to ${operation.toLowerCase()}`;
    
    return toast.error(message, {
      duration: 6000,
      description: errorDetails.userMessage,
    });
  }
}

// Export convenient static methods
export const showSuccess = ToastManager.success;
export const showError = ToastManager.error;
export const showWarning = ToastManager.warning;
export const showInfo = ToastManager.info;
export const showLoading = ToastManager.loading;
export const dismissToast = ToastManager.dismiss;