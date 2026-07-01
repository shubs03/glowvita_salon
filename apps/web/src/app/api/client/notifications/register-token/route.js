import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@repo/lib/auth';
import dbConnect from '@repo/lib/db';
import DeviceToken from '@repo/lib/models/DeviceToken.model';

export async function POST(req) {
    try {
        await dbConnect();
        
        const body = await req.json();
        const fcmToken = body.token;

        if (!fcmToken) {
            return NextResponse.json({ message: "Token is required" }, { status: 400 });
        }

        let userId = null;
        let userType = null;

        const token = cookies().get('token')?.value;
        if (token) {
            try {
                const payload = await verifyJwt(token);
                if (payload && payload.userId) {
                    userId = payload.userId;
                    userType = 'client';
                }
            } catch (err) {
                // Ignore invalid JWT tokens, register as guest
            }
        }

        // Register or reassign token
        await DeviceToken.findOneAndUpdate(
            { token: fcmToken },
            {
                userId,
                userType,
                isActive: true
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ message: "Token registered successfully" }, { status: 200 });
    } catch (error) {
        console.error("Token Registration Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
