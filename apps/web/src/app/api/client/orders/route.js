
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

    // Enhanced Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Missing required field: items' }, { status: 400 });
    }
    if (typeof totalAmount !== 'number') {
      return NextResponse.json({ success: false, message: 'Missing or invalid required field: totalAmount' }, { status: 400 });
    }
    if (!shippingAddress) {
      return NextResponse.json({ success: false, message: 'Missing required field: shippingAddress' }, { status: 400 });
    }
    if (!contactNumber) {
      return NextResponse.json({ success: false, message: 'Missing required field: contactNumber' }, { status: 400 });
    }
    if (!paymentMethod) {
      return NextResponse.json({ success: false, message: 'Missing required field: paymentMethod' }, { status: 400 });
    }
    if (!vendorId) {
      return NextResponse.json({ success: false, message: 'Missing required field: vendorId' }, { status: 400 });
    }

    // For online payments, verify payment signature
    if (paymentMethod !== 'cash-on-delivery' && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
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
        return NextResponse.json({ success: false, message: 'Payment verification failed' }, { status: 400 });
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
