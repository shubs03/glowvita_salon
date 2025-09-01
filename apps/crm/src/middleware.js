
import { NextResponse } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET_VENDOR = process.env.JWT_SECRET_VENDOR;
const JWT_SECRET_DOCTOR = process.env.JWT_SECRET_DOCTOR;
const JWT_SECRET_SUPPLIER = process.env.JWT_SECRET_SUPPLIER;

async function verifyJwt(token) {
  if (!token) return null;
  
  // Try to decode the token first to get the role
  try {
    const decoded = jose.decodeJwt(token);
    const role = decoded.role;
    
    // Select the appropriate secret based on role
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
        secret = JWT_SECRET_VENDOR; // fallback
    }
    
    if (!secret) {
      console.log("CRM JWT Verification Error in Middleware: No secret for role", role);
      return null;
    }
    
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jose.jwtVerify(token, secretKey);
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
