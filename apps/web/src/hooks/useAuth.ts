"use client";

import { useEffect, useState } from 'react';
import { selectRootState } from '../../../../packages/store/src/store';
import { useAppSelector } from '@repo/store/hooks';

// This hook is now specifically for the Web app.
export const useAuth = () => {
  const { user, isAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).userAuth);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  useEffect(() => {
    // Check if we have loaded the initial state
    if (isAuthenticated !== undefined) {
      setIsInitialLoading(false);
    }
  }, [isAuthenticated]);

  return {
    user,
    isAuthenticated: Boolean(isAuthenticated), // Ensure it's a boolean
    token,
    role,
    permissions,
    isLoading: isInitialLoading,
  };
};
