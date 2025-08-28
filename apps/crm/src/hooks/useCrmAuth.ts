
"use client";

import { useAppSelector } from '@repo/store/hooks';
import { selectRootState } from '@repo/store/store';
import { useState, useEffect } from 'react';

// This hook is now specifically for the CRM panel.
export const useCrmAuth = () => {
  const { user, isCrmAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).crmAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect now correctly handles the initial loading state.
    // It will stop loading once the authentication state is either confirmed
    // (isCrmAuthenticated is true) or it's clear that there's no session
    // to restore (localStorage has been checked by the initializer).
    const checkAuthStatus = () => {
      // The presence of a token in the redux state is a good indicator
      // that rehydration has occurred.
      if (token || localStorage.getItem('crmAuthState') === null) {
        setIsLoading(false);
      }
    };
    
    // Check immediately and also set a small timeout as a fallback
    // to give the initializer time to run.
    checkAuthStatus();
    const timer = setTimeout(checkAuthStatus, 250);

    return () => clearTimeout(timer);

  }, [isCrmAuthenticated, token]);

  return {
    user,
    isCrmAuthenticated,
    token,
    role,
    permissions,
    isLoading,
  };
};
