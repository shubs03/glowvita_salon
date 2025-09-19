
import { NextResponse } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET_VENDOR = process.env.JWT_SECRET_VENDOR;
const JWT_SECRET_DOCTOR = process.env.JWT_SECRET_DOCTOR;
const JWT_SECRET_SUPPLIER = process.env.JWT_SECRET_SUPPLIER;

async function verifyJwt(token) {
  if (!token) return null;
  
  try {
    const decoded = jose.decodeJwt(token);
    const role = decoded.role;
    
    let secret;
    switch (role) {
      case 'vendor':
      case 'staff':
        secret = JWT_SECRET_VENDOR;
        break;
      case 'doctor':
        secret = JWT_SECRET_DOCTOR;
        break;
      case 'supplier':
        secret = JWT_SECRET_SUPPLIER;
        break;
      default:
        return null;
    }
    
    if (!secret) {
      console.log("CRM JWT Verification Error in Middleware: No secret for role", role);
      return null;
    }
    
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    console.log("CRM JWT Verification Error in Middleware:", error.code);
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('crm_access_token')?.value;

  const publicPaths = ['/login', '/auth/register', '/', '/apps', '/pricing', '/support'];
  const isPublicPath = publicPaths.some(path => pathname === path);

  if (isPublicPath) {
    return NextResponse.next();
  }

  const payload = await verifyJwt(token);

  // If on a protected page and token is invalid, redirect to login
  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('crm_access_token', '', { expires: new Date(0) });
    return response;
  }
  
  // Route protection logic is now handled client-side in CrmLayout.tsx
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
