
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@repo/lib/db';
import DeviceToken from '@repo/lib/models/DeviceToken.model';

export async function POST(req) {
  try {
    await dbConnect();
    let fcmToken;
    try {
      const body = await req.json();
      fcmToken = body.token;
    } catch (e) {
      // Body not present or invalid
    }

    if (fcmToken) {
      await DeviceToken.deleteOne({ token: fcmToken });
    }

    // Remove the 'token' cookie by setting an expiration date in the past.
    cookies().set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0),
    });

    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
