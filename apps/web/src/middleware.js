import { NextResponse } from 'next/server';
import { verifyJwt } from '@repo/lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Public paths where authenticated users should not be redirected to dashboard
  const publicPaths = ['/', '/login', '/signup'];
  // Paths where authenticated users should be redirected to dashboard
  const redirectPaths = ['/login', '/signup'];
  
  const isPublicPath = publicPaths.some(path => pathname === path);
  const shouldRedirectToDashboard = redirectPaths.some(path => pathname === path);
  
  if (shouldRedirectToDashboard && token) {
    const payload = await verifyJwt(token);
    if (payload) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const payload = await verifyJwt(token);
      if (!payload) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      // You can add role checks here if needed, e.g., for 'USER' role
      if (payload.role !== 'USER' && payload.role !== 'ADMIN') { // ADMIN can access all
         // For web app, we might allow multiple roles, but for now let's be strict
         // return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (err) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};