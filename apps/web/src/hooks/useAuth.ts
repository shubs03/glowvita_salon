
"use client";

import { useAppSelector } from '@repo/store/hooks';
import { selectRootState } from '@repo/store/store';
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const { user, isAuthenticated, token, role } = useAppSelector((state) => selectRootState(state).userAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The loading is finished when the token is no longer `undefined`.
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
    isLoading,
  };
};
