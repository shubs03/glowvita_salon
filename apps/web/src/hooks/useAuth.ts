
"use client";

import { useAppSelector } from '@repo/store/hooks';
import { useState, useEffect } from 'react'; 
import { selectRootState } from '../../../../packages/store/src/store';

export const useAuth = () => {
  const { user, isAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).userAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The loading state is finished when the token is no longer `undefined`.
    // It will be `null` if not logged in, or a string if logged in.
    // This covers both initial page load and post-login scenarios correctly.
    if (token !== undefined) {
      setIsLoading(false);
    }
  }, [token]);

  return {
    user,
    isAuthenticated,
    token,
    role,
    permissions,
    isLoading,
  };
};
