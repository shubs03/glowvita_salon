import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import { verifyJwt } from '@repo/lib/auth';
import { cookies } from 'next/headers';
import Razorpay from 'razorpay';
import WalletTransactionModel from '@repo/lib/models/Payment/WalletTransaction.model';
import WalletSettingsModel from '@repo/lib/models/admin/WalletSettings.model';
import UserModel from '@repo/lib/models/user/User.model';

await _db();

// Helper function to get user ID from JWT token
const getUserId = async (req) => {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return null;
    }
    
    const payload = await verifyJwt(token);
    return payload?.userId;
  } catch (error) {
    return null;
  }
};

// POST: Create Razorpay order for adding money to wallet
export async function POST(req) {
  try {
    const userId = await getUserId(req);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not authenticated' 
      }, { status: 401 });
    }

    // Get user
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    // Get wallet settings
    const settings = await WalletSettingsModel.getSettings();

    // Parse request body
    const { amount } = await req.json();

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid amount' 
      }, { status: 400 });
    }

    if (amount < settings.minAddMoneyAmount) {
      return NextResponse.json({ 
        success: false, 
        message: `Minimum amount to add is ₹${settings.minAddMoneyAmount}` 
      }, { status: 400 });
    }

    if (amount > settings.maxAddMoneyAmount) {
      return NextResponse.json({ 
        success: false, 
        message: `Maximum amount to add is ₹${settings.maxAddMoneyAmount}` 
      }, { status: 400 });
    }

    // Check Razorpay configuration
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials missing');
      return NextResponse.json({
        success: false,
        message: 'Payment service configuration error'
      }, { status: 500 });
    }

    // Create Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create pending wallet transaction
    const transaction = await WalletTransactionModel.create({
      userId: user._id,
      transactionType: 'credit',
      amount: amount,
      balanceBefore: user.wallet || 0,
      balanceAfter: (user.wallet || 0) + amount,
      source: 'add_money',
      status: 'pending',
      description: `Add money to wallet - ₹${amount}`,
      metadata: {
        requestedAmount: amount
      }
    });

    // Create Razorpay order
    const orderData = {
      amount: Math.round(amount * 100), // Amount in paisa
      currency: 'INR',
      receipt: transaction.transactionId,
      notes: {
        userId: userId.toString(),
        transactionId: transaction.transactionId,
        type: 'wallet_add_money'
      }
    };

    const order = await razorpay.orders.create(orderData);

    // Update transaction with order ID
    transaction.paymentGatewayOrderId = order.id;
    await transaction.save();

    return NextResponse.json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID
        },
        transactionId: transaction.transactionId,
        walletTransactionId: transaction._id.toString()
      }
    });

  } catch (error) {
    console.error('Error creating wallet payment order:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    }, { status: 500 });
  }
}
