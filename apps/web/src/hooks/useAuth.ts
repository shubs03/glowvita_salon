
"use client";

import { selectRootState } from '../../../../packages/store/src/store';
import { useAppSelector } from '@repo/store/hooks';
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const { user, isAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).userAuth);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The loading state is finished when `isAuthenticated` is no longer `undefined`.
    // This correctly waits for the preloaded state from the store to be applied.
    if (isAuthenticated !== undefined) {
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
