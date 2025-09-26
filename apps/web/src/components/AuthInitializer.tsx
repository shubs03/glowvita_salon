"use client";

import { useAppDispatch } from '@repo/store/hooks';
import { clearUserAuth, setUserAuth } from "@repo/store/slices/Web/userAuthSlice";
import { useEffect, type ReactNode } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

// This component handles rehydrating the Redux state from localStorage on the client side.
export function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // This effect runs only once on the client-side after initial mount.
    try {
      const token = Cookies.get('token');
      const storedState = localStorage.getItem('userAuthState');
      
      if (token && storedState) {
        const decodedToken: { exp: number } = jwtDecode(token);

        if (decodedToken.exp * 1000 > Date.now()) {
          // Token is valid and not expired, rehydrate the state
          const { user, role, permissions } = JSON.parse(storedState);
          if (user && token && role) {
            dispatch(setUserAuth({ user, token, role, permissions: permissions || [] }));
            return; // Successful rehydration
          }
        }
      }
      
      // If token/state is missing or token is expired, ensure a clean state
      dispatch(clearUserAuth());
      
    } catch (error) {
      console.error("Failed to process auth state. Clearing session.", error);
      dispatch(clearUserAuth());
    }
  }, [dispatch]);

  return <>{children}</>;
}
