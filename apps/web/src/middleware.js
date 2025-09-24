
import { NextResponse } from 'next/server';
import { verifyJwt } from '@repo/lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Public paths accessible to everyone
  const publicPaths = ['/client-login', '/client-register', '/', '/apps', '/pricing', '/support', '/about', '/contact', '/privacy-policy', '/return-policy', '/terms-and-conditions'];
  
  // Check if the path is a public marketing page or an asset/API call
  const isPublicMarketingPath = publicPaths.some(path => pathname === path) || pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.includes('.');
  if (isPublicMarketingPath) {
    return NextResponse.next();
  }
  
  // Handle /login and /signup for authenticated users
  if ((pathname === '/client-login' || pathname === '/client-register') && token) {
    const payload = await verifyJwt(token);
    if (payload) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }
  
  // All other paths are considered protected
  if (!token) {
    return NextResponse.redirect(new URL('/client-login', request.url));
  }

  try {
    const payload = await verifyJwt(token);
    if (!payload) {
      // If token is invalid or expired, redirect to login and clear the cookie
      const response = NextResponse.redirect(new URL('/client-login', request.url));
      response.cookies.set('token', '', { expires: new Date(0) });
      return response;
    }
    // You can add role checks here if needed
    // e.g., if (payload.role !== 'USER') { ... }
  } catch (err) {
    // If JWT verification fails, redirect to login
    const response = NextResponse.redirect(new URL('/client-login', request.url));
    response.cookies.set('token', '', { expires: new Date(0) });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
