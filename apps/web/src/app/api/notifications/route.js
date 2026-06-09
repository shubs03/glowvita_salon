import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@repo/lib/auth';
import dbConnect from '@repo/lib/db';
import Notification from '@repo/lib/models/Notification.model';

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

        const notifications = await Notification.find({
            recipient: payload.userId,
            recipientRole: 'client'
        }).sort({ createdAt: -1 }).limit(50);

        const unreadCount = await Notification.countDocuments({
            recipient: payload.userId,
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

        if (markAll) {
            await Notification.updateMany(
                { recipient: payload.userId, recipientRole: 'client', isRead: false },
                { isRead: true }
            );
        } else if (notificationId) {
            await Notification.findOneAndUpdate(
                { _id: notificationId, recipient: payload.userId },
                { isRead: true }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
