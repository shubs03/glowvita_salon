
"use client";

import { selectRootState } from '@repo/store/store.js';
import { useAppSelector } from '@repo/store/hooks';
import { useState, useEffect } from 'react';

// This hook is now specifically for the CRM panel.
export const useCrmAuth = () => {
  const { user, isCrmAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).crmAuth);
  
  // The hook is loading if the store hasn't been rehydrated from localStorage yet.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The loading state is finished when `isCrmAuthenticated` is no longer in its initial `undefined` state.
    // This correctly waits for the preloaded state from the store to be applied.
    if (isCrmAuthenticated !== undefined) {
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
