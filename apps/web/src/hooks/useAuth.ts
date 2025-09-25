"use client";

import { useAppSelector } from '@repo/store/hooks';
import { selectRootState } from '@repo/store/store';
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const { user, isAuthenticated, token, role } = useAppSelector((state) => selectRootState(state).userAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The AuthInitializer runs on first load. The loading state should resolve once
    // the Redux state is either authenticated or it's certain there's no session
    // to restore (localStorage has been checked and found empty).
    
    // We determine the loading is finished if the token in the redux store
    // has been checked. If a token exists, the user is authenticated. If it's null,
    // the initialization is also complete.
    const checkAuthStatus = () => {
      // The `token` in the Redux store is the source of truth after initialization.
      // If it's not `undefined` (its initial-initial state before any action), it means
      // either a session was restored or it was confirmed there's no session.
      const hasChecked = state.userAuth.token !== undefined;

      if(isCrmAuthenticated || hasChecked) {
        setIsLoading(false);
      }
    };
    
    // A small timeout helps ensure the AuthInitializer has run.
    const timer = setTimeout(checkAuthStatus, 150);

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
