
"use client";

import { useAppSelector } from '@repo/store/hooks';
import { selectRootState } from '@repo/store/store';
import { useState, useEffect } from 'react';

// This hook is specifically for the Admin panel.
// Note: AuthInitializer already handles the async auth determination and renders
// a spinner while in-flight. By the time this hook is first called, isAdminAuthenticated
// will already be a concrete boolean (true or false), not in a loading state.
// The isLoading flag here is a secondary safety net for any edge cases.
export const useAuth = () => {
  const { admin, isAdminAuthenticated, token } = useAppSelector((state) => selectRootState(state).adminAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // isAdminAuthenticated is always a boolean when this effect runs because
    // AuthInitializer has already completed its async check before rendering children.
    // We resolve immediately on either true or false.
    if (isAdminAuthenticated === true || isAdminAuthenticated === false) {
      setIsLoading(false);
    }
  }, [isAdminAuthenticated]);

  return {
    admin,
    isAdminAuthenticated,
    token,
    isLoading,
  };
};
