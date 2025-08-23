
"use client";

import { useAppSelector } from '@repo/store/hooks';
import { selectRootState } from '@repo/store/store';
import { useState, useEffect } from 'react';

// This hook is now specifically for the CRM panel.
export const useCrmAuth = () => {
  const { user, isCrmAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).crmAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The Redux state is now initialized from localStorage by CrmAuthInitializer.
    // The loading state is to prevent flickers while the initial check runs.
    if(isCrmAuthenticated || localStorage.getItem('crmAuthState') === null){
        setIsLoading(false);
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
