
"use client";

import { useAppSelector } from '@repo/store/hooks';
import { useState, useEffect } from 'react'; 
import { selectRootState } from '../../../../packages/store/src/store';

export const useAuth = () => {
  const { user, isAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).userAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The loading state should resolve once `isAuthenticated` has a definite value (true or false).
    // The initial state from the server might be `false`, but the store rehydration from localStorage
    // will update it on the client. This effect waits for that client-side update.
    if (typeof isAuthenticated === 'boolean') {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  return {
    user,
    isAuthenticated,
    token,
    role,
    permissions,
    isLoading,
  };
};

