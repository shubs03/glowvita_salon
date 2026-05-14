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

    // 2. Wallet Balance Rule
    const minRequiredBalance = settings.minWalletBalanceForWithdrawal || 50;
    if (user.wallet < minRequiredBalance) {
        await session.abortTransaction();
        return NextResponse.json({ 
            success: false, 
            message: `Minimum wallet balance of ₹${minRequiredBalance} is required to withdraw. Your current balance is ₹${user.wallet.toFixed(2)}.` 
        }, { status: 400 });
    }

    // 3. 50% Withdrawal Limit
    const maxAllowedAmount = user.wallet * 0.5;
    if (amount > maxAllowedAmount) {
        await session.abortTransaction();
        return NextResponse.json({ 
            success: false, 
            message: `You can only withdraw up to 50% of your wallet balance (Max: ₹${maxAllowedAmount.toFixed(2)}).` 
        }, { status: 400 });
    }

    // 4. Mode-specific validation
    if (withdrawalMethod === 'upi') {
        if (!bankDetails?.upiId || !bankDetails?.accountHolderName) {
            await session.abortTransaction();
            return NextResponse.json({ success: false, message: 'UPI ID and Name are required' }, { status: 400 });
        }
    } else {
        if (!bankDetails?.accountNumber || !bankDetails?.ifsc || !bankDetails?.accountHolderName) {
            await session.abortTransaction();
            return NextResponse.json({ success: false, message: 'Bank details are incomplete' }, { status: 400 });
        }
    }

    // Initial withdrawal record
    const withdrawalId = `WD_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const withdrawal = await WalletWithdrawalModel.create([{
        withdrawalId,
        userId: user._id,
        userType: userType,
        regionId: user.regionId,
        amount,
        netAmount: amount,
        bankDetails: {
            accountNumber: bankDetails.accountNumber || null,
            ifsc: bankDetails.ifsc ? bankDetails.ifsc.toUpperCase() : null,
            accountHolderName: bankDetails.accountHolderName,
            bankName: bankDetails.bankName || '',
            upiId: bankDetails.upiId || null
        },
        status: 'pending',
        autoProcessed: false
    }], { session });

    // Deduct from wallet immediately to lock the funds
    user.wallet = user.wallet - amount;
    await user.save({ session });

    // Create Transaction Record (Status: pending)
    const txId = `WTX_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const transaction = await WalletTransactionModel.create([{
        transactionId: txId,
        userId: user._id,
        userType: userType,
        regionId: user.regionId,
        transactionType: 'debit',
        amount: -amount,
        balanceBefore: user.wallet + amount,
        balanceAfter: user.wallet,
        source: 'withdrawal',
        status: 'pending',
        description: `Wallet Withdrawal Request - ₹${amount}`,
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
        message: 'Withdrawal request submitted successfully. It will be processed after admin approval.',
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
