import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function GET(req) {
  console.log('=== Razorpay Test Endpoint ===');
  
  try {
    // Check environment variables
    console.log('Environment Check:');
    console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
    console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Present (hidden)' : 'Missing');
    
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({
        success: false,
        message: 'Razorpay credentials missing',
        env: {
          RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? 'Present' : 'Missing',
          RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? 'Present' : 'Missing',
        }
      }, { status: 500 });
    }

    // Test Razorpay instance creation
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    
    console.log('Razorpay instance created successfully');
    
    // Test with a very small amount
    const testOrder = {
      amount: 100, // 1 rupee in paisa
      currency: 'INR',
      receipt: `test_${Date.now()}`,
    };
    
    console.log('Creating test order with:', testOrder);
    const order = await razorpay.orders.create(testOrder);
    console.log('Test order created successfully:', order.id);
    
    return NextResponse.json({
      success: true,
      message: 'Razorpay integration test successful',
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
      },
      credentials: {
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret_present: !!process.env.RAZORPAY_KEY_SECRET,
      }
    });
    
  } catch (error) {
    console.error('Razorpay test error:', error);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    
    return NextResponse.json({
      success: false,
      message: 'Razorpay test failed',
      error: {
        message: error.message,
        code: error.code,
        description: error.description,
        field: error.field,
        source: error.source,
        step: error.step,
        reason: error.reason,
        statusCode: error.statusCode,
      }
    }, { status: 500 });
  }
}