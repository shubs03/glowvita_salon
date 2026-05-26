
"use client";

import { useAppDispatch } from '@repo/store/hooks';
import { clearCrmAuth, setCrmAuth } from "@repo/store/slices/crmAuthSlice";
import { useEffect, useState, type ReactNode } from 'react';

/**
 * CrmAuthInitializer — re-hydrates Redux CRM auth state on every page load.
 */
export function CrmAuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedState = localStorage.getItem('crmAuthState');

        if (storedState) {
          // Fast path: localStorage has data
          const parsed = JSON.parse(storedState);
          const { user, token, role, permissions } = parsed;

          if (user && token) {
            // Still verify if the cookie is present by doing a lightweight call
            // This prevents the infinite spinner/redirect loop if the cookie was deleted
            const res = await fetch('/api/crm/auth/profile', {
              method: 'GET',
              credentials: 'include',
            });

            if (res.ok) {
              const data = await res.json();
              if (data.success && data.user) {
                dispatch(setCrmAuth({ 
                  user: data.user, 
                  token: data.token || token, 
                  role: data.role || role, 
                  permissions: data.user.permissions || permissions 
                }));
              } else {
                dispatch(clearCrmAuth());
              }
            } else {
              // 401 or other error — cookie is invalid or expired.
              dispatch(clearCrmAuth());
            }
          } else {
            // Malformed — clear it.
            localStorage.removeItem('crmAuthState');
            dispatch(clearCrmAuth());
          }
        } else {
          // Slow path: localStorage is missing. Check if the httpOnly cookie is still valid
          const res = await fetch('/api/crm/auth/profile', {
            method: 'GET',
            credentials: 'include',
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.user && data.token) {
              dispatch(setCrmAuth({ 
                user: data.user, 
                token: data.token, 
                role: data.role, 
                permissions: data.user.permissions || [] 
              }));
            } else {
              dispatch(clearCrmAuth());
            }
          } else {
            dispatch(clearCrmAuth());
          }
        }
      } catch (error) {
        console.error("CrmAuthInitializer: Failed to restore session.", error);
        dispatch(clearCrmAuth());
      } finally {
        setIsChecking(false);
      }
    };

    initAuth();
  }, [dispatch]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
