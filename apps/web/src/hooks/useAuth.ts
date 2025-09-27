
"use client";

import { useAppSelector } from '@repo/store/hooks';
import { useState, useEffect } from 'react'; 
import { selectRootState } from '../../../../packages/store/src/store';

export const useAuth = () => {
  const { user, isAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).userAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The loading state is finished when `isAuthenticated` is no longer in its initial `undefined` state.
    // This correctly waits for the preloaded state from the store to be applied.
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
