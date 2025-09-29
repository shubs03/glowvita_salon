
"use client";

import { useAppSelector } from '@repo/store/hooks';
import { selectRootState } from '@repo/store';
import { useState, useEffect } from 'react';

// This hook is now specifically for the Admin panel.
export const useAuth = () => {
  const { admin, isAdminAuthenticated, token } = useAppSelector((state) => selectRootState(state).adminAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The Redux state is now initialized from localStorage by AuthInitializer.
    // The loading state is to prevent flickers while the initial check runs.
    if(isAdminAuthenticated || localStorage.getItem('adminAuthState') === null){
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
