"use client";

import { useAppDispatch } from '@repo/store/hooks';
import { clearUserAuth, setUserAuth } from '@repo/store/slices/userAuthSlice';
import { useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

export function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // This effect should only run once on the client-side after initial mount.
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
            return; // Successful rehydration, exit the effect.
          }
        }
      }
      
      // If we reach here, it means no valid token/state was found.
      // The initial state is already "logged out", so no need to dispatch `clearUserAuth`.
      // The useAuth hook will correctly determine the loading state is finished.
      
    } catch (error) {
      console.error("AuthInitializer: Error processing auth state. Clearing session.", error);
      dispatch(clearUserAuth());
    }
  }, [dispatch]);

  return <>{children}</>;
}
