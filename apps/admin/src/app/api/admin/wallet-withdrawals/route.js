import _db from "@repo/lib/db";
import WalletWithdrawalModel from "@repo/lib/models/Payment/WalletWithdrawal.model";
import WalletTransactionModel from "@repo/lib/models/Payment/WalletTransaction.model";
import UserModel from "@repo/lib/models/user/User.model";
import VendorModel from "@repo/lib/models/Vendor/Vendor.model";
import DoctorModel from "@repo/lib/models/Vendor/Docters.model"; // Note: filename typo preserved
import SupplierModel from "@repo/lib/models/Vendor/Supplier.model";
import {
  createRazorpayContact,
  createRazorpayFundAccount,
  initiateRazorpayPayout
} from "@repo/lib/utils/razorpayPayout";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_ACCOUNT_NUMBER } from "@repo/config/config";
import DoctorModel from "@repo/lib/models/Vendor/Docters.model";
import SupplierModel from "@repo/lib/models/Vendor/Supplier.model";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";
import mongoose from "mongoose";

await _db();

// Helper to get the correct model based on user type
const getModelByUserType = (userType) => {
  switch (userType) {
    case 'User': return UserModel;
    case 'Vendor': return VendorModel;
    case 'Doctor': return DoctorModel;
    case 'Supplier': return SupplierModel;
    default: return null;
  }
};

// GET: Fetch all withdrawals with region filtering
export const GET = authMiddlewareAdmin(
  async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page")) || 1;
      const limit = parseInt(searchParams.get("limit")) || 10;
      const status = searchParams.get("status");
      const regionId = searchParams.get("regionId");
      const search = searchParams.get("search");
      const userType = searchParams.get("userType");

      const query = {};

      // Region filtering
      if (regionId && regionId !== "all") {
        query.regionId = new mongoose.Types.ObjectId(regionId);
      } else if (req.user.role === "REGIONAL_ADMIN") {
        // If regional admin and no regionId specified, force their region
        query.regionId = req.user.regionId;
      }

      // Status filtering
      if (status && status !== "all") {
        query.status = status;
      }

      // User type filtering
      if (userType && userType !== "all") {
        query.userType = userType;
      }

      // Search functionality (on ID or account holder name)
      if (search) {
        query.$or = [
          { withdrawalId: { $regex: search, $options: "i" } },
          { "bankDetails.accountHolderName": { $regex: search, $options: "i" } }
        ];
      }

      const skip = (page - 1) * limit;

      // Execute query with population
      const withdrawals = await WalletWithdrawalModel.find(query)
        .populate("userId", "firstName lastName businessName name shopName email phone")
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await WalletWithdrawalModel.countDocuments(query);

      // Map response to include user names based on user type
      const formattedWithdrawals = withdrawals.map(w => {
        const withdrawal = w.toObject();
        let userName = "Unknown";

        if (withdrawal.userId) {
          if (withdrawal.userType === 'Vendor') {
            userName = withdrawal.userId.businessName || `${withdrawal.userId.firstName} ${withdrawal.userId.lastName}`;
          } else if (withdrawal.userType === 'Doctor') {
            userName = withdrawal.userId.name;
          } else if (withdrawal.userType === 'Supplier') {
            userName = withdrawal.userId.shopName || `${withdrawal.userId.firstName} ${withdrawal.userId.lastName}`;
          } else {
            userName = `${withdrawal.userId.firstName} ${withdrawal.userId.lastName}`;
          }
        }

        return {
          ...withdrawal,
          userName
        };
      });

      // Calculate stats for the summary cards
      const stats = {
        total: await WalletWithdrawalModel.countDocuments(query),
        pending: await WalletWithdrawalModel.countDocuments({ ...query, status: "pending" }),
        processing: await WalletWithdrawalModel.countDocuments({ ...query, status: "processing" }),
        completed: await WalletWithdrawalModel.countDocuments({ ...query, status: "completed" }),
        failed: await WalletWithdrawalModel.countDocuments({ ...query, status: { $in: ["failed", "rejected_by_system", "cancelled"] } }),
        totalPaid: await WalletWithdrawalModel.aggregate([
          { $match: { ...query, status: "completed" } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]).then(res => res[0]?.total || 0),
        highRisk: await WalletWithdrawalModel.countDocuments({ ...query, riskScore: { $gte: 70 } })
      };

      return Response.json({
        success: true,
        data: formattedWithdrawals,
        stats,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching admin withdrawals:", error);
      return Response.json(
        {
          success: false,
          message: "Failed to fetch withdrawals",
          error: error.message
        },
        { status: 500 }
      );
    }
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN"]
);

// PATCH: Approve or Reject withdrawal request
export const PATCH = authMiddlewareAdmin(
  async (req) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { withdrawalId, action, reason } = await req.json();

      if (!withdrawalId || !action) {
        return Response.json({ success: false, message: "Missing withdrawal ID or action" }, { status: 400 });
      }

      const withdrawal = await WalletWithdrawalModel.findById(withdrawalId).session(session);
      if (!withdrawal) {
        return Response.json({ success: false, message: "Withdrawal request not found" }, { status: 404 });
      }

      if (withdrawal.status !== 'pending') {
        return Response.json({ success: false, message: `Cannot ${action} a withdrawal that is already ${withdrawal.status}` }, { status: 400 });
      }

      const Model = getModelByUserType(withdrawal.userType);
      const user = await Model.findById(withdrawal.userId).session(session);

      if (action === 'approve') {
        // Update withdrawal status
        withdrawal.status = 'completed';
        withdrawal.processedAt = new Date();
        withdrawal.completedAt = new Date();
        withdrawal.adminNotes = reason || "Approved by admin";
        await withdrawal.save({ session });

        // Update related transaction
        if (withdrawal.transactionId) {
          await WalletTransactionModel.findByIdAndUpdate(
            withdrawal.transactionId,
            { status: 'completed', description: `Wallet Withdrawal - ₹${withdrawal.amount} (Approved)` },
            { session }
          );
        }

        await session.commitTransaction();
        return Response.json({ success: true, message: "Withdrawal approved successfully" });

      } else if (action === 'reject') {
        // Update withdrawal status
        withdrawal.status = 'cancelled';
        withdrawal.rejectionReason = reason || "Rejected by admin";
        withdrawal.processedAt = new Date();
        await withdrawal.save({ session });

        // Credit back the amount to user's wallet
        if (user) {
          user.wallet = (user.wallet || 0) + withdrawal.amount;
          await user.save({ session });
        }

        // Update related transaction
        if (withdrawal.transactionId) {
          await WalletTransactionModel.findByIdAndUpdate(
            withdrawal.transactionId,
            { status: 'failed', description: `Wallet Withdrawal Rejected - ₹${withdrawal.amount}` },
            { session }
          );
        }

        // Create a credit transaction for the refund
        const txId = `WTX_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        await WalletTransactionModel.create([{
          transactionId: txId,
          userId: withdrawal.userId,
          userType: withdrawal.userType,
          regionId: withdrawal.regionId,
          transactionType: 'credit',
          amount: withdrawal.amount,
          balanceBefore: user ? user.wallet - withdrawal.amount : 0,
          balanceAfter: user ? user.wallet : 0,
          source: 'refund',
          status: 'completed',
          description: `Refund for rejected withdrawal ${withdrawal.withdrawalId}`,
          metadata: {
            originalWithdrawalId: withdrawal._id
          }
        }], { session });

        await session.commitTransaction();
        return Response.json({ success: true, message: "Withdrawal rejected and amount refunded to wallet" });
      } else {
        return Response.json({ success: false, message: "Invalid action" }, { status: 400 });
      }

    } catch (error) {
      if (session.inTransaction()) await session.abortTransaction();
      console.error("Error processing withdrawal action:", error);
      return Response.json({ success: false, message: error.message }, { status: 500 });
    } finally {
      session.endSession();
    }
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN"]
);
