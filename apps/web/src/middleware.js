
import { NextResponse } from 'next/server';
import { verifyJwt } from '@repo/lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Allow Next.js assets and API routes to pass through
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // Handle protected routes
  if (pathname.startsWith('/profile')) {
    if (!token) {
      return NextResponse.redirect(new URL('/client-login', request.url));
    }

    try {
      const payload = await verifyJwt(token);
      if (!payload) {
        // Invalid token, clear it and redirect to login
        const response = NextResponse.redirect(new URL('/client-login', request.url));
        response.cookies.set('token', '', { expires: new Date(0), path: '/' });
        return response;
      }
    } catch (error) {
      // Error verifying token (e.g., expired), clear it and redirect
      const response = NextResponse.redirect(new URL('/client-login', request.url));
      response.cookies.set('token', '', { expires: new Date(0), path: '/' });
      return response;
    }
    
    // If we are here, the user is authenticated, allow access to profile pages
    return NextResponse.next();
  }

  // Handle auth pages for already logged-in users
  const authPaths = ['/client-login', '/client-register'];
  if (authPaths.includes(pathname)) {
    if (token) {
      try {
        const payload = await verifyJwt(token);
        if (payload) {
          // If user is logged in, redirect them from login/register to their profile
          return NextResponse.redirect(new URL('/profile', request.url));
        }
      } catch (error) {
        // If token is invalid, let them stay on the auth page
        return NextResponse.next();
      }
    }
  }

  // Allow all other public pages
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
