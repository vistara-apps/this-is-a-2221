/**
 * useErrorHandler Hook
 * 
 * This hook provides functionality for handling errors and displaying
 * appropriate error messages to the user.
 */

import { useState, useCallback } from 'react';

interface ErrorOptions {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useErrorHandler() {
  const [errors, setErrors] = useState<ErrorOptions[]>([]);
  
  /**
   * Show an error message
   */
  const showError = useCallback((options: ErrorOptions) => {
    const errorWithDefaults: ErrorOptions = {
      title: options.title || 'Error',
      message: options.message,
      type: options.type || 'error',
      duration: options.duration || 5000,
      action: options.action,
    };
    
    setErrors(prev => [...prev, errorWithDefaults]);
    
    // Automatically dismiss after duration
    if (errorWithDefaults.duration && errorWithDefaults.duration > 0) {
      setTimeout(() => {
        dismissError(errorWithDefaults);
      }, errorWithDefaults.duration);
    }
    
    return errorWithDefaults;
  }, []);
  
  /**
   * Dismiss an error message
   */
  const dismissError = useCallback((error: ErrorOptions) => {
    setErrors(prev => prev.filter(e => e !== error));
  }, []);
  
  /**
   * Dismiss all error messages
   */
  const dismissAllErrors = useCallback(() => {
    setErrors([]);
  }, []);
  
  /**
   * Handle an error from a try/catch block
   */
  const handleError = useCallback((error: any, customMessage?: string) => {
    const errorMessage = customMessage || error.message || 'An unexpected error occurred';
    
    showError({
      message: errorMessage,
      type: 'error',
    });
    
    // Log the error to console for debugging
    console.error('Error:', error);
  }, [showError]);
  
  /**
   * Create an error handler for a specific operation
   */
  const createErrorHandler = useCallback((operation: string) => {
    return (error: any) => {
      handleError(error, `Error during ${operation}: ${error.message || 'An unexpected error occurred'}`);
    };
  }, [handleError]);
  
  return {
    errors,
    showError,
    dismissError,
    dismissAllErrors,
    handleError,
    createErrorHandler,
  };
}
