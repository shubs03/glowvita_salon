"use client";

import { useAppSelector } from '@repo/store/hooks';
import { selectRootState } from '@repo/store/store';
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const { user, isAuthenticated, token, role } = useAppSelector((state) => selectRootState(state).userAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The AuthInitializer runs on first load. We can consider loading finished
    // once the Redux state has been populated (token is present) or it's clear
    // there is no session to restore (localStorage check is done and token is null).
    const hasChecked = !!token || localStorage.getItem('userAuthState') === null;

    if (hasChecked || isAuthenticated) {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  return {
    user,
    isAuthenticated,
    token,
    role,
    isLoading,
  };
};
