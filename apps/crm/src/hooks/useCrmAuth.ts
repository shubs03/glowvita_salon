
"use client";

import { useAppSelector } from '@repo/store/hooks';
import { selectRootState } from '@repo/store/store';
import { useState, useEffect } from 'react';

// This hook is now specifically for the CRM panel.
export const useCrmAuth = () => {
  const { user, isCrmAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).crmAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The CrmAuthInitializer runs and sets the state from localStorage.
    // This effect listens for that change. Once isCrmAuthenticated becomes true,
    // or if the app determines there's no stored session (and isCrmAuthenticated remains false),
    // we can stop loading.
    if (isCrmAuthenticated) {
      setIsLoading(false);
    } else {
      // Check if there is a stored auth state to wait for.
      // If not, we can also stop loading.
      if (typeof window !== 'undefined' && !localStorage.getItem('crmAuthState')) {
        setIsLoading(false);
      }
    }
  }, [isCrmAuthenticated]);

  return {
    user,
    isCrmAuthenticated,
    token,
    role,
    permissions,
    isLoading,
  };
};
