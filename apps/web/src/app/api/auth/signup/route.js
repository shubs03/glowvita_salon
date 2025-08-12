
import { NextResponse } from 'next/server';
import dbConnect from '@repo/lib/db';
import User from '@repo/lib/models/user';
import { hashPassword, createJwt } from '@repo/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req) {
  await dbConnect();

  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'USER', // Default role for web signup
    });

    await user.save();
    
    const token = await createJwt({ userId: user._id.toString(), role: user.role, email: user.email });

    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
