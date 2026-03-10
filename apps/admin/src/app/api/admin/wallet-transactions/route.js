import _db from "@repo/lib/db";
import WalletTransactionModel from "@repo/lib/models/Payment/WalletTransaction.model";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";
import mongoose from "mongoose";

await _db();

// GET: Fetch all wallet transactions with region filtering
export const GET = authMiddlewareAdmin(
  async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page")) || 1;
      const limit = parseInt(searchParams.get("limit")) || 10;
      const type = searchParams.get("type"); // credit or debit
      const status = searchParams.get("status");
      const regionId = searchParams.get("regionId");
      const search = searchParams.get("search");
      const userType = searchParams.get("userType");
      const source = searchParams.get("source");

      const query = {};

      // Region filtering
      if (regionId && regionId !== "all") {
        query.regionId = new mongoose.Types.ObjectId(regionId);
      } else if (req.user.role === "REGIONAL_ADMIN") {
        query.regionId = req.user.regionId;
      }

      // Type filtering
      if (type && type !== "all") {
        query.transactionType = type;
      }

      // Status filtering
      if (status && status !== "all") {
        query.status = status;
      }

      // User type filtering
      if (userType && userType !== "all") {
        query.userType = userType;
      }

      // Source filtering
      if (source && source !== "all") {
        query.source = source;
      }

      // Search functionality
      if (search) {
        query.$or = [
          { transactionId: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ];
      }

      const skip = (page - 1) * limit;

      // Execute query with population
      const transactions = await WalletTransactionModel.find(query)
        .populate("userId", "firstName lastName businessName name shopName email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await WalletTransactionModel.countDocuments(query);

      // Format response
      const formattedTransactions = transactions.map(t => {
        const transaction = t.toObject();
        let userName = "Unknown";
        
        if (transaction.userId) {
          if (transaction.userType === 'Vendor') {
            userName = transaction.userId.businessName || `${transaction.userId.firstName} ${transaction.userId.lastName}`;
          } else if (transaction.userType === 'Doctor') {
            userName = transaction.userId.name;
          } else if (transaction.userType === 'Supplier') {
            userName = transaction.userId.shopName || `${transaction.userId.firstName} ${transaction.userId.lastName}`;
          } else {
            userName = `${transaction.userId.firstName} ${transaction.userId.lastName}`;
          }
        }

        return {
          ...transaction,
          userName
        };
      });

      // Stats
      const stats = {
        totalTransactions: total,
        totalCredits: await WalletTransactionModel.aggregate([
          { $match: { ...query, transactionType: "credit", status: "completed" } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]).then(res => res[0]?.total || 0),
        totalDebits: await WalletTransactionModel.aggregate([
          { $match: { ...query, transactionType: "debit", status: "completed" } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]).then(res => Math.abs(res[0]?.total || 0)),
        netFlow: await WalletTransactionModel.aggregate([
          { $match: { ...query, status: "completed" } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]).then(res => res[0]?.total || 0)
      };

      return Response.json({
        success: true,
        data: formattedTransactions,
        stats,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching admin transactions:", error);
      return Response.json(
        { 
          success: false,
          message: "Failed to fetch transactions",
          error: error.message 
        },
        { status: 500 }
      );
    }
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN"]
);
