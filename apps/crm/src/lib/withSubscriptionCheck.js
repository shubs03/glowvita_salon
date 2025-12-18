
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Vendor from '@repo/lib/models/Vendor/Vendor.model';
import Doctor from '@repo/lib/models/Vendor/Docters.model';
import Supplier from '@repo/lib/models/Vendor/Supplier.model';
import * as jose from 'jose';

const JWT_SECRETS = {
  vendor: process.env.JWT_SECRET_VENDOR,
  staff: process.env.JWT_SECRET_VENDOR,
  doctor: process.env.JWT_SECRET_DOCTOR,
  supplier: process.env.JWT_SECRET_SUPPLIER,
};

const MODELS = {
  vendor: Vendor,
  staff: Vendor, // Staff belongs to a vendor
  doctor: Doctor,
  supplier: Supplier,
};

async function verifyJwt(token) {
  if (!token) return null;
  try {
    const decoded = jose.decodeJwt(token);
    const role = decoded.role;
    const secret = JWT_SECRETS[role];

    if (!secret) {
      console.log("JWT Verification Error: No secret for role", role);
      return null;
    }

    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    console.log("JWT Verification Error in withSubscriptionCheck:", error.code);
    return null;
  }
}

export function withSubscriptionCheck(handler) {
  return async function (req, ...args) {
    const token = req.cookies.get('crm_access_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const payload = await verifyJwt(token);

    if (!payload || !payload.userId) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    await connectDB();

    const UserModel = MODELS[payload.role];
    if (!UserModel) {
      return NextResponse.json({ message: 'Invalid user role' }, { status: 403 });
    }

    const user = await UserModel.findById(payload.userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { subscription } = user;
    const now = new Date();

    const isSubExpired = !subscription ||
      (subscription.status?.toLowerCase() === 'expired') ||
      (subscription.endDate && new Date(subscription.endDate).getTime() <= now.getTime());

    if (isSubExpired) {
      // If the subscription is expired but the status is not yet 'expired' in the DB,
      // update it now. This makes the middleware the single source of truth.
      if (subscription && subscription.status?.toLowerCase() !== 'expired') {
        user.subscription.status = 'expired';
        await user.save();
      }
      return NextResponse.json({ message: 'Subscription expired' }, { status: 403 });
    }

    // Attach user to request for the handler
    req.user = payload;

    return handler(req, ...args);
  };
}
