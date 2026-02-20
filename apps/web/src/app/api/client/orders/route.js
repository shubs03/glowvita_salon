import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import ClientOrder from '@repo/lib/models/user/ClientOrder.model';
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import UserCartModel from '@repo/lib/models/user/UserCart.model';
import { verifyJwt } from '@repo/lib/auth';
import { cookies } from 'next/headers';
import { checkAndCreditReferralBonus } from '@repo/lib/utils/referralWalletCredit';

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
    
    // Enhance orders with product origin information
    const enhancedOrders = await Promise.all(orders.map(async (order) => {
      const enhancedItems = await Promise.all(order.items.map(async (item) => {
        try {
          const product = await ProductModel.findById(item.productId).select('origin').lean();
          return {
            ...item,
            origin: product?.origin || 'Vendor' // Default to 'Vendor' if not found
          };
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error);
          return {
            ...item,
            origin: 'Vendor' // Default to 'Vendor' if error occurs
          };
        }
      }));

      return {
        ...order.toObject(),
        items: enhancedItems
      };
    }));

    return NextResponse.json({ success: true, data: enhancedOrders });

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
      shippingAmount = 0,
      taxAmount = 0,
      gstAmount = 0,
      platformFeeAmount = 0,
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

    // Validate stock availability and determine product origin (Vendor or Supplier)
    let productOrigin = null;
    let actualOwnerId = null;
    
    for (const item of items) {
      const product = await ProductModel.findById(item.productId).lean();
      
      if (!product) {
        return NextResponse.json({ 
          success: false, 
          message: `Product "${item.name}" not found` 
        }, { status: 404 });
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ 
          success: false, 
          message: `Insufficient stock for "${item.name}". Only ${product.stock} units available.` 
        }, { status: 400 });
      }

      // Determine product origin and owner from first item (all items should be from same vendor/supplier)
      if (!productOrigin) {
        productOrigin = product.origin; // 'Vendor' or 'Supplier'
        actualOwnerId = product.vendorId; // This is the actual supplier or vendor who owns the product
      }
    }
    
    // Use the actual product owner ID instead of the vendorId from request body
    const finalVendorId = actualOwnerId;
    
    console.log(`Order validation: productOrigin=${productOrigin}, actualOwnerId=${actualOwnerId}, requestVendorId=${vendorId}`);
    
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
    
    // Ensure all amount fields have proper default values
    const orderShippingAmount = typeof shippingAmount === 'number' ? shippingAmount : 0;
    const orderTaxAmount = typeof taxAmount === 'number' ? taxAmount : 0;
    const orderGstAmount = typeof gstAmount === 'number' ? gstAmount : 0;
    const orderPlatformFeeAmount = typeof platformFeeAmount === 'number' ? platformFeeAmount : 0;
    
    // Fetch Region from Vendor or Supplier based on product origin
    let owner = null;
    let ownerType = 'Vendor'; // Default to Vendor for backward compatibility
    let ownerName = '';
    
    if (productOrigin === 'Supplier') {
      const SupplierModel = (await import('@repo/lib/models/Vendor/Supplier.model')).default;
      owner = await SupplierModel.findById(finalVendorId).select('regionId shopName').lean();
      ownerType = 'Supplier';
      ownerName = owner?.shopName || 'Unknown Supplier';
    } else {
      const VendorModel = (await import('@repo/lib/models/Vendor/Vendor.model')).default;
      owner = await VendorModel.findById(finalVendorId).select('regionId businessName').lean();
      ownerType = 'Vendor';
      ownerName = owner?.businessName || 'Unknown Vendor';
    }

    // Validate owner exists
    if (!owner) {
      return NextResponse.json({ 
        success: false, 
        message: `${ownerType} not found` 
      }, { status: 404 });
    }

    // Validate owner has a regionId
    if (!owner.regionId) {
      return NextResponse.json({ 
        success: false, 
        message: `${ownerType} region not configured. Please contact support or choose a different ${ownerType.toLowerCase()}.` 
      }, { status: 400 });
    }

    console.log(`Creating order for ${ownerType}: ${ownerName} (${finalVendorId}) in region: ${owner.regionId}`);

    const newOrder = new ClientOrder({
      userId: payload.userId,
      vendorId: finalVendorId, // Use the actual product owner ID (supplier or vendor)
      regionId: owner.regionId,
      items,
      totalAmount,
      shippingAmount: orderShippingAmount,
      taxAmount: orderTaxAmount,
      gstAmount: orderGstAmount,
      platformFeeAmount: orderPlatformFeeAmount,
      shippingAddress,
      contactNumber,
      paymentMethod,
      ...(razorpayPaymentId && { paymentId: razorpayPaymentId }),
      ...(razorpayOrderId && { razorpayOrderId: razorpayOrderId }),
    });

    await newOrder.save();

    // Check and credit referral bonus if user was referred (triggers on first order)
    try {
      await checkAndCreditReferralBonus(payload.userId, 'order');
    } catch (referralError) {
      // Don't fail the order if referral crediting fails, just log the error
      console.error('Error crediting referral bonus:', referralError);
    }

    // Decrease stock for each product in the order
    for (const item of items) {
      await ProductModel.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }

    // Clear the user's cart after successful order
    try {
      await UserCartModel.findOneAndUpdate(
        { userId: payload.userId },
        { $set: { items: [] } }
      );
    } catch (cartError) {
      // Log error but don't fail the order if cart clearing fails
      console.error('Error clearing cart:', cartError);
    }

    return NextResponse.json({ success: true, message: 'Order placed successfully', data: newOrder }, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, message: 'Validation Error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

// PATCH - Cancel an order
export async function PATCH(req) {
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
    const { orderId, cancellationReason } = body;

    // Validate required fields
    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Order ID is required' }, { status: 400 });
    }

    if (!cancellationReason || cancellationReason.trim().length === 0) {
      return NextResponse.json({ success: false, message: 'Cancellation reason is required' }, { status: 400 });
    }

    // Find the order and verify ownership
    console.log('Finding order with ID:', orderId, 'for user:', payload.userId);
    const order = await ClientOrder.findOne({ _id: orderId, userId: payload.userId });
    console.log('Found order:', order);
    
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found or unauthorized' }, { status: 404 });
    }

    // Check if order can be cancelled
    console.log('Order status:', order.status);
    if (!['Pending', 'Processing'].includes(order.status)) {
      return NextResponse.json({ success: false, message: 'Order cannot be cancelled at this stage' }, { status: 400 });
    }

    // Update order status to Cancelled and add cancellation reason
    console.log('Cancelling order:', orderId, 'with reason:', cancellationReason);
    order.set({
      status: 'Cancelled',
      cancellationReason: cancellationReason,
      updatedAt: new Date()
    });
    
    await order.save();
    console.log('Order after save:', order);
    // Also log specific fields
    console.log('Saved order status:', order.status);
    console.log('Saved order cancellationReason:', order.cancellationReason);

    return NextResponse.json({ 
      success: true, 
      message: 'Order cancelled successfully', 
      data: order 
    }, { status: 200 });

  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
