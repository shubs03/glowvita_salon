import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import { verifyJwt } from '@repo/lib/auth';
import { cookies } from 'next/headers';
import UserModel from '@repo/lib/models/user/User.model';
import WalletTransactionModel from '@repo/lib/models/Payment/WalletTransaction.model';
import WalletWithdrawalModel from '@repo/lib/models/Payment/WalletWithdrawal.model';
import WalletSettingsModel from '@repo/lib/models/admin/WalletSettings.model';

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

// GET: Fetch user's wallet balance and transaction history
export async function GET(req) {
  try {
    const userId = await getUserId(req);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not authenticated' 
      }, { status: 401 });
    }

    // Get user wallet balance
    const user = await UserModel.findById(userId).select('wallet firstName lastName');
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    // Get wallet settings
    const settings = await WalletSettingsModel.getSettings();

    // Parse query parameters for pagination and filters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type'); // 'credit' or 'debit'
    const source = searchParams.get('source');
    const status = searchParams.get('status');

    // Build query
    const query = { userId };
    if (type) query.transactionType = type;
    if (source) query.source = source;
    if (status) query.status = status;

    // Get total count
    const totalTransactions = await WalletTransactionModel.countDocuments(query);

    // Get paginated transactions
    const transactions = await WalletTransactionModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Calculate stats
    const [
      totalDeposits,
      totalWithdrawals,
      totalReferralEarnings,
      pendingWithdrawals
    ] = await Promise.all([
      // Total deposits
      WalletTransactionModel.aggregate([
        {
          $match: {
            userId: user._id,
            transactionType: 'credit',
            status: 'completed'
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Total withdrawals
      WalletTransactionModel.aggregate([
        {
          $match: {
            userId: user._id,
            source: 'withdrawal',
            status: 'completed'
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Total referral earnings
      WalletTransactionModel.aggregate([
        {
          $match: {
            userId: user._id,
            source: 'referral_bonus',
            status: 'completed'
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Pending withdrawals
      WalletWithdrawalModel.find({
        userId: user._id,
        status: { $in: ['pending', 'processing'] }
      }).lean()
    ]);

    // Get today's withdrawal stats for limits
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

    return NextResponse.json({
      success: true,
      data: {
        balance: user.wallet || 0,
        userName: `${user.firstName} ${user.lastName}`,
        transactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalTransactions / limit),
          totalTransactions,
          limit
        },
        stats: {
          totalDeposits: totalDeposits[0]?.total || 0,
          totalWithdrawals: Math.abs(totalWithdrawals[0]?.total || 0),
          totalReferralEarnings: totalReferralEarnings[0]?.total || 0,
          pendingWithdrawalsCount: pendingWithdrawals.length,
          pendingWithdrawalsAmount: pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0)
        },
        withdrawalLimits: {
          minWithdrawal: settings.minWithdrawalAmount,
          maxWithdrawal: settings.maxWithdrawalAmount,
          maxDailyWithdrawal: settings.maxDailyWithdrawalAmount,
          maxWithdrawalsPerDay: settings.maxWithdrawalsPerDay,
          withdrawalFeeType: settings.withdrawalFeeType,
          withdrawalFeeValue: settings.withdrawalFeeValue,
          todayWithdrawalsCount: todayStats.count,
          todayWithdrawalsAmount: todayStats.totalAmount,
          canWithdrawToday: todayStats.count < settings.maxWithdrawalsPerDay &&
                           todayStats.totalAmount < settings.maxDailyWithdrawalAmount
        }
      }
    });

  } catch (error) {
    console.error('Error fetching wallet data:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch wallet data',
      error: error.message
    }, { status: 500 });
  }
}
