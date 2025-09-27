
"use client";

import { selectRootState } from '@repo/store/store.js';
import { useAppSelector } from '@repo/store/hooks';
import { useState, useEffect } from 'react';

// This hook is now specifically for the CRM panel.
export const useCrmAuth = () => {
  const { user, isCrmAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).crmAuth);
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
    isCrmAuthenticated,
    token,
    role,
    permissions,
    isLoading,
  };
};
