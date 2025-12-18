import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
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
    staff: Vendor,
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
            return null;
        }

        const secretKey = new TextEncoder().encode(secret);
        const { payload } = await jose.jwtVerify(token, secretKey);
        return payload;
    } catch (error) {
        console.log("JWT Verification Error:", error.code);
        return null;
    }
}

async function generateJwt(payload, role) {
    const secret = JWT_SECRETS[role];
    if (!secret) {
        throw new Error('Invalid role for JWT generation');
    }

    const secretKey = new TextEncoder().encode(secret);
    const token = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secretKey);

    return token;
}

export async function POST(req) {
    try {
        const token = req.cookies.get('crm_access_token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }

        const payload = await verifyJwt(token);

        if (!payload || !payload.userId) {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        await _db();

        const UserModel = MODELS[payload.role];
        if (!UserModel) {
            return NextResponse.json(
                { success: false, message: 'Invalid user role' },
                { status: 403 }
            );
        }

        // Fetch latest user data with subscription info
        const user = await UserModel.findById(payload.userId)
            .select('subscription status email businessName name shopName firstName lastName role')
            .populate('subscription.plan', 'name duration price features')
            .lean();

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Get normalized subscription data
        const subscriptionData = user.subscription ? {
            plan: user.subscription.plan,
            status: user.subscription.status,
            startDate: user.subscription.startDate,
            endDate: user.subscription.endDate,
            isExpired: user.subscription.status?.toLowerCase() === 'expired' ||
                (user.subscription.endDate && new Date(user.subscription.endDate) <= new Date())
        } : null;

        // Create new token with updated subscription data
        const newPayload = {
            userId: payload.userId,
            email: user.email,
            role: payload.role,
            subscription: subscriptionData,
            permissions: payload.permissions || []
        };

        const newToken = await generateJwt(newPayload, payload.role);

        // Set cookie with new token
        const response = NextResponse.json({
            success: true,
            message: 'Token refreshed successfully',
            token: newToken,
            user: {
                ...user,
                subscription: subscriptionData
            }
        });

        // Set the cookie
        response.cookies.set('crm_access_token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        });

        return response;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to refresh token', error: error.message },
            { status: 500 }
        );
    }
}
