
"use client";

import { useAppSelector } from '@repo/store/hooks';
import { selectRootState } from '@repo/store/store';
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const { admin, isAdminAuthenticated, token } = useAppSelector((state) => selectRootState(state).auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The Redux state is initialized from localStorage, so this effect
    // primarily just handles the loading state on initial mount.
    setIsLoading(false);
  }, []);

  return {
    admin,
    isAdminAuthenticated,
    token,
    isLoading,
  };
};
