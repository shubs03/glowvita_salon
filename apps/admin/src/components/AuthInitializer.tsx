
"use client";

import { useAppDispatch } from '@repo/store/hooks';
import { clearAdminAuth, setAdminAuth } from "@repo/store/slices/adminAuthSlice";
import { useEffect, useState, type ReactNode } from 'react';

/**
 * AuthInitializer — re-hydrates Redux admin auth state on every page load.
 *
 * Handles two scenarios:
 *
 * 1. localStorage HAS `adminAuthState`
 *    → Fast path: restore directly from it (no network call needed).
 *
 * 2. localStorage is MISSING but the httpOnly cookie may still be valid
 *    (e.g. user manually cleared localStorage, browser cleared it, etc.)
 *    → Slow path: call GET /api/admin/auth/me which uses the httpOnly cookie.
 *      • 200 → valid session — restore state from the response (real token included).
 *      • 401 → cookie is gone/expired → clearAdminAuth and let middleware redirect.
 *
 * While the async check is in-flight, renders a full-screen spinner so that
 * AdminLayout / useAuth never race against an unresolved auth state.
 */
export function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedState = localStorage.getItem('adminAuthState');

        if (storedState) {
          // ── Fast path ──────────────────────────────────────────────────────
          // localStorage has data — restore immediately, no network call.
          const parsed = JSON.parse(storedState);
          const { admin, token } = parsed;

          if (admin && token) {
            dispatch(setAdminAuth({ user: admin, token }));
          } else {
            // Malformed — clear it.
            localStorage.removeItem('adminAuthState');
            dispatch(clearAdminAuth());
          }
        } else {
          // ── Slow path ──────────────────────────────────────────────────────
          // localStorage is missing. Check if the httpOnly cookie is still valid
          // by hitting the protected /me endpoint (the browser sends the cookie
          // automatically via credentials:'include').
          const res = await fetch('/api/admin/auth/me', {
            method: 'GET',
            credentials: 'include',
          });

          if (res.ok) {
            const data = await res.json();

            if (data.success && data.user && data.token) {
              // Cookie is valid — restore full session including the real token.
              // setAdminAuth also persists this back to localStorage so the next
              // page load uses the fast path again.
              dispatch(setAdminAuth({ user: data.user, token: data.token }));
            } else {
              // Unexpected response shape — clear everything.
              dispatch(clearAdminAuth());
            }
          } else {
            // 401 / other error — cookie is invalid or expired.
            dispatch(clearAdminAuth());
          }
        }
      } catch (error) {
        console.error("AuthInitializer: Failed to restore session.", error);
        dispatch(clearAdminAuth());
      } finally {
        setIsChecking(false);
      }
    };

    initAuth();
  }, [dispatch]);

  // Block rendering until we know the auth state.
  // This prevents AdminLayout from flashing a blank screen or briefly redirecting.
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
