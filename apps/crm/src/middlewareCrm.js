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

// Create a higher-order function for authenticated routes
export function authMiddlewareCrm(handler, allowedRoles = []) {
  return async (request, context) => {
    const token = request.cookies.get('crm_access_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyJwt(token);
    
    if (!payload) {
      // Don't immediately clear the cookie as it may be a transient error
      // Just return an auth error response
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if user role is in allowed roles (if specified)
    if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Attach user info to request
    request.user = payload;
    
    // Call the original handler
    return await handler(request, context);
  };
}