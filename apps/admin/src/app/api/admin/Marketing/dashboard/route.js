import { NextResponse } from 'next/server';
import _db from "@repo/lib/db";
import SmsTransaction from "@repo/lib/models/Marketing/SmsPurchaseHistory.model";
import Campaign from "@repo/lib/models/Marketing/Campaign.model";
import { authMiddlewareAdmin } from "../../../../../middlewareAdmin.js";

export const GET = authMiddlewareAdmin(async (req) => {
  try {
    await _db();
    
    // Fetch SMS Purchase History & calculate total revenue
    const smsTransactions = await SmsTransaction.aggregate([
      {
        $lookup: {
          from: "vendors",
          localField: "userId",
          foreignField: "_id",
          as: "vendorInfo"
        }
      },
      {
        $lookup: {
          from: "suppliers",
          localField: "userId",
          foreignField: "_id",
          as: "supplierInfo"
        }
      },
      {
        $addFields: {
          vendorInfo: { $arrayElemAt: ["$vendorInfo", 0] },
          supplierInfo: { $arrayElemAt: ["$supplierInfo", 0] }
        }
      },
      {
        $addFields: {
          userInfo: {
            $cond: {
              if: { $eq: ["$userType", "vendor"] },
              then: "$vendorInfo",
              else: "$supplierInfo"
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          vendorName: {
            $cond: {
              if: { $eq: ["$userType", "vendor"] },
              then: "$userInfo.businessName",
              else: "$userInfo.shopName"
            }
          },
          packageName: 1,
          smsCount: 1,
          price: 1,
          purchaseDate: 1,
          expiryDate: 1,
          status: 1,
          userType: 1,
          invoiceNumber: 1,
          paymentMethod: 1,
          _id_str: { $toString: "$_id" }
        }
      },
      { $sort: { purchaseDate: -1 } }
    ]);

    // Calculate total marketing revenue
    const totalMarketingRevenue = smsTransactions.reduce((acc, curr) => acc + (curr.price || 0), 0);

    // Fetch Active Campaigns & calculate SMS sent
    const allCampaigns = await Campaign.aggregate([
      {
        $lookup: {
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendorInfo"
        }
      },
      {
        $addFields: {
          vendorInfo: { $arrayElemAt: ["$vendorInfo", 0] }
        }
      },
      {
        $project: {
          _id: 1,
          vendorName: "$vendorInfo.businessName",
          type: 1,
          budget: 1,
          status: 1,
          metrics: 1,
          scheduledDate: 1,
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    const activeCampaigns = allCampaigns.filter(c => c.status === 'Active');
    
    // Calculate total SMS sent from campaigns
    let smsSentCount = 0;
    allCampaigns.forEach(c => {
      if (c.type && c.type.includes('SMS') && c.metrics && c.metrics.messagesSent) {
        smsSentCount += c.metrics.messagesSent;
      }
    });

    // Format purchase history
    const formattedPurchaseHistory = smsTransactions.map(tx => ({
      id: tx._id.toString(),
      vendorName: tx.vendorName || 'Unknown Vendor',
      item: tx.packageName,
      smsCount: tx.smsCount,
      date: tx.purchaseDate,
      expiryDate: tx.expiryDate,
      amount: tx.price,
      status: tx.status === 'active' ? 'Active' : tx.status === 'expired' ? 'Expired' : 'Used',
      userType: tx.userType,
      invoiceNumber: tx.invoiceNumber || `MKT-OLD-${tx._id_str.slice(-4)}`,
      paymentMethod: tx.paymentMethod || 'Online'
    }));

    const formattedActiveCampaigns = activeCampaigns.map(c => ({
      id: c._id.toString(),
      vendorName: c.vendorName || 'Unknown Vendor',
      campaignType: Array.isArray(c.type) ? c.type.join(', ') : c.type,
      startDate: c.scheduledDate || c.createdAt,
      endDate: c.scheduledDate || c.createdAt,
      budget: c.budget || 0,
      status: c.status,
      messagesSent: c.metrics?.messagesSent || 0,
      openRate: c.metrics?.openRate || 0,
      impressions: 0,
      ctr: 0
    }));

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalMarketingRevenue,
          smsSentCount,
          activeCampaignsCount: activeCampaigns.length,
          openTicketsCount: 0
        },
        activeCampaigns: formattedActiveCampaigns,
        purchaseHistory: formattedPurchaseHistory
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching Marketing Dashboard:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"]);
