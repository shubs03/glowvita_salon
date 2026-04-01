import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';
import WalletWithdrawalModel from '@repo/lib/models/Payment/WalletWithdrawal.model';
import WalletTransactionModel from '@repo/lib/models/Payment/WalletTransaction.model';
import WalletSettingsModel from '@repo/lib/models/admin/WalletSettings.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import DoctorModel from '@repo/lib/models/Vendor/Docters.model';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
import { 
    createRazorpayContact, 
    createRazorpayFundAccount, 
    initiateRazorpayPayout 
} from '@repo/lib/utils/razorpayPayout';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_ACCOUNT_NUMBER } from '@repo/config/config';

await _db();

// Helper to get the correct model based on role
const getModelByRole = (role) => {
    switch (role) {
        case 'vendor': return VendorModel;
        case 'doctor': return DoctorModel;
        case 'supplier': return SupplierModel;
        default: return null;
    }
};

// Helper to get User Type for models
const getUserTypeByRole = (role) => {
    switch (role) {
        case 'vendor': return 'Vendor';
        case 'doctor': return 'Doctor';
        case 'supplier': return 'Supplier';
        default: return null;
    }
};

/**
 * POST: Submit withdrawal request for CRM users (Vendors, Doctors, Suppliers)
 */
export const POST = authMiddlewareCrm(async (req) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, role } = req.user;
    const Model = getModelByRole(role);
    const userType = getUserTypeByRole(role);

    if (!Model || !userType) {
        await session.abortTransaction();
        return NextResponse.json({ success: false, message: 'Invalid user role for withdrawal' }, { status: 403 });
    }

    const user = await Model.findById(userId).session(session);
    if (!user) {
        await session.abortTransaction();
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const settings = await WalletSettingsModel.getSettings();

    // Parse request body
    const { amount, bankDetails, withdrawalMethod = 'bank_transfer' } = await req.json();

    // 1. Basic Validation
    if (!amount || isNaN(amount) || amount <= 0) {
      await session.abortTransaction();
      return NextResponse.json({ success: false, message: 'Invalid withdrawal amount' }, { status: 400 });
    }

    if (amount < settings.minWithdrawalAmount) {
        await session.abortTransaction();
        return NextResponse.json({ success: false, message: `Minimum withdrawal amount is ₹${settings.minWithdrawalAmount}` }, { status: 400 });
    }

    if (amount > settings.maxWithdrawalAmount) {
        await session.abortTransaction();
        return NextResponse.json({ success: false, message: `Maximum withdrawal amount per transaction is ₹${settings.maxWithdrawalAmount}` }, { status: 400 });
    }

    // 2. Wallet Balance Rule (The specific rule from user)
    const minRequiredBalance = settings.minWalletBalanceForWithdrawal || 50;
    if (user.wallet < minRequiredBalance) {
        await session.abortTransaction();
        return NextResponse.json({ 
            success: false, 
            message: `Minimum wallet balance of ₹${minRequiredBalance} is required to withdraw. Your current balance is ₹${user.wallet.toFixed(2)}.` 
        }, { status: 400 });
    }

    // 3. Percentage Withdrawal Limit (Dynamic from settings)
    const maxPercentage = settings.maxWithdrawablePercentage || 50;
    const maxAllowedAmount = user.wallet * (maxPercentage / 100);
    if (amount > maxAllowedAmount) {
        await session.abortTransaction();
        return NextResponse.json({ 
            success: false, 
            message: `You can only withdraw up to ${maxPercentage}% of your wallet balance (Your limit: ₹${maxAllowedAmount.toFixed(2)}).` 
        }, { status: 400 });
    }

    // 4. Mode-specific validation
    if (withdrawalMethod === 'upi') {
        const upiRegex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/;
        if (!bankDetails?.upiId || !upiRegex.test(bankDetails.upiId)) {
            await session.abortTransaction();
            return NextResponse.json({ success: false, message: 'Invalid UPI ID format. Example: username@upi' }, { status: 400 });
        }
        if (!bankDetails?.accountHolderName) {
            await session.abortTransaction();
            return NextResponse.json({ success: false, message: 'Account holder name is required' }, { status: 400 });
        }
    } else {
        if (!bankDetails?.accountNumber || !bankDetails?.ifsc || !bankDetails?.accountHolderName) {
            await session.abortTransaction();
            return NextResponse.json({ success: false, message: 'Bank details (Account No, IFSC, Name) are incomplete' }, { status: 400 });
        }
        
        // IFSC Validation
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        if (!ifscRegex.test(bankDetails.ifsc.toUpperCase())) {
            await session.abortTransaction();
            return NextResponse.json({ success: false, message: 'Invalid IFSC code format. Example: ABCD0123456' }, { status: 400 });
        }
    }

    // Note: Razorpay keys are handled on the Admin side during approval.
    // They are not needed for submitting a pending request.

    // Manual generation of IDs to ensure validation passes during session
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const generatedWDId = `WD_${timestamp}_${random}`;
    const generatedWTXId = `WTX_${timestamp}_${random}`;

    // Create initial withdrawal record in 'pending' status
    const withdrawal = await WalletWithdrawalModel.create([{
        userId: user._id,
        userType: userType,
        regionId: user.regionId,
        withdrawalId: generatedWDId,
        amount,
        withdrawalFee: 0, // Fee logic can be added here if needed
        netAmount: amount,
        bankDetails: {
            accountHolderName: bankDetails.accountHolderName,
            // Consistency: If UPI, clear bank fields. If Bank, clear UPI.
            accountNumber: withdrawalMethod === 'bank_transfer' ? (bankDetails.accountNumber || null) : null,
            ifsc: withdrawalMethod === 'bank_transfer' ? (bankDetails.ifsc ? bankDetails.ifsc.toUpperCase() : null) : null,
            bankName: withdrawalMethod === 'bank_transfer' ? (bankDetails.bankName || '') : '',
            upiId: withdrawalMethod === 'upi' ? (bankDetails.upiId || null) : null
        },
        status: 'pending',
        autoProcessed: false,
        requestedAt: new Date()
    }], { session });

    // Deduct from wallet to reserve funds
    user.wallet = user.wallet - amount;
    await user.save({ session });

    // Create Transaction Record for the reservation
    const transaction = await WalletTransactionModel.create([{
        userId: user._id,
        userType: userType,
        regionId: user.regionId,
        transactionId: generatedWTXId,
        transactionType: 'debit',
        amount: -amount,
        balanceBefore: user.wallet + amount,
        balanceAfter: user.wallet,
        source: 'withdrawal',
        status: 'pending', // Transaction is also pending
        description: `Wallet Withdrawal Request (${generatedWDId}) - ₹${amount}`,
        withdrawalId: withdrawal[0]._id,
        metadata: {
            withdrawalMethod
        }
    }], { session });

    // Update withdrawal with transaction reference
    withdrawal[0].transactionId = transaction[0]._id;
    await withdrawal[0].save({ session });

    await session.commitTransaction();

    return NextResponse.json({
        success: true,
        message: 'Withdrawal request submitted successfully and is pending admin approval.',
        data: {
            withdrawalId: withdrawal[0].withdrawalId,
            status: withdrawal[0].status
        }
    });

  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    console.error('CRM Withdrawal Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  } finally {
    session.endSession();
  }
}, ['vendor', 'doctor', 'supplier']);
