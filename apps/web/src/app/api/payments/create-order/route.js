import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req) {
  console.log('=== Payment Order Creation API Called ===');
  console.log('Environment variables check:');
  console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Present' : 'Missing');
  console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Present' : 'Missing');
  
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials missing');
      return NextResponse.json(
        { success: false, message: 'Payment service configuration error' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    console.log('Razorpay instance created successfully');
    console.log('Using Key ID:', process.env.RAZORPAY_KEY_ID);
    console.log('Using Key Secret:', process.env.RAZORPAY_KEY_SECRET);

    const { amount, currency = 'INR', receipt } = await req.json();
    console.log('Request data:', { amount, currency, receipt });
    
    if (!amount) {
      return NextResponse.json({ success: false, message: 'Amount is required' }, { status: 400 });
    }

    const orderData = {
      amount: Math.round(amount * 100), // Amount in paisa
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };
    
    console.log('Creating Razorpay order with:', orderData);
    const order = await razorpay.orders.create(orderData);
    console.log('Razorpay order created successfully:', order.id);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      description: error.description,
      source: error.source,
      step: error.step,
      reason: error.reason,
    });
    
    // Return more specific error information
    return NextResponse.json({
      success: false,
      message: 'Failed to create payment order',
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        description: error.description || 'Unknown error occurred',
      }
    }, { status: 500 });
  }
}