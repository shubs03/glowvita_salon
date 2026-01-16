"use client";

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAppSelector } from '@repo/store/hooks';

/**
 * Global error handler for API responses
 * Shows user-friendly toast messages for common errors
 */
export function useApiErrorHandler() {
  const { isAdminAuthenticated } = useAppSelector((state: any) => state.adminAuth);

  useEffect(() => {
    // Intercept fetch responses globally
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Clone response to read it without consuming the original
        const clonedResponse = response.clone();
        
        // Only handle JSON responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const data = await clonedResponse.json();
            
            // Handle 403 Forbidden errors
            if (response.status === 403 && data.code === 'FORBIDDEN') {
              toast.error(data.message || 'You do not have permission to perform this action', {
                duration: 4000,
              });
            }
            
            // Handle 401 Unauthorized errors
            if (response.status === 401) {
              toast.error('Your session has expired. Please login again.', {
                duration: 4000,
              });
            }
            
            // Handle 500 Server errors
            if (response.status === 500) {
              toast.error('An unexpected error occurred. Please try again later.', {
                duration: 4000,
              });
            }
          } catch (e) {
            // Not JSON or already consumed, ignore
          }
        }
        
        return response;
      } catch (error) {
        // Network error
        toast.error('Network error. Please check your connection.', {
          duration: 4000,
        });
        throw error;
      }
    };

    // Cleanup
    return () => {
      window.fetch = originalFetch;
    };
  }, [isAdminAuthenticated]);

  return null;
}
