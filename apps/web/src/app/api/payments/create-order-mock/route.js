import { NextResponse } from 'next/server';

export async function POST(req) {
  console.log('=== Mock Payment Order Creation API Called ===');
  
  try {
    const { amount, currency = 'INR', receipt } = await req.json();
    console.log('Mock Request data:', { amount, currency, receipt });
    
    if (!amount) {
      return NextResponse.json({ success: false, message: 'Amount is required' }, { status: 400 });
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create mock order response that mimics Razorpay format
    const mockOrder = {
      id: `order_mock_${Date.now()}`,
      amount: Math.round(amount * 100), // Amount in paisa
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      status: 'created',
      created_at: Math.floor(Date.now() / 1000),
    };

    console.log('Mock order created successfully:', mockOrder.id);

    return NextResponse.json({
      success: true,
      order: {
        id: mockOrder.id,
        amount: mockOrder.amount,
        currency: mockOrder.currency,
        receipt: mockOrder.receipt,
      },
      note: 'This is a mock payment for development. No real payment is processed.',
    });
  } catch (error) {
    console.error('Mock payment order creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create mock payment order' },
      { status: 500 }
    );
  }
}