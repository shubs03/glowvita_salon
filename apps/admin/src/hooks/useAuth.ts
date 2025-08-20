
"use client";

import { useAppSelector } from '@repo/store/hooks';
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const { admin, isAdminAuthenticated, token } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The Redux state is now initialized from localStorage by AuthInitializer,
    // which also handles token validation.
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
