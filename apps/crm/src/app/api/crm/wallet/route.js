import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';
import WalletTransactionModel from '@repo/lib/models/Payment/WalletTransaction.model';
import WalletWithdrawalModel from '@repo/lib/models/Payment/WalletWithdrawal.model';
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

/**
 * GET: Fetch wallet balance and transactions for CRM users (Vendors, Doctors, Suppliers)
 */
export const GET = authMiddlewareCrm(async (req) => {
    try {
        const { userId, role } = req.user;
        const Model = getModelByRole(role);

        if (!Model) {
            return NextResponse.json({ success: false, message: 'Invalid user role' }, { status: 403 });
        }

        const user = await Model.findById(userId).select('wallet referralCode firstName lastName businessName name regionId');
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const settings = await WalletSettingsModel.getSettings();

        // Pagination for transactions
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const transactions = await WalletTransactionModel.find({ 
            userId: user._id,
            userType: { $in: ['Vendor', 'Doctor', 'Supplier'] } // Correct case according to model update
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

        const totalTransactions = await WalletTransactionModel.countDocuments({ 
            userId: user._id, 
            userType: { $in: ['Vendor', 'Doctor', 'Supplier'] }
        });

        const withdrawals = await WalletWithdrawalModel.find({ 
            userId: user._id, 
            userType: { $in: ['Vendor', 'Doctor', 'Supplier'] }
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

        return NextResponse.json({
            success: true,
            data: {
                balance: user.wallet || 0,
                referralCode: user.referralCode,
                transactions,
                withdrawals,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalTransactions / limit),
                    totalTransactions,
                },
                settings: {
                    minWithdrawalAmount: settings.minWithdrawalAmount,
                    maxWithdrawalAmount: settings.maxWithdrawalAmount,
                    minWalletBalanceForWithdrawal: settings.minWalletBalanceForWithdrawal,
                    maxWithdrawablePercentage: settings.maxWithdrawablePercentage || 50,
                    withdrawalFeeType: settings.withdrawalFeeType,
                    withdrawalFeeValue: settings.withdrawalFeeValue,
                }
            }
        });

    } catch (error) {
        console.error('CRM Wallet API Error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}, ['vendor', 'doctor', 'supplier']);
