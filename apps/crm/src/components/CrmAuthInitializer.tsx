
"use client";

import { useAppDispatch } from '@repo/store/hooks';
import { clearCrmAuth, setCrmAuth } from "@repo/store/slices/crmAuthSlice";
import { useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

export function CrmAuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('crmAuthState');
      const token = Cookies.get('crm_access_token');
      
      if (storedState && token) {
        const { user, role, permissions } = JSON.parse(storedState);
        const decodedToken: { exp: number } = jwtDecode(token);

        if (decodedToken.exp * 1000 > Date.now()) {
          // Token is valid and not expired
          dispatch(setCrmAuth({ user, token, role, permissions: permissions || [] }));
        } else {
          // Token is expired, clear auth state
          dispatch(clearCrmAuth());
        }
      } else {
        // No stored state or token, ensure it's cleared
        dispatch(clearCrmAuth());
      }
    } catch (error) {
      console.error("Failed to process CRM auth state. Clearing session.", error);
      dispatch(clearCrmAuth());
    }
  }, [dispatch]);

  return <>{children}</>;
}
