import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import { verifyJwt } from '@repo/lib/auth';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';
import WalletWithdrawalModel from '@repo/lib/models/Payment/WalletWithdrawal.model';
import WalletTransactionModel from '@repo/lib/models/Payment/WalletTransaction.model';
import WalletSettingsModel from '@repo/lib/models/admin/WalletSettings.model';
import UserModel from '@repo/lib/models/user/User.model';
import { 
    createRazorpayContact, 
    createRazorpayFundAccount, 
    initiateRazorpayPayout 
} from '@repo/lib/utils/razorpayPayout';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_ACCOUNT_NUMBER } from '@repo/config/config';

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

// Validate IFSC code format
const validateIFSC = (ifsc) => {
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc);
};

// Validate account number
const validateAccountNumber = (accountNumber) => {
  const accountRegex = /^[0-9]{9,18}$/;
  return accountRegex.test(accountNumber);
};

// Calculate withdrawal risk score
const calculateRiskScore = async (userId, amount, user, settings) => {
  let riskScore = 0;
  const riskFlags = [];

  try {
    // Check 1: New account (< configured days)
    const accountAge = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (accountAge < settings.fraudDetectionRules.newAccountRestrictionDays) {
      riskScore += 20;
      riskFlags.push('new_account');

      if (amount > settings.fraudDetectionRules.maxWithdrawalForNewAccount) {
        riskScore += 30;
        riskFlags.push('high_amount_new_account');
      }
    }

    // Check 2: Large percentage of balance
    const percentageOfBalance = (amount / user.wallet) * 100;
    if (percentageOfBalance > 90) {
      riskScore += 15;
      riskFlags.push('large_percentage_withdrawal');
    }

    // Check 3: Rapid withdrawals
    const recentTime = new Date(Date.now() - settings.fraudDetectionRules.rapidWithdrawalWindowMinutes * 60 * 1000);
    const recentWithdrawals = await WalletWithdrawalModel.countDocuments({
      userId,
      requestedAt: { $gte: recentTime },
      status: { $in: ['pending', 'processing', 'completed'] }
    });

    if (recentWithdrawals >= settings.fraudDetectionRules.maxRapidWithdrawals) {
      riskScore += 25;
      riskFlags.push('rapid_withdrawals');
    }

    // Check 4: Amount exceeds threshold
    if (amount > settings.fraudDetectionRules.maxAmountPerTransaction) {
      riskScore += 20;
      riskFlags.push('exceeds_max_amount');
    }

    // Check 5: Very first transaction is withdrawal
    const totalTransactions = await WalletTransactionModel.countDocuments({
      userId,
      status: 'completed'
    });

    if (totalTransactions === 0) {
      riskScore += 40;
      riskFlags.push('first_transaction_withdrawal');
    }

    return { riskScore, riskFlags, shouldBlock: riskScore > settings.fraudDetectionRules.suspiciousActivityThreshold };
  } catch (error) {
    console.error('Error calculating risk score:', error);
    return { riskScore: 0, riskFlags: [], shouldBlock: false };
  }
};

// Razorpay X Payout Helpers moved to @repo/lib/utils/razorpayPayout.js

// POST: Submit withdrawal request (automated processing)
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

    const keyId = (RAZORPAY_KEY_ID || '').trim();
    const keySecret = (RAZORPAY_KEY_SECRET || '').trim();
    const razorpayAccountNumber = (RAZORPAY_ACCOUNT_NUMBER || '').trim();

    if (!keyId || !keySecret) {
        await session.abortTransaction();
        return NextResponse.json({
          success: false,
          message: 'Razorpay API keys (ID or Secret) are missing in server configuration.'
        }, { status: 500 });
    }

    if (!razorpayAccountNumber) {
        await session.abortTransaction();
        return NextResponse.json({
          success: false,
          message: 'Razorpay Account Number (RAZORPAY_ACCOUNT_NUMBER) is missing. This is required for payouts.'
        }, { status: 500 });
    }

    // Parse request body
    const { amount, bankDetails, withdrawalMethod = 'bank_transfer' } = await req.json();

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      await session.abortTransaction();
      return NextResponse.json({
        success: false,
        message: 'Invalid withdrawal amount'
      }, { status: 400 });
    }

    // Validate based on withdrawal method
    if (withdrawalMethod === 'upi') {
      if (!bankDetails || !bankDetails.upiId || !bankDetails.accountHolderName) {
        await session.abortTransaction();
        return NextResponse.json({
          success: false,
          message: 'UPI ID and Account Holder Name are required'
        }, { status: 400 });
      }

      // Basic UPI ID validation
      const upiRegex = /^[\w.-]+@[\w.-]+$/;
      if (!upiRegex.test(bankDetails.upiId)) {
        await session.abortTransaction();
        return NextResponse.json({
          success: false,
          message: 'Invalid UPI ID format'
        }, { status: 400 });
      }
    } else {
      // Default to bank transfer validation
      if (!bankDetails || !bankDetails.accountNumber || !bankDetails.ifsc || !bankDetails.accountHolderName) {
        await session.abortTransaction();
        return NextResponse.json({
          success: false,
          message: 'Bank details are required'
        }, { status: 400 });
      }

      // Validate IFSC code
      if (!validateIFSC(bankDetails.ifsc.toUpperCase())) {
        await session.abortTransaction();
        return NextResponse.json({
          success: false,
          message: 'Invalid IFSC code format'
        }, { status: 400 });
      }

      // Validate account number
      if (!validateAccountNumber(bankDetails.accountNumber)) {
        await session.abortTransaction();
        return NextResponse.json({
          success: false,
          message: 'Invalid account number. Must be 9-18 digits.'
        }, { status: 400 });
      }
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

    // Get wallet settings
    const settings = await WalletSettingsModel.getSettings();

    // Check minimum balance requirement (from settings)
    const minBalanceRequired = settings.minWalletBalanceForWithdrawal || 50;
    if ((user.wallet || 0) < minBalanceRequired) {
      await session.abortTransaction();
      return NextResponse.json({
        success: false,
        message: `Minimum wallet balance of ₹${minBalanceRequired} is required to initiate a withdrawal`
      }, { status: 400 });
    }

    // Check withdrawal limit (dynamic from settings)
    const maxWithdrawalPercentage = settings.maxWithdrawablePercentage || 50;
    const maxAllowedByPercentage = (user.wallet || 0) * (maxWithdrawalPercentage / 100);
    
    if (amount > maxAllowedByPercentage) {
      await session.abortTransaction();
      return NextResponse.json({
        success: false,
        message: `You can only withdraw up to ${maxWithdrawalPercentage}% of your current wallet balance (₹${maxAllowedByPercentage.toFixed(2)})`
      }, { status: 400 });
    }

    // Check minimum amount
    if (amount < settings.minWithdrawalAmount) {
      await session.abortTransaction();
      return NextResponse.json({
        success: false,
        message: `Minimum withdrawal amount is ₹${settings.minWithdrawalAmount}`
      }, { status: 400 });
    }

    // Check maximum amount
    if (amount > settings.maxWithdrawalAmount) {
      await session.abortTransaction();
      return NextResponse.json({
        success: false,
        message: `Maximum withdrawal amount is ₹${settings.maxWithdrawalAmount}`
      }, { status: 400 });
    }

    // Check sufficient balance
    if (amount > (user.wallet || 0)) {
      await session.abortTransaction();
      return NextResponse.json({
        success: false,
        message: 'Insufficient wallet balance'
      }, { status: 400 });
    }

    // Check daily withdrawal limits
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayWithdrawals = await WalletWithdrawalModel.aggregate([
      {
        $match: {
          userId: user._id,
          status: { $in: ['pending', 'processing', 'completed'] },
          requestedAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const todayStats = todayWithdrawals[0] || { count: 0, totalAmount: 0 };

    if (todayStats.count >= settings.maxWithdrawalsPerDay) {
      await session.abortTransaction();
      return NextResponse.json({
        success: false,
        message: `Daily withdrawal limit reached. Maximum ${settings.maxWithdrawalsPerDay} withdrawals per day.`
      }, { status: 400 });
    }

    if (todayStats.totalAmount + amount > settings.maxDailyWithdrawalAmount) {
      await session.abortTransaction();
      return NextResponse.json({
        success: false,
        message: `Daily withdrawal amount limit exceeded. Maximum ₹${settings.maxDailyWithdrawalAmount} per day.`
      }, { status: 400 });
    }

    // Check cooldown period
    if (settings.cooldownPeriodHours > 0) {
      const lastWithdrawal = await WalletWithdrawalModel.findOne({
        userId: user._id,
        status: { $in: ['completed'] }
      }).sort({ completedAt: -1 });

      if (lastWithdrawal) {
        const hoursSinceLastWithdrawal = (Date.now() - new Date(lastWithdrawal.completedAt).getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastWithdrawal < settings.cooldownPeriodHours) {
          const nextAllowedTime = new Date(new Date(lastWithdrawal.completedAt).getTime() + settings.cooldownPeriodHours * 60 * 60 * 1000);
          await session.abortTransaction();
          return NextResponse.json({
            success: false,
            message: `Please wait ${settings.cooldownPeriodHours} hours between withdrawals.`,
            data: {
              nextAllowedWithdrawal: nextAllowedTime
            }
          }, { status: 400 });
        }
      }
    }

    // Calculate withdrawal fee
    let withdrawalFee = 0;
    if (settings.withdrawalFeeType === 'fixed') {
      withdrawalFee = settings.withdrawalFeeValue;
    } else if (settings.withdrawalFeeType === 'percentage') {
      withdrawalFee = (amount * settings.withdrawalFeeValue) / 100;
    }

    const netAmount = amount - withdrawalFee;

    // Run fraud detection if enabled
    let riskScore = 0;
    let riskFlags = [];
    let shouldBlock = false;

    if (settings.autoFraudDetectionEnabled) {
      const riskAssessment = await calculateRiskScore(userId, amount, user, settings);
      riskScore = riskAssessment.riskScore;
      riskFlags = riskAssessment.riskFlags;
      shouldBlock = riskAssessment.shouldBlock;
    }

    // If high risk, reject automatically
    if (shouldBlock) {
      const withdrawal = await WalletWithdrawalModel.create([{
        userId: user._id,
        amount,
        withdrawalFee,
        netAmount,
        bankDetails: {
          accountNumber: bankDetails.accountNumber || null,
          ifsc: bankDetails.ifsc ? bankDetails.ifsc.toUpperCase() : null,
          accountHolderName: bankDetails.accountHolderName,
          bankName: bankDetails.bankName || '',
          upiId: bankDetails.upiId || null
        },
        status: 'rejected_by_system',
        rejectionReason: `High risk transaction detected: ${riskFlags.join(', ')}`,
        riskScore,
        riskFlags,
        autoProcessed: true
      }], { session });

      await session.commitTransaction();

      return NextResponse.json({
        success: false,
        message: 'Withdrawal request rejected due to security concerns.',
        data: {
          withdrawalId: withdrawal[0].withdrawalId,
          riskFlags,
          reason: 'Please contact support for assistance.'
        }
      }, { status: 400 });
    }

    // RAZORPAY PAYOUT INTEGRATION
    let contactId = user.razorpayContactId;
    if (!contactId) {
      contactId = await createRazorpayContact({
        name: `${user.firstName} ${user.lastName || ''}`.trim(),
        email: user.emailAddress,
        phone: user.mobileNumber || user.phone || '9999999999',
        userId: user._id
      }, keyId, keySecret);
      
      if (!contactId) {
        await session.abortTransaction();
        return NextResponse.json({ success: false, message: 'Failed to create Razorpay contact. Reach support.' }, { status: 500 });
      }
      
      user.razorpayContactId = contactId;
      await user.save({ session });
    }

    const fundAccountId = await createRazorpayFundAccount(contactId, {
      accountHolderName: bankDetails.accountHolderName,
      accountNumber: bankDetails.accountNumber,
      ifsc: bankDetails.ifsc,
      upiId: bankDetails.upiId
    }, keyId, keySecret);
    
    if (!fundAccountId) {
        await session.abortTransaction();
        return NextResponse.json({ success: false, message: 'Failed to link fund account with Razorpay.' }, { status: 400 });
    }

    // Initial withdrawal record in 'processing' status
    const withdrawal = await WalletWithdrawalModel.create([{
      userId: user._id,
      userType: 'User',
      regionId: user.regionId,
      amount,
      withdrawalFee,
      netAmount,
      bankDetails: {
        accountNumber: bankDetails.accountNumber || null,
        ifsc: bankDetails.ifsc ? bankDetails.ifsc.toUpperCase() : null,
        accountHolderName: bankDetails.accountHolderName,
        bankName: bankDetails.bankName || '',
        upiId: bankDetails.upiId || null
      },
      status: 'processing',
      riskScore,
      riskFlags,
      autoProcessed: true,
      processedAt: new Date()
    }], { session });

    // Deduct from user wallet before calling Razorpay to prevent double spending
    user.wallet = user.wallet - amount;
    await user.save({ session });

    // Create Payout in Razorpay
    const payoutData = await initiateRazorpayPayout({
      razorpayAccountNumber,
      fundAccountId,
      amount: netAmount,
      mode: withdrawalMethod === 'upi' ? 'UPI' : 'IMPS',
      referenceId: withdrawal[0].withdrawalId,
      narration: `Withdrawal for ${user.firstName}`
    }, keyId, keySecret);
    
    if (payoutData.error) {
        // Rollback wallet if Razorpay fails immediately
        user.wallet = user.wallet + amount;
        await user.save({ session });
        
        await session.abortTransaction();
        console.error('Razorpay Payout Error:', payoutData.error);
        return NextResponse.json({
            success: false,
            message: payoutData.error.description || 'Failed to initiate Razorpay payout'
        }, { status: 400 });
    }

    // Create debit transaction record
    const transaction = await WalletTransactionModel.create([{
      userId: user._id,
      userType: 'User',
      regionId: user.regionId,
      transactionType: 'debit',
      amount: -amount,
      balanceBefore: user.wallet + amount,
      balanceAfter: user.wallet,
      source: 'withdrawal',
      status: 'completed',
      description: `Withdrawal via ${withdrawalMethod === 'upi' ? 'UPI' : 'Bank Transfer'} - ₹${amount}`,
      withdrawalId: withdrawal[0]._id,
      metadata: {
        withdrawalId: withdrawal[0].withdrawalId,
        razorpayPayoutId: payoutData.id,
        withdrawalMethod,
        bankDetails: {
          ifsc: bankDetails.ifsc ? bankDetails.ifsc.toUpperCase() : null,
          accountHolderName: bankDetails.accountHolderName,
          bankName: bankDetails.bankName || '',
          upiId: bankDetails.upiId || null
        }
      }
    }], { session });

    // Update withdrawal with Razorpay details
    withdrawal[0].razorpayPayoutId = payoutData.id;
    withdrawal[0].transactionId = transaction[0]._id;
    withdrawal[0].razorpayResponse = payoutData;
    
    // Status depends on Razorpay initial response
    if (payoutData.status === 'processed' || payoutData.status === 'completed') {
        withdrawal[0].status = 'completed';
        withdrawal[0].completedAt = new Date();
    } else if (payoutData.status === 'failed' || payoutData.status === 'rejected') {
        withdrawal[0].status = 'failed';
        withdrawal[0].failureReason = payoutData.status_details?.reason || 'Razorpay payout failed';
        // Refund wallet
        user.wallet = user.wallet + amount;
        await user.save({ session });
    }

    await withdrawal[0].save({ session });

    // Commit transaction
    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request processed successfully. Money will be credited to your account shortly.',
      data: {
        withdrawalId: withdrawal[0].withdrawalId,
        amount,
        withdrawalFee,
        netAmount,
        status: withdrawal[0].status,
        newBalance: user.wallet,
        razorpayPayoutId: payoutData.id
      }
    });

  } catch (error) {
    if (session.inTransaction()) {
        await session.abortTransaction();
    }
    console.error('Error processing withdrawal:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to process withdrawal request',
      error: error.message
    }, { status: 500 });
  } finally {
    session.endSession();
  }
}

// GET: Fetch withdrawal history
export async function GET(req) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User not authenticated'
      }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    // Build query
    const query = { userId };
    if (status) query.status = status;

    // Get total count
    const totalWithdrawals = await WalletWithdrawalModel.countDocuments(query);

    // Get paginated withdrawals
    const withdrawals = await WalletWithdrawalModel
      .find(query)
      .sort({ requestedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        withdrawals,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalWithdrawals / limit),
          totalWithdrawals,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Error fetching withdrawal history:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch withdrawal history',
      error: error.message
    }, { status: 500 });
  }
}
