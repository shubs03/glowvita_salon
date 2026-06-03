import { NextResponse } from 'next/server';
import { NotificationService } from '@repo/lib';
import { verifyJwt } from '@repo/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const token = cookies().get('token')?.value || cookies().get('access_token')?.value || cookies().get('crm_access_token')?.value || cookies().get('admin_access_token')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized - No token found' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload || !payload.userId) {
       return NextResponse.json({ success: false, message: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    const { role = 'client' } = await req.json();

    // Send a test notification to the logged-in user
    await NotificationService.sendToUser(payload.userId, role, {
      title: 'Test Notification 🔔',
      body: 'If you see this, your notification system is working perfectly!',
      type: 'test',
      data: { 
        timestamp: new Date().toISOString(),
        test: true 
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Test notification sent!',
      userId: payload.userId,
      role: role
    });

  } catch (error) {
    console.error('Test Notification Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
