import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '@repo/config/config';

export async function POST(req) {
  try {
    const keyId = (RAZORPAY_KEY_ID || '').trim();
    const keySecret = (RAZORPAY_KEY_SECRET || '').trim();

    // Credential check
    if (!keyId || !keySecret) {
      console.error('[Razorpay] Credentials missing. RAZORPAY_KEY_ID:', keyId ? 'present' : 'MISSING');
      return NextResponse.json(
        { success: false, message: 'Payment service configuration error' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { amount, currency = 'INR', receipt } = body;

    // Amount must be a positive number (Razorpay minimum is ₹1 = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);
    if (!amount || amountInPaise < 100) {
      return NextResponse.json(
        { success: false, message: 'Amount must be at least ₹1' },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: (receipt || `receipt_${Date.now()}`).slice(0, 40), // Razorpay receipt max 40 chars
    });

    console.log('[Razorpay] Order created successfully:', order.id, '| Amount:', amountInPaise, 'paise');

    return NextResponse.json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      key_id: keyId,
    });

  } catch (error) {
    // Log the FULL Razorpay error object for debugging
    console.error('[Razorpay] Order creation FAILED:');
    console.error('  Message:', error.message);
    console.error('  Error:', JSON.stringify(error?.error || {}, null, 2));
    console.error('  Description:', error.description);
    console.error('  Status code:', error.statusCode);

    const friendlyMessage =
      error?.error?.description ||
      error?.description ||
      error?.message ||
      'Failed to create payment order';

    return NextResponse.json(
      { success: false, message: friendlyMessage },
      { status: 500 }
    );
  }
}