import { NextResponse } from 'next/server';

export async function POST(req) {
  console.log('=== Mock Payment Verification API Called ===');
  
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    console.log('Mock verification data:', { razorpay_order_id, razorpay_payment_id, razorpay_signature });
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, message: 'Missing payment verification data' }, { status: 400 });
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 50));

    // Mock verification - always succeed for development
    console.log('Mock payment verification successful');

    return NextResponse.json({
      success: true,
      message: 'Mock payment verified successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      note: 'This is a mock verification for development. No real payment is verified.',
    });
  } catch (error) {
    console.error('Mock payment verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Mock payment verification error' },
      { status: 500 }
    );
  }
}