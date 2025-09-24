
"use client";

import { useAppSelector } from '@repo/store/hooks';
import { selectRootState } from '@repo/store/store';
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const { user, isAuthenticated, token, role } = useAppSelector((state) => selectRootState(state).userAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The middleware handles redirection. This hook's loading state is for the client-side,
    // to prevent rendering content for a logged-out user before a potential redirect.
    if (typeof window !== 'undefined') {
      const storedState = localStorage.getItem('userAuthState');
      // Stop loading if auth state is confirmed (true or false), or if there's no stored state to wait for.
      if (isAuthenticated || storedState === null) {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated]);

  return {
    user,
    isAuthenticated,
    token,
    role,
    isLoading,
  };
};
