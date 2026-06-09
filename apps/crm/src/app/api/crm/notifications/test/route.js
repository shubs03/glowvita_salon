import { NextResponse } from 'next/server';
import { authMiddlewareCrm } from '@/middlewareCrm';
import { NotificationService } from '@repo/lib';
import _db from '@repo/lib/db';

await _db();

export const POST = authMiddlewareCrm(async (req) => {
  try {
    const userId = req.user.userId;

    await NotificationService.sendToUser(userId, 'vendor', {
      title: 'CMS Alert: Notification Test 🚀',
      body: 'Verified! You are now connected to the GlowVita salon notification stream.',
      data: { type: 'test', url: '/dashboard' }
    });

    return NextResponse.json({ success: true, message: 'Test notification sent to vendor' });
  } catch (error) {
    console.error('CRM Test Notification Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}, ['vendor', 'staff', 'supplier']);
