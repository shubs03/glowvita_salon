
"use client";

import { useAppSelector } from '@repo/store/hooks';
import { selectRootState } from '@repo/store/store';
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const { user, isAuthenticated, token, role } = useAppSelector((state) => selectRootState(state).userAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The initializer component handles the logic. This hook simply reflects the state.
    // We can stop loading once the isAuthenticated flag is definitively set to true or false,
    // which happens after the initializer runs. We use a small timeout to avoid race conditions on initial load.
    const timer = setTimeout(() => {
      // If isAuthenticated is determined, or if there's no token to check, we can stop loading.
      if (isAuthenticated || !token) {
        setIsLoading(false);
      }
    }, 100); // A small delay can help ensure the initial state hydration is complete.

    return () => clearTimeout(timer);
  }, [isAuthenticated, token]);

  return {
    user,
    isAuthenticated,
    token,
    role,
    isLoading,
  };
};
