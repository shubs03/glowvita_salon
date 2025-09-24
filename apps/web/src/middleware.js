
import { NextResponse } from 'next/server';
import { verifyJwt } from '@repo/lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Define public paths that do not require authentication
  const publicPaths = [
    '/client-login', 
    '/client-register', 
    '/', 
    '/apps', 
    '/pricing', 
    '/support', 
    '/about', 
    '/contact', 
    '/privacy-policy', 
    '/return-policy', 
    '/terms-and-conditions'
  ];

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
        const response = NextResponse.redirect(new URL('/client-login', request.url));
        response.cookies.set('token', '', { expires: new Date(0), path: '/' });
        return response;
      }
    } catch (error) {
      const response = NextResponse.redirect(new URL('/client-login', request.url));
      response.cookies.set('token', '', { expires: new Date(0), path: '/' });
      return response;
    }

    return NextResponse.next();
  }

  // Handle auth pages for logged-in users
  if (publicPaths.includes(pathname) && token) {
    try {
      const payload = await verifyJwt(token);
      if (payload && (pathname === '/client-login' || pathname === '/client-register')) {
        // If user is logged in and tries to access login/register, redirect to profile
        return NextResponse.redirect(new URL('/profile', request.url));
      }
    } catch (error) {
      // If token is invalid, let them stay on the public page
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
