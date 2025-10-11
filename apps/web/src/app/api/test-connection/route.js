import { NextResponse } from 'next/server';

export async function GET(req) {
  console.log('Test API route called');
  return NextResponse.json({
    success: true,
    message: 'Test API route is working',
    timestamp: new Date().toISOString(),
    env: {
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? 'Present' : 'Missing',
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? 'Present' : 'Missing',
      NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? 'Present' : 'Missing',
    }
  });
}

export async function POST(req) {
  console.log('Test API POST route called');
  const body = await req.json();
  return NextResponse.json({
    success: true,
    message: 'Test API POST route is working',
    receivedData: body,
    timestamp: new Date().toISOString(),
  });
}