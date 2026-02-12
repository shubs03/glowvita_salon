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

const alwaysAllowedPaths = ['/dashboard', '/profile', '/not-found'];

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

  const publicPaths = ['/login', '/auth/register', '/', '/apps', '/pricing', '/support', '/forgot-password', '/reset-password', '/about'];
  const isPublicPath = publicPaths.some(path => pathname === path);

  // Allow static files and Next.js internal assets
  if (pathname.includes('.') || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

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

  const { role, permissions } = payload;
  const navItems = getNavItemsForRole(role);

  // Find the required permission for the current route
  const requiredPermission = navItems.find(item => pathname.startsWith(item.href) && item.href !== '/')?.permission;

  // Always allow dashboard and profile pages for any authenticated user
  const isAlwaysAllowed = alwaysAllowedPaths.some(path => pathname.startsWith(path));

  if (isAlwaysAllowed) {
    return NextResponse.next();
  }

  // If a permission is required for the route, check if the user has it
  if (requiredPermission) {
    const userPermissions = permissions || [];
    if (!userPermissions.includes(requiredPermission)) {
      // If user doesn't have permission, redirect to a 'not-found' or 'unauthorized' page
      return NextResponse.redirect(new URL('/not-found', request.url));
    }
  } else if (pathname !== '/') {
    // If the path is not in the nav items and not always allowed, it's not found
    // This is a safety net for routes not defined in `lib/routes.ts`
    return NextResponse.redirect(new URL('/not-found', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
