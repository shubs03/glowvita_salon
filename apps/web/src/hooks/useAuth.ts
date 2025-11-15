"use client";

import { useEffect, useState } from 'react';
import { selectRootState } from '../../../../packages/store/src/store';
import { useAppSelector, useAppDispatch } from '@repo/store/hooks';
import { updateUser } from '../../../../packages/store/src/slices/Web/userAuthSlice';

// This hook is now specifically for the Web app.
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).userAuth);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  useEffect(() => {
    // Check if we have loaded the initial state
    if (isAuthenticated !== undefined) {
      setIsInitialLoading(false);
    }
  }, [isAuthenticated]);

  const updateUserData = (userData: any) => {
    dispatch(updateUser(userData));
  };

  return {
    user,
    isAuthenticated: Boolean(isAuthenticated), // Ensure it's a boolean
    token,
    role,
    permissions,
    isLoading: isInitialLoading,
    updateUser: updateUserData,
  };
};