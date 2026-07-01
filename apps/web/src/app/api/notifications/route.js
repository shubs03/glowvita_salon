import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@repo/lib/auth';
import dbConnect from '@repo/lib/db';
import Notification from '@repo/lib/models/Notification.model';
import mongoose from 'mongoose';

// Helper: cast a string userId to ObjectId if valid, fallback to raw string
function toObjectId(id) {
    try {
        if (id && mongoose.Types.ObjectId.isValid(id.toString())) {
            return new mongoose.Types.ObjectId(id.toString());
        }
    } catch (_) {}
    return id;
}

export async function GET(req) {
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

        const recipientId = toObjectId(payload.userId);

        const notifications = await Notification.find({
            recipient: recipientId,
            recipientRole: 'client'
        }).sort({ createdAt: -1 }).limit(50);

        const unreadCount = await Notification.countDocuments({
            recipient: recipientId,
            recipientRole: 'client',
            isRead: false
        });

        return NextResponse.json({ success: true, notifications, unreadCount });
    } catch (error) {
        console.error("Fetch Notifications Error:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        await dbConnect();
        
        const token = cookies().get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyJwt(token);
        const { notificationId, markAll } = await req.json();

        const recipientId = toObjectId(payload.userId);

        if (markAll) {
            await Notification.updateMany(
                { recipient: recipientId, recipientRole: 'client', isRead: false },
                { isRead: true }
            );
        } else if (notificationId) {
            await Notification.findOneAndUpdate(
                { _id: notificationId, recipient: recipientId },
                { isRead: true }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
