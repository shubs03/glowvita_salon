import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import ClientOrder from '@repo/lib/models/user/ClientOrder.model';
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import UserCartModel from '@repo/lib/models/user/UserCart.model';
import { verifyJwt } from '@repo/lib/auth';
import { cookies } from 'next/headers';
import { NotificationService } from '@repo/lib';
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

    const orders = await ClientOrder.find({ userId: payload.userId }).sort({ createdAt: -1 }).lean();

    // Lazy-load models to avoid circular imports
    const VendorModel = (await import('@repo/lib/models/Vendor/Vendor.model')).default;
    const SupplierModel = (await import('@repo/lib/models/Vendor/Supplier.model')).default;

    // Enhance orders with product origin information + seller name
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

      // Determine seller name from vendorId
      let sellerName = 'N/A';
      if (order.vendorId) {
        try {
          // Try vendor first
          const vendor = await VendorModel.findById(order.vendorId).select('businessName').lean();
          if (vendor?.businessName) {
            sellerName = vendor.businessName;
          } else {
            // Try supplier
            const supplier = await SupplierModel.findById(order.vendorId).select('shopName').lean();
            if (supplier?.shopName) {
              sellerName = supplier.shopName;
            }
          }
        } catch (err) {
          console.error(`Error fetching seller name for order ${order._id}:`, err);
        }
      }

      return {
        ...order,
        items: enhancedItems,
        sellerName
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
      owner = await SupplierModel.findById(finalVendorId).select('regionId shopName minOrderValue').lean();
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

    // Enforce Minimum Order Value for Supplier products
    if (ownerType === 'Supplier' && owner.minOrderValue > 0 && totalAmount < owner.minOrderValue) {
      return NextResponse.json({
        success: false,
        message: `Order total must be at least ₹${owner.minOrderValue} for products from ${ownerName}.`
      }, { status: 400 });
    }

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

    // ── Seed full tracking timeline at order creation ─────────────────────
    // Pending is NOW (actual). All future steps are estimates.
    // The PATCH route will replace each estimated entry with the real time
    // when the vendor actually advances the status.
    const now = new Date();
    const addDays = (base, days) => new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

    newOrder.statusHistory = [
      {
        status: 'Pending',
        date: now,
        notes: 'Your order has been placed successfully.',
        isEstimated: false,  // actual — happening right now
      },
      {
        status: 'Processing',
        date: addDays(now, 1),
        notes: 'Seller will confirm and start processing your order.',
        isEstimated: true,
      },
      {
        status: 'Packed',
        date: addDays(now, 2),
        notes: 'Your order will be packed and ready for pickup.',
        isEstimated: true,
      },
      {
        status: 'Shipped',
        date: addDays(now, 4),
        notes: 'Your order will be handed to the delivery partner.',
        isEstimated: true,
      },
      {
        status: 'Delivered',
        date: addDays(now, 7),
        notes: 'Your order is expected to be delivered.',
        isEstimated: true,
      },
    ];

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
      console.error('Error clearing cart:', cartError);
    }

    // Trigger Notifications
    (async () => {
      try {
        // Notify Client
        await NotificationService.sendOrderAlert(payload.userId, 'client', newOrder, 'placed');
        
        // Notify Vendor/Supplier
        await NotificationService.sendOrderAlert(finalVendorId, ownerType.toLowerCase(), newOrder, 'placed');
      } catch (err) {
        console.error('Order Notification Error:', err);
      }
    })();

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

    // Check if order can be cancelled (Only before shipped)
    console.log('Order status:', order.status);
    if (!['Pending', 'Processing', 'Packed'].includes(order.status)) {
      return NextResponse.json({ success: false, message: `Order cannot be cancelled when it is ${order.status}` }, { status: 400 });
    }

    // Update order status to Cancelled and add cancellation reason
    console.log('Cancelling order:', orderId, 'with reason:', cancellationReason);
    order.set({
      status: 'Cancelled',
      cancellationReason: cancellationReason,
      cancelledAt: new Date(),
      cancelledBy: 'User',
      updatedAt: new Date()
    });

    // Push to statusHistory: replace estimated Cancelled slot with actual, or push if none exists
    if (!order.statusHistory) order.statusHistory = [];

    const cancelNote = `Order cancelled by you. Reason: ${cancellationReason}`;
    const cancelEstIdx = order.statusHistory.findIndex(
      h => h.status === 'Cancelled' && h.isEstimated === true
    );

    if (cancelEstIdx !== -1) {
      order.statusHistory[cancelEstIdx].date        = new Date();
      order.statusHistory[cancelEstIdx].notes       = cancelNote;
      order.statusHistory[cancelEstIdx].isEstimated = false;
    } else {
      order.statusHistory.push({ status: 'Cancelled', notes: cancelNote, date: new Date(), isEstimated: false });
    }

    // Remove all remaining estimated future steps — timeline ends at Cancelled
    order.statusHistory = order.statusHistory.filter(h => !h.isEstimated);
    order.markModified('statusHistory');

    await order.save();
    console.log('Order after save:', order);
    
    // Trigger Notifications for Cancellation
    (async () => {
      try {
        // Notify Client
        await NotificationService.sendOrderAlert(payload.userId, 'client', order, 'cancelled');
        
        // Notify Vendor
        await NotificationService.sendOrderAlert(order.vendorId, 'vendor', order, 'cancelled');
      } catch (err) {
        console.error('Order Cancellation Notification Error:', err);
      }
    })();

    // Stock Refund: Increment stock for each product in the cancelled order
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        if (item.productId) {
          try {
            await ProductModel.findByIdAndUpdate(
              item.productId,
              { $inc: { stock: item.quantity } },
              { new: true }
            );
            console.log(`Refunded stock for product ${item.productId}: +${item.quantity}`);
          } catch (refundError) {
            console.error(`Error refunding stock for product ${item.productId}:`, refundError);
            // We don't fail the cancellation if refund fails, but we log it
          }
        }
      }
    }
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
