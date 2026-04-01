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
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";
import mongoose from "mongoose";

await _db();

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
        failed: await WalletWithdrawalModel.countDocuments({ ...query, status: { $in: ["failed", "rejected_by_system"] } }),
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

// PATCH: Approve or Reject a withdrawal request
export const PATCH = authMiddlewareAdmin(
  async (req) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { id, action, rejectionReason } = await req.json();

      if (!id || !action) {
        return Response.json({ success: false, message: "ID and Action are required" }, { status: 400 });
      }

      const withdrawal = await WalletWithdrawalModel.findById(id).session(session);

      if (!withdrawal) {
        return Response.json({ success: false, message: "Withdrawal not found" }, { status: 404 });
      }

      if (withdrawal.status !== "pending") {
        return Response.json({ success: false, message: "Only pending withdrawals can be processed" }, { status: 400 });
      }

      // Get user to handle refund or razorpay payout
      let user;
      let Model;
      if (withdrawal.userType === 'Vendor') Model = VendorModel;
      else if (withdrawal.userType === 'Doctor') Model = DoctorModel;
      else if (withdrawal.userType === 'Supplier') Model = SupplierModel;
      else Model = UserModel;

      user = await Model.findById(withdrawal.userId).session(session);
      if (!user) {
        return Response.json({ success: false, message: "User not found" }, { status: 404 });
      }

      if (action === "approve") {
        // Razorpay payout logic here (copied from the original flow)
        const keyId = (RAZORPAY_KEY_ID || "").trim();
        const keySecret = (RAZORPAY_KEY_SECRET || "").trim();
        const razorpayAccountNumber = (RAZORPAY_ACCOUNT_NUMBER || "").trim();

        if (!keyId || !keySecret || !razorpayAccountNumber) {
          throw new Error("Razorpay payout system not fully configured.");
        }

        // 1. Get/Create Contact
        let contactId = user.razorpayContactId;
        if (!contactId) {
          const displayName = (withdrawal.userType === 'User') 
            ? `${user.firstName} ${user.lastName || ''}`.trim()
            : user.businessName || user.shopName || user.clinicName || user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();

          contactId = await createRazorpayContact({
            name: displayName || 'Glowvita Recipient',
            email: user.emailAddress || user.email,
            phone: user.mobileNumber || user.phone || '9999999999',
            userId: user._id
          }, keyId, keySecret);

          if (!contactId) throw new Error("Failed to create Razorpay identity.");
          user.razorpayContactId = contactId;
          await user.save({ session });
        }

        // 2. Create Fund Account
        const fundAccountId = await createRazorpayFundAccount(contactId, {
            accountHolderName: withdrawal.bankDetails.accountHolderName,
            accountNumber: withdrawal.bankDetails.accountNumber,
            ifsc: withdrawal.bankDetails.ifsc,
            upiId: withdrawal.bankDetails.upiId
        }, keyId, keySecret);

        if (!fundAccountId) throw new Error("Failed to create fund account in Razorpay.");

        // 3. Initiate Payout
        const payoutData = await initiateRazorpayPayout({
            razorpayAccountNumber,
            fundAccountId,
            amount: withdrawal.netAmount,
            mode: withdrawal.bankDetails.upiId ? "UPI" : "IMPS",
            referenceId: withdrawal.withdrawalId,
            narration: `Approved: ${withdrawal.withdrawalId}`
        }, keyId, keySecret);

        if (payoutData.error) {
            throw new Error(`Razorpay Error: ${payoutData.error.description}`);
        }

        // 4. Update Records
        withdrawal.status = "processing"; // Move to processing while Razorpay handles it
        withdrawal.razorpayPayoutId = payoutData.id;
        withdrawal.razorpayResponse = payoutData;
        withdrawal.processedAt = new Date();
        
        if (payoutData.status === "processed" || payoutData.status === "completed") {
            withdrawal.status = "completed";
            withdrawal.completedAt = new Date();
        }

        await withdrawal.save({ session });

        // Update transaction status
        if (withdrawal.transactionId) {
            await WalletTransactionModel.findByIdAndUpdate(withdrawal.transactionId, { 
                status: (payoutData.status === "processed" || payoutData.status === "completed") ? "completed" : "processing" 
            }).session(session);
        }

        await session.commitTransaction();

        return Response.json({
          success: true,
          message: "Withdrawal approved and payment initiated",
          data: { withdrawalId: withdrawal.withdrawalId, status: withdrawal.status }
        });

      } else if (action === "approve_manual") {
        // Manual approval logic (Mark as paid without Razorpay)
        withdrawal.status = "completed";
        withdrawal.completedAt = new Date();
        withdrawal.processedAt = new Date();
        withdrawal.adminNotes = rejectionReason || "Approved manually by administrator";
        await withdrawal.save({ session });

        // Update transaction status
        if (withdrawal.transactionId) {
            await WalletTransactionModel.findByIdAndUpdate(withdrawal.transactionId, { 
                status: "completed",
                description: `Manual Payout: ${withdrawal.adminNotes}`
            }).session(session);
        }

        await session.commitTransaction();

        return Response.json({
          success: true,
          message: "Withdrawal marked as completed manually",
          data: { withdrawalId: withdrawal.withdrawalId, status: withdrawal.status }
        });

      } else if (action === "reject") {
        // Rejection logic: Refund wallet
        user.wallet = (user.wallet || 0) + withdrawal.amount;
        await user.save({ session });

        withdrawal.status = "cancelled"; // or 'rejected'
        withdrawal.rejectionReason = rejectionReason || "Rejected by administrator";
        withdrawal.processedAt = new Date();
        await withdrawal.save({ session });

        // Update/Cancel transaction
        if (withdrawal.transactionId) {
            await WalletTransactionModel.findByIdAndUpdate(withdrawal.transactionId, { 
                status: "failed",
                description: `Rejected: ${withdrawal.rejectionReason}`
            }).session(session);
        }

        await session.commitTransaction();

        return Response.json({
          success: true,
          message: "Withdrawal request rejected and funds returned to wallet",
          data: { withdrawalId: withdrawal.withdrawalId, status: withdrawal.status }
        });

      } else {
        return Response.json({ success: false, message: "Invalid action" }, { status: 400 });
      }

    } catch (error) {
      if (session.inTransaction()) await session.abortTransaction();
      console.error("Error processing admin withdrawal (PATCH):", error);
      return Response.json({
        success: false,
        message: error.message || "Failed to process withdrawal action"
      }, { status: 500 });
    } finally {
      session.endSession();
    }
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN"]
);
