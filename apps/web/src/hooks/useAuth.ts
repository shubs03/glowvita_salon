
"use client";

import { selectRootState } from '../../../../packages/store/src/store';
import { useAppSelector } from '@repo/store/hooks';
import { useState, useEffect } from 'react';

// This hook is now specifically for the Web app.
export const useAuth = () => {
  const { user, isAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).userAuth);
  
  // The hook is loading if the store hasn't been rehydrated from localStorage yet.
  // `isAuthenticated` being `undefined` is our signal for this initial loading state.
  const isLoading = isAuthenticated === undefined;

  return {
    user,
    isAuthenticated: isAuthenticated === true, // Ensure it's a boolean
    token,
    role,
    permissions,
    isLoading,
  };
};
