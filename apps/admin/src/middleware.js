import { NextResponse } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET_ADMIN = process.env.JWT_SECRET_ADMIN;

async function verifyJwt(token) {
  if (!token || !JWT_SECRET_ADMIN) return null;
  const secret = new TextEncoder().encode(JWT_SECRET_ADMIN);
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (error) {
    // This will catch errors for expired tokens, invalid signatures, etc.
    console.log("Admin JWT Verification Error in Middleware:", error.code);
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('admin_access_token')?.value;

  const isLoginPage = pathname === '/login';

  const payload = await verifyJwt(token);

  if (isLoginPage) {
    // If the user is on the login page and has a valid token, redirect to dashboard
    if (payload) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } else {
    // If the user is on any other page and does NOT have a valid token, redirect to login
    if (!payload) {
      // Clear the invalid cookie if it exists
      const response = NextResponse.redirect(new URL('/login', request.url));
      if (token) {
        response.cookies.set('admin_access_token', '', { expires: new Date(0) });
      }
      return response;
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
