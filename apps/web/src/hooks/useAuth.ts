"use client";

import { useAppSelector } from '@repo/store/hooks';
import { selectRootState } from '@repo/store/store';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export const useAuth = () => {
  const { user, isAuthenticated, token, role } = useAppSelector((state) => selectRootState(state).userAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The authentication check is complete when we are no longer in the initial `undefined` token state.
    // The loading state should resolve if:
    // 1. The user is successfully authenticated (token is a string).
    // 2. We have checked and there is no token cookie, meaning the user is logged out (token becomes `null`).
    const tokenCookie = Cookies.get('token');
    if (isAuthenticated || !tokenCookie) {
      setIsLoading(false);
    }
    // We only want this effect to re-run when isAuthenticated changes.
    // The token from the store is not a reliable dependency here due to its initial `undefined` state.
  }, [isAuthenticated]);

  return {
    user,
    isAuthenticated,
    token,
    role,
    isLoading,
  };
};
