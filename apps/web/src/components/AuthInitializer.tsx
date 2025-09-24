"use client";

import { useAppDispatch } from '@repo/store/hooks';
import { clearUserAuth, setUserAuth } from '@repo/store/slices/userAuthSlice';
import { useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

export function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const token = Cookies.get('token');
      const storedState = localStorage.getItem('userAuthState');
      
      if (storedState && token) {
        const { user, role } = JSON.parse(storedState);
        const decodedToken: { exp: number } = jwtDecode(token);

        if (user && token && decodedToken.exp * 1000 > Date.now()) {
          dispatch(setUserAuth({ user, token, role }));
        } else {
          // If token is expired or state is malformed, clear everything
          dispatch(clearUserAuth());
          Cookies.remove('token', { path: '/' });
          localStorage.removeItem('userAuthState');
        }
      } else {
        // If no token or stored state, ensure everything is cleared on the client side
        dispatch(clearUserAuth());
      }
    } catch (error) {
      console.error("Failed to process auth state.", error);
      dispatch(clearUserAuth());
    }
  }, [dispatch]);

  return <>{children}</>;
}
