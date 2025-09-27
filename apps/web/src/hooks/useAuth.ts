
"use client";

import { useAppSelector } from '@repo/store/hooks';
import { useState, useEffect } from 'react'; 
import { selectRootState } from '../../../../packages/store/src/store';

export const useAuth = () => {
  const { user, isAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).userAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The loading state is finished when `isAuthenticated` has a definite value (true or false),
    // which happens after the store is rehydrated from localStorage by the AuthInitializer.
    // We check specifically for boolean type to distinguish from the initial `undefined` value.
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
