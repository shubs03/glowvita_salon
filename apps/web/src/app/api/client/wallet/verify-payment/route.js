import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import { verifyJwt } from '@repo/lib/auth';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import mongoose from 'mongoose';
import WalletTransactionModel from '@repo/lib/models/Payment/WalletTransaction.model';
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

// POST: Verify Razorpay payment and credit wallet
export async function POST(req) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = await getUserId(req);
    
    if (!userId) {
      await session.abortTransaction();
      return NextResponse.json({ 
        success: false, 
        message: 'User not authenticated' 
      }, { status: 401 });
    }

    // Parse request body
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      transactionId 
    } = await req.json();

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      await session.abortTransaction();
      return NextResponse.json({ 
        success: false, 
        message: 'Missing payment verification details' 
      }, { status: 400 });
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      await session.abortTransaction();
      return NextResponse.json({ 
        success: false, 
        message: 'Payment verification failed. Invalid signature.' 
      }, { status: 400 });
    }

    // Find the transaction
    const transaction = await WalletTransactionModel.findOne({
      paymentGatewayOrderId: razorpay_order_id,
      userId: userId,
      status: 'pending'
    }).session(session);

    if (!transaction) {
      await session.abortTransaction();
      return NextResponse.json({ 
        success: false, 
        message: 'Transaction not found or already processed' 
      }, { status: 404 });
    }

    // Get user
    const user = await UserModel.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    // Update transaction
    transaction.status = 'completed';
    transaction.paymentGatewayPaymentId = razorpay_payment_id;
    transaction.balanceBefore = user.wallet || 0;
    transaction.balanceAfter = (user.wallet || 0) + transaction.amount;
    transaction.metadata = {
      ...transaction.metadata,
      verifiedAt: new Date(),
      paymentId: razorpay_payment_id
    };
    await transaction.save({ session });

    // Update user wallet balance
    user.wallet = (user.wallet || 0) + transaction.amount;
    await user.save({ session });

    // Commit transaction
    await session.commitTransaction();

    console.log(`Wallet credited: User ${userId}, Amount: ₹${transaction.amount}, New Balance: ₹${user.wallet}`);

    return NextResponse.json({
      success: true,
      message: `₹${transaction.amount} added to your wallet successfully!`,
      data: {
        transactionId: transaction.transactionId,
        amount: transaction.amount,
        newBalance: user.wallet,
        paymentId: razorpay_payment_id
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error verifying wallet payment:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    }, { status: 500 });
  } finally {
    session.endSession();
  }
}
