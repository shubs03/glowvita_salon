import { NextResponse } from 'next/server';
import { verifyJwt } from '@repo/lib/auth';
import { cookies } from 'next/headers';
import { NotificationService } from '@repo/lib';
import _db from '@repo/lib/db';

export async function POST(req) {
  await _db();
  const token = cookies().get('token')?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await verifyJwt(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await NotificationService.sendToUser(payload.userId, 'client', {
      title: 'Testing GlowVita Notifications! 💅',
      body: 'If you can see this, then push notifications are working perfectly on the web.',
      data: { type: 'test', url: '/profile' }
    });

    return NextResponse.json({ success: true, message: 'Test notification sent' });
  } catch (error) {
    console.error('Test Notification Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
