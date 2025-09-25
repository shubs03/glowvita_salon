"use client";

import { useAppDispatch } from '@repo/store/hooks';
import { clearUserAuth, setUserAuth } from '@repo/store/slices/userAuthSlice';
import { useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

export function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = Cookies.get('token');
    const storedState = localStorage.getItem('userAuthState');

    if (token && storedState) {
      try {
        const decodedToken: { exp: number } = jwtDecode(token);
        if (decodedToken.exp * 1000 > Date.now()) {
          // Token is valid and not expired, rehydrate the state
          const { user, role, permissions } = JSON.parse(storedState);
          if (user && token && role) {
            dispatch(setUserAuth({ user, token, role, permissions: permissions || [] }));
            return; // Successful rehydration, stop here
          }
        }
      } catch (error) {
        console.error("AuthInitializer: Error decoding token or parsing state.", error);
        // Fall through to clear auth if there's any error
      }
    }

    // If there's no token, no stored state, or if the token is invalid/expired,
    // ensure we are in a clean, logged-out state.
    dispatch(clearUserAuth());
    
  }, [dispatch]);

  return <>{children}</>;
}
