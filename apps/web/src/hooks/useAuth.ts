
"use client";

import { selectRootState } from '../../../../packages/store/src/store';
import { useAppSelector } from '@repo/store/hooks';
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const { user, isAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).userAuth);
  
  // The isLoading state now simply reflects whether the auth status has been determined.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // When isAuthenticated changes from its initial `undefined` to a boolean, we know the check is complete.
    if (isAuthenticated === true || isAuthenticated === false) {
      setIsLoading(false);
    }
  }, [isAuthenticated]);


  return {
    user,
    isAuthenticated,
    token,
    role,
    permissions,
    isLoading,
  };
};
