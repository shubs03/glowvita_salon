"use client";

import { useAppSelector } from '@repo/store/hooks';
import { selectRootState } from '@repo/store/store';
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const { user, isAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).userAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The authentication check is complete once we know for sure if the user
    // is authenticated OR if we know for sure they are not (token is null).
    // The `undefined` state for the token means we are still waiting for the
    // AuthInitializer/StoreProvider to do its work.
    if (isAuthenticated || token === null) {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  return {
    user,
    isAuthenticated,
    token,
    role,
    permissions,
    isLoading,
  };
};
