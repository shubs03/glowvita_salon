import { NextResponse } from 'next/server';
import { authMiddlewareAdmin } from '@/middlewareAdmin';
import dbConnect from '@repo/lib/db';
import Notification from '@repo/lib/models/Notification.model';

export const GET = authMiddlewareAdmin(async (req) => {
    try {
        await dbConnect();
        
        const userId = req.user._id;

        const notifications = await Notification.find({
            recipient: userId,
            recipientRole: 'admin'
        }).sort({ createdAt: -1 }).limit(50);

        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            recipientRole: 'admin',
            isRead: false
        });

        return NextResponse.json({ success: true, notifications, unreadCount });
    } catch (error) {
        console.error("Admin Fetch Notifications Error:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
});

export const PATCH = authMiddlewareAdmin(async (req) => {
    try {
        await dbConnect();
        const { notificationId, markAll } = await req.json();
        const userId = req.user._id;

        if (markAll) {
            await Notification.updateMany(
                { recipient: userId, recipientRole: 'admin', isRead: false },
                { isRead: true }
            );
        } else if (notificationId) {
            await Notification.findOneAndUpdate(
                { _id: notificationId, recipient: userId },
                { isRead: true }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
});
