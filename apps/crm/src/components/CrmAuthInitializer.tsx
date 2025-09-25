
"use client";

import { useAppDispatch } from '@repo/store/hooks';
import { clearCrmAuth, setCrmAuth } from "@repo/store/slices/crmAuthSlice";
import { useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

export function CrmAuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // This effect runs only once on the client-side after initial mount.
    try {
      const token = Cookies.get('crm_access_token');
      const storedState = localStorage.getItem('crmAuthState');
      
      if (token && storedState) {
        const decodedToken: { exp: number } = jwtDecode(token);

        if (decodedToken.exp * 1000 > Date.now()) {
          // Token is valid and not expired, rehydrate the state
          const { user, role, permissions } = JSON.parse(storedState);
          if (user && token && role) {
            dispatch(setCrmAuth({ user, token, role, permissions: permissions || [] }));
            return; // Successful rehydration
          }
        }
      }
      
      // If token/state is missing or token is expired, ensure a clean state
      dispatch(clearCrmAuth());
      
    } catch (error) {
      console.error("Failed to process CRM auth state. Clearing session.", error);
      dispatch(clearCrmAuth());
    }
  }, [dispatch]);

  return <>{children}</>;
}
