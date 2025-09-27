
"use client";

import { useAppSelector } from '@repo/store/hooks';
import { useState, useEffect } from 'react'; 
import { selectRootState } from '../../../../packages/store/src/store';

export const useAuth = () => {
  const { user, isAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).userAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The loading state is finished when `isAuthenticated` is no longer in its initial `undefined` state.
    // The store's preloadedState will set this to true/false from localStorage on the very first client-side render.
    // This correctly waits for the rehydration to complete.
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
