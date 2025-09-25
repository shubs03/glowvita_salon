
"use client";

import { useAppSelector } from '@repo/store/hooks';
import { selectRootState } from '@repo/store/store';
import { useState, useEffect } from 'react';

// This hook is now specifically for the CRM panel.
export const useCrmAuth = () => {
  const { user, isCrmAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).crmAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The loading state should resolve as soon as the authentication status is determined.
    // This happens in two main scenarios:
    // 1. On initial load/refresh, the AuthInitializer runs and sets the redux state.
    // 2. After a login action, the login page dispatches setCrmAuth, updating the redux state.

    // If the user is authenticated, we are no longer loading.
    if (isCrmAuthenticated) {
      setIsLoading(false);
      return;
    }

    // If the user is NOT authenticated, we also need to determine when loading is finished.
    // This happens when the initializer has checked localStorage and found nothing,
    // leaving `token` as `null` (not its initial `undefined` state).
    const hasAuthBeenChecked = state => state.crmAuth.token !== undefined;
    const authChecked = hasAuthBeenChecked({ crmAuth: { token } });

    if (!isCrmAuthenticated && authChecked) {
      setIsLoading(false);
    }
    
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
