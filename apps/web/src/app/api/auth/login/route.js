import { NextResponse } from 'next/server';
import dbConnect from '@repo/lib/db';
import User from '@repo/lib/models/user';
import { comparePassword, createJwt } from '@repo/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req) {
  await dbConnect();

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ emailAddress: email }).select('+password');

    if (!user) {
      return NextResponse.json({ message: 'User not found. Please register first.' }, { status: 404 });
    }

    if (!user.password) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordMatch = await comparePassword(password, user.password);

    if (!isPasswordMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = await createJwt({ userId: user._id.toString(), role: user.role, email: user.emailAddress });
    
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json({ 
      message: 'Logged in successfully',
      user: userWithoutPassword,
      token: token,
      role: user.role,
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
