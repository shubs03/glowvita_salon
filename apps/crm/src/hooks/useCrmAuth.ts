
"use client";

import { selectRootState } from '@repo/store';
import { useAppSelector } from '@repo/store/hooks';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { clearCrmAuth } from '@repo/store/slices/crmAuthSlice';

/**
 * useCrmAuth — Hook to access CRM authentication state.
 * Note: CrmAuthInitializer handles the initial async verification and blocks 
 * rendering with a spinner until the auth state is definitive.
 */
export const useCrmAuth = () => {
  const { user, isCrmAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).crmAuth);
  const dispatch = useDispatch();
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // isCrmAuthenticated is definitive once CrmAuthInitializer completes.
    if (isCrmAuthenticated === true || isCrmAuthenticated === false) {
      setIsLoading(false);
    }
  }, [isCrmAuthenticated]);

  const logout = () => {
    dispatch(clearCrmAuth());
  };

  return {
    user,
    isCrmAuthenticated,
    token,
    role,
    permissions,
    isLoading,
    logout,
  };
};
