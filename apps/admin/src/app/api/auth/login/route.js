
import { NextResponse } from 'next/server';
import dbConnect from '@repo/lib/db';
import User from '@repo/lib/models/user';
import { comparePassword, createJwt } from '@repo/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req) {
  await dbConnect();

  try {
    const { email, password } = await req.json();
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.password || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Invalid credentials or not an admin' }, { status: 401 });
    }

    const isPasswordMatch = await comparePassword(password, user.password);

    if (!isPasswordMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = await createJwt({ userId: user._id.toString(), role: user.role, email: user.email });
    
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({ message: 'Logged in successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
