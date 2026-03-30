import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { RAZORPAY_KEY_SECRET } from '@repo/config/config';

export async function POST(req) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Missing payment verification data' },
        { status: 400 }
      );
    }

    const secret = (RAZORPAY_KEY_SECRET || '').trim();
    if (!secret) {
      return NextResponse.json(
        { success: false, message: 'Payment service configuration error' },
        { status: 500 }
      );
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Payment verification failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('CRM payment verification error:', error.message);
    return NextResponse.json(
      { success: false, message: 'Payment verification error' },
      { status: 500 }
    );
  }
}
