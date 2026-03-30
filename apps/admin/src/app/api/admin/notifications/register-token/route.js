import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import AdminModel from '@repo/lib/models/admin/AdminUser';
import { authMiddlewareAdmin } from '@/middlewareAdmin';

await _db();

export const POST = authMiddlewareAdmin(async (req) => {
    try {
        const { token } = await req.json();
        const userId = req.user._id;

        if (!token) {
            return NextResponse.json({ success: false, message: 'Token is required' }, { status: 400 });
        }

        // Save token to admin user document
        await AdminModel.findByIdAndUpdate(userId, {
            $addToSet: { fcmTokens: token }
        });

        console.log(`[Admin Notification] Token registered for admin: ${userId}`);

        return NextResponse.json({ success: true, message: 'Token registered successfully' });
    } catch (error) {
        console.error("Admin Token Register Error:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"]);
