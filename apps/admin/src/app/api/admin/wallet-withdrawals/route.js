import _db from "@repo/lib/db";
import WalletWithdrawalModel from "@repo/lib/models/Payment/WalletWithdrawal.model";
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
