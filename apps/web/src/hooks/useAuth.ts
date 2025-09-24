"use client";

import { useAppSelector } from '@repo/store/hooks';
import { selectRootState } from '@repo/store/store';
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const { user, isAuthenticated, token, role } = useAppSelector((state) => selectRootState(state).userAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      // The presence of a token in the redux state is a good indicator
      // that rehydration from localStorage has occurred.
      if (token || localStorage.getItem('userAuthState') === null) {
        setIsLoading(false);
      }
    };
    
    // Check immediately and set a small timeout as a fallback.
    checkAuthStatus();
    const timer = setTimeout(checkAuthStatus, 250);

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