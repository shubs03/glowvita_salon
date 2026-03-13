import { NextResponse } from 'next/server';
import { authMiddlewareCrm } from '@/middlewareCrm';
import dbConnect from '@repo/lib/db';
import Notification from '@repo/lib/models/Notification.model';

export const GET = authMiddlewareCrm(async (req) => {
    try {
        await dbConnect();
        
        const userId = req.user.userId;
        const role = req.user.role;

        const notifications = await Notification.find({
            recipient: userId,
            recipientRole: role
        }).sort({ createdAt: -1 }).limit(50);

        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            recipientRole: role,
            isRead: false
        });

        return NextResponse.json({ success: true, notifications, unreadCount });
    } catch (error) {
        console.error("CRM Fetch Notifications Error:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}, ["vendor", "doctor", "supplier", "staff"]);

export const PATCH = authMiddlewareCrm(async (req) => {
    try {
        await dbConnect();
        const { notificationId, markAll } = await req.json();
        const userId = req.user.userId;
        const role = req.user.role;

        if (markAll) {
            await Notification.updateMany(
                { recipient: userId, recipientRole: role, isRead: false },
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
}, ["vendor", "doctor", "supplier", "staff"]);
