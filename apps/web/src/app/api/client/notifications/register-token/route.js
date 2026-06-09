import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@repo/lib/auth';
import dbConnect from '@repo/lib/db';
import User from '@repo/lib/models/user';

export async function POST(req) {
    try {
        await dbConnect();
        
        const token = cookies().get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyJwt(token);
        if (!payload || !payload.userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const fcmToken = body.token;

        if (!fcmToken) {
            return NextResponse.json({ message: "Token is required" }, { status: 400 });
        }

        // Add token to fcmTokens array if not already present
        await User.findByIdAndUpdate(payload.userId, {
            $addToSet: { fcmTokens: fcmToken }
        });

        return NextResponse.json({ message: "Token registered successfully" }, { status: 200 });
    } catch (error) {
        console.error("Token Registration Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
