
import { NextResponse } from 'next/server';
import * as jose from 'jose';
import { vendorNavItems, doctorNavItems, supplierNavItems } from '@/lib/routes';

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

const alwaysAllowedPaths = ['/dashboard', '/salon-profile', '/not-found'];

const getNavItemsForRole = (role) => {
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

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('crm_access_token')?.value;

  const publicPaths = ['/login', '/auth/register', '/', '/apps', '/pricing', '/support'];
  const isPublicPath = publicPaths.some(path => pathname === path);

  if (isPublicPath) {
    return NextResponse.next();
  }

  const payload = await verifyJwt(token);

  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('crm_access_token', '', { expires: new Date(0) });
    return response;
  }

  const role = payload.role;
  const navItems = getNavItemsForRole(role);
  const allowedPaths = [...navItems.map(item => item.href), ...alwaysAllowedPaths];

  // More robust path checking
  const isPathAllowed = allowedPaths.some(allowedPath => {
    // Exact match (e.g., /dashboard)
    if (pathname === allowedPath) return true;
    // Match for dynamic routes (e.g., /calendar/[date])
    if (allowedPath.includes('[') && new RegExp(`^${allowedPath.replace(/\[.*?\]/g, '[^/]+')}$`).test(pathname)) {
        return true;
    }
    // Allow sub-paths only if the base path is not a direct page
    if (pathname.startsWith(allowedPath + '/') && !allowedPaths.includes(pathname)) {
      // This logic prevents /services from being accessible if /service is not defined as a base
      return true;
    }
    return false;
  });

  if (!isPathAllowed) {
    // Using rewrite will show the not-found page content without changing the URL
    return NextResponse.rewrite(new URL('/not-found', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
