
import { NextResponse } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET_VENDOR = process.env.JWT_SECRET_VENDOR;

async function verifyJwt(token) {
  if (!token || !JWT_SECRET_VENDOR) return null;
  
  // We cannot dynamically select the secret in the middleware as we don't know the role
  // before decoding. For page protection, we will use the vendor secret as the primary
  // one. The API middleware will handle more granular role checks.
  const secret = new TextEncoder().encode(JWT_SECRET_VENDOR);
  
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (error) {
    // Catches expired tokens, invalid signatures etc.
    console.log("CRM JWT Verification Error in Middleware:", error.code);
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('crm_access_token')?.value;

  const publicPaths = ['/login', '/auth/register', '/', '/apps', '/pricing', '/support'];
  const isPublicPath = publicPaths.some(path => pathname === path);
  const isPanelPage = !isPublicPath;
  
  const payload = await verifyJwt(token);

  if (isPublicPath) {
    // If on a public page with a valid token, allow access but don't redirect.
    // User might want to see marketing pages while logged in.
    return NextResponse.next();
  }
  
  if (isPanelPage) {
    // If on a panel page and token is invalid/expired, redirect to login
    if (!payload) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.set('crm_access_token', '', { expires: new Date(0) });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
