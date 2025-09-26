
"use client";

import { useAppSelector } from '@repo/store/hooks';
import { useState, useEffect } from 'react'; 
import { selectRootState } from '../../../../packages/store/src/store';

export const useAuth = () => {
  const { user, isAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).userAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The loading is finished when we know for sure if the user is authenticated or not.
    // `isAuthenticated` starts as `false` and becomes `true` after rehydration.
    // `token` starts as `null` and becomes a string if logged in.
    // The loading should stop once we have a definitive answer (either authenticated or confirmed not authenticated).
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
