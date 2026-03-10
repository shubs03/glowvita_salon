"use client";

import { useEffect, useState } from 'react';
import { selectRootState } from '../../../../packages/store/src/store';
import { useAppSelector, useAppDispatch } from '@repo/store/hooks';
import { updateUser, setUserAuth, clearUserAuth } from '../../../../packages/store/src/slices/Web/userAuthSlice';

// This hook is specifically for the Web app.
// On every mount it validates the session with the server by calling /api/auth/me.
// This handles ALL three states correctly:
//   1. No localStorage + no cookie  → stays logged out
//   2. No localStorage + valid cookie → re-hydrates Redux from server (cookie-only session)
//   3. localStorage present + cookie expired/gone → clears stale state, logs out
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).userAuth);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      try {
        // Always verify with the server — the httpOnly cookie is the source of truth.
        // This handles the case where localStorage is empty but the cookie is still valid.
        const res = await fetch('/api/auth/me', { method: 'GET', credentials: 'include' });

        if (res.ok) {
          const data = await res.json();
          // Re-hydrate (or confirm) Redux state with fresh data from the server.
          // This works even when localStorage had nothing.
          dispatch(setUserAuth({
            user: data.user,
            token: token || null, // token in Redux may be null if no localStorage; that's fine
            role: data.user?.role || role || 'USER',
            permissions: permissions || [],
          }));
        } else {
          // 401 / 404 / 503 → cookie is missing or invalid.
          // Clear any stale localStorage state if it exists.
          if (isAuthenticated) {
            dispatch(clearUserAuth());
          }
        }
      } catch (err) {
        // Network error: if already authenticated from localStorage, keep it;
        // otherwise stay logged out. Don't clear good state on a network blip.
        console.error('Session validation failed:', err);
      } finally {
        setIsInitialLoading(false);
      }
    };

    validateSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const updateUserData = (userData: any) => {
    dispatch(updateUser(userData));
  };

  return {
    user,
    isAuthenticated: Boolean(isAuthenticated),
    token,
    role,
    permissions,
    isLoading: isInitialLoading,
    updateUser: updateUserData,
  };
};