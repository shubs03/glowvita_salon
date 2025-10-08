
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
    const { items, totalAmount, shippingAddress, contactNumber, paymentMethod, vendorId } = body;

    // Enhanced Validation
    if (!items || !Array.isArray(items) || items.length === 0 || !totalAmount || !shippingAddress || !contactNumber || !paymentMethod || !vendorId) {
      const missing = [];
      if (!items) missing.push('items');
      if (!totalAmount) missing.push('totalAmount');
      if (!shippingAddress) missing.push('shippingAddress');
      if (!contactNumber) missing.push('contactNumber');
      if (!paymentMethod) missing.push('paymentMethod');
      if (!vendorId) missing.push('vendorId');
      return NextResponse.json({ success: false, message: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
    }
    
    const newOrder = new ClientOrder({
      userId: payload.userId,
      vendorId,
      items,
      totalAmount,
      shippingAddress,
      contactNumber,
      paymentMethod,
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

    