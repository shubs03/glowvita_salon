
"use client";

import { useAppSelector } from '@repo/store/hooks';
import { selectRootState } from '@repo/store/store';
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const { user, isAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).userAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The authentication check is complete only when we know for sure if the user
    // is logged in or not. `token` starts as `undefined`, becomes `null` for logged-out
    // users, or a string for logged-in users. This effect will set loading to false
    // only when the final status is known.
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
