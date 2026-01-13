import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';
import { vendorNavItems, doctorNavItems, supplierNavItems } from '@/lib/routes';

const JWT_SECRET_VENDOR = process.env.JWT_SECRET_VENDOR;
const JWT_SECRET_DOCTOR = process.env.JWT_SECRET_DOCTOR;
const JWT_SECRET_SUPPLIER = process.env.JWT_SECRET_SUPPLIER;

async function verifyJwt(token: string | undefined): Promise<any> {
  if (!token) return null;
  
  try {
    const decoded = jose.decodeJwt(token);
    const role = decoded.role;
    
    let secret: string | undefined;
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
  } catch (error: any) {
    console.log("CRM JWT Verification Error in Middleware:", error.code);
    return null;
  }
}

const alwaysAllowedPaths = ['/dashboard', '/salon-profile', '/not-found'];

const getNavItemsForRole = (role: string) => {
    switch (role) {
      case 'vendor':
      case 'staff':
        return vendorNavItems;
      case 'doctor':
        return doctorNavItems;
      case 'supplier':
        return supplierNavItems;
      default:
        return [];
    }
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('crm_access_token')?.value;

  const publicPaths = ['/login', '/auth/register', '/', '/apps', '/pricing', '/support', '/forgot-password', '/reset-password', '/about'];
  const isPublicPath = publicPaths.some(path => pathname === path);

  if (isPublicPath) {
    return NextResponse.next();
  }

  const payload = await verifyJwt(token);

  if (!payload) {
    // Check if token is empty/missing or if it's malformed
    if (!token || token.trim() === '' || token.split('.').length !== 3) {
      // This is a legitimate authentication issue - redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.set('crm_access_token', '', { expires: new Date(0) });
      return response;
    }
    
    // For other verification errors, try once more before clearing
    console.log("Token verification failed but not clearing cookie");
    return NextResponse.redirect(new URL('/not-found', request.url));
  }

  const role = payload.role;
  const navItems = getNavItemsForRole(role);
  const allowedPaths = [...navItems.map(item => item.href), ...alwaysAllowedPaths];

  const isPathAllowed = allowedPaths.some(allowedPath => {
    if (pathname === allowedPath) return true;
    if (allowedPath !== '/' && pathname.startsWith(allowedPath + '/')) {
      return true;
    }
    return false;
  });

  if (!isPathAllowed) {
    // Redirect to the not-found page if the path is not authorized
    return NextResponse.redirect(new URL('/not-found', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};