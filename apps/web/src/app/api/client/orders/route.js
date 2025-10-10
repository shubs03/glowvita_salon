

import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import ClientOrder from '@repo/lib/models/user/ClientOrder.model';
import { verifyJwt } from '@repo/lib/auth';
import { cookies } from 'next/headers';

// GET User's Orders
export async function GET(req) {
  await _db();
  const token = cookies().get('token')?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await verifyJwt(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const orders = await ClientOrder.find({ userId: payload.userId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: orders });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST a new Order
export async function POST(req) {
  await _db();

  const token = cookies().get('token')?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await verifyJwt(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      items, 
      totalAmount, 
      shippingAddress, 
      contactNumber, 
      paymentMethod, 
      vendorId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature 
    } = body;

    console.log('Creating order with data body:', body);
    // Enhanced Validation
    const requiredFields = { items, totalAmount, shippingAddress, contactNumber, paymentMethod, vendorId };
    for (const field in requiredFields) {
      if (!requiredFields[field] || (Array.isArray(requiredFields[field]) && requiredFields[field].length === 0)) {
        return NextResponse.json({ success: false, message: `Missing required field: ${field}` }, { status: 400 });
      }
    }
    
    // For online payments, verify payment signature
    if (paymentMethod !== 'cash-on-delivery' && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      // Verify payment with Razorpay
      const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000'}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
        }),
      });

      const verifyResult = await verifyResponse.json();
      if (!verifyResult.success) {
        return NextResponse.json({ success: false, message: 'Payment verification failed in client orders route' }, { status: 400 });
      }
    }
    
    const newOrder = new ClientOrder({
      userId: payload.userId,
      vendorId,
      items,
      totalAmount,
      shippingAddress,
      contactNumber,
      paymentMethod,
      ...(razorpayPaymentId && { paymentId: razorpayPaymentId }),
      ...(razorpayOrderId && { razorpayOrderId: razorpayOrderId }),
    });

    await newOrder.save();

    return NextResponse.json({ success: true, message: 'Order placed successfully', data: newOrder }, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, message: 'Validation Error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
