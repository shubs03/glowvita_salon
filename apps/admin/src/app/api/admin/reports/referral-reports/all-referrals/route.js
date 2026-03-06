import mongoose from "mongoose";
import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import { ReferralModel } from '@repo/lib/models/admin/Reffer.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import DoctorModel from '@repo/lib/models/Vendor/Docters.model';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
import UserModel from '@repo/lib/models/user/User.model';
import { authMiddlewareAdmin } from "../../../../../../middlewareAdmin";
import { getRegionQuery } from "@repo/lib/utils/regionQuery";

// Initialize database connection
const initDb = async () => {
  try {
    await _db();
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to database");
  }
};

// Helper function to determine user type based on ID or name
const determineUserType = async (identifier, referralType) => {
  // Based on referral type, make educated guesses
  if (referralType === 'C2C') {
    return { type: 'Client', name: 'N/A' };
  } else if (referralType === 'C2V') {
    // This could be either Client or Vendor depending on position
    return { type: 'Client/Vendor', name: identifier };
  } else if (referralType === 'V2V') {
    return { type: 'Vendor', name: identifier };
  }
  
  return { type: 'Unknown', name: identifier };
};

// GET - Fetch referral report data
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    console.log("Referral Report API called");
    await initDb();
    
    // Extract filter parameters from query
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const referralType = searchParams.get('referralType');
    const status = searchParams.get('status');
    const city = searchParams.get('city');
    const vendor = searchParams.get('vendor');
    const regionId = searchParams.get('regionId');
    
    console.log("Filter parameters:", { startDateParam, endDateParam, referralType, status, city, vendor });
    
    // Build date filter
    let dateFilter = {};
    if (startDateParam && endDateParam) {
      const startDate = new Date(startDateParam);
      const endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
      dateFilter = { date: { $gte: startDate, $lte: endDate } };
    }
    
    // Build referral type filter
    let referralTypeFilter = {};
    if (referralType && referralType !== 'all') {
      referralTypeFilter = { referralType };
    }
    
    // Build status filter
    let statusFilter = {};
    if (status && status !== 'all') {
      statusFilter = { status };
    }
    
    // Get region query
    const regionQuery = getRegionQuery(req.user, regionId);
    
    // Combine all filters
    const query = {
      ...dateFilter,
      ...referralTypeFilter,
      ...statusFilter,
      ...regionQuery
    };
    
    console.log("MongoDB query:", JSON.stringify(query));
    
    // Fetch referrals
    const referrals = await ReferralModel.find(query).sort({ date: -1 }).lean();
    
    console.log(`Found ${referrals.length} referrals`);
    
    // Format referrals for frontend
    const { default: User } = await import("@repo/lib/models/user/User.model");
    const { default: Vendor } = await import("@repo/lib/models/Vendor/Vendor.model");
    const { default: Doctor } = await import("@repo/lib/models/Vendor/Docters.model");
    const { default: Supplier } = await import("@repo/lib/models/Vendor/Supplier.model");

    const getModel = (type) => {
      switch (type) {
          case 'Vendor': return Vendor;
          case 'Doctor': return Doctor;
          case 'Supplier': return Supplier;
          default: return User;
      }
    };

    const formattedReferrals = await Promise.all(referrals.map(async (ref) => {
      try {
          const RefModel = getModel(ref.referrerType || 'User');
          const ReeModel = getModel(ref.refereeType || 'User');

          let referrerName = ref.referrer || 'N/A';
          let refereeName = ref.referee || 'N/A';

          // Aggressive Name Lookup for Referrer
          if (mongoose.Types.ObjectId.isValid(ref.referrer)) {
              const allModels = [Vendor, Doctor, Supplier, User];
              let doc = null;
              
              const PrimaryModel = getModel(ref.referrerType || 'User');
              doc = await PrimaryModel.findById(ref.referrer).select('firstName lastName businessName shopName name').lean();
              
              if (!doc) {
                for (const M of allModels.filter(m => m !== PrimaryModel)) {
                  doc = await M.findById(ref.referrer).select('firstName lastName businessName shopName name').lean();
                  if (doc) break;
                }
              }

              if (doc) {
                  if (doc.businessName) referrerName = doc.businessName;
                  else if (doc.shopName) referrerName = doc.shopName;
                  else if (doc.name) referrerName = doc.name;
                  else if (doc.firstName || doc.lastName) referrerName = `${doc.firstName || ''} ${doc.lastName || ''}`.trim();
              }
          }

          // Aggressive Name Lookup for Referee
          if (mongoose.Types.ObjectId.isValid(ref.referee)) {
              const allModels = [Vendor, Doctor, Supplier, User];
              let doc = null;
              
              const PrimaryModel = getModel(ref.refereeType || 'User');
              doc = await PrimaryModel.findById(ref.referee).select('firstName lastName businessName shopName name').lean();
              
              if (!doc) {
                for (const M of allModels.filter(m => m !== PrimaryModel)) {
                  doc = await M.findById(ref.referee).select('firstName lastName businessName shopName name').lean();
                  if (doc) break;
                }
              }

              if (doc) {
                  if (doc.businessName) refereeName = doc.businessName;
                  else if (doc.shopName) refereeName = doc.shopName;
                  else if (doc.name) refereeName = doc.name;
                  else if (doc.firstName || doc.lastName) refereeName = `${doc.firstName || ''} ${doc.lastName || ''}`.trim();
              }
          }

          // Extract bonus amount for calculations
          let bonusAmount = 0;
          if (ref.bonus) {
            const match = ref.bonus.match(/[\d.]+/);
            bonusAmount = match ? parseFloat(match[0]) : 0;
          }

          return {
            referralId: ref.referralId || ref._id.toString(),
            referralType: ref.referralType,
            referrerName: referrerName,
            referrerType: ref.referrerType || 'User',
            refereeName: refereeName,
            refereeType: ref.refereeType || 'User',
            date: ref.date || ref.createdAt,
            status: ref.status || 'Pending',
            bonus: ref.bonus || '₹0',
            bonusAmount: bonusAmount
          };
      } catch (err) {
          return {
            referralId: ref.referralId || ref._id.toString(),
            referralType: ref.referralType,
            referrerName: ref.referrer || 'N/A',
            referrerType: ref.referrerType || 'User',
            refereeName: ref.referee || 'N/A',
            refereeType: ref.refereeType || 'User',
            date: ref.date || ref.createdAt,
            status: ref.status || 'Pending',
            bonus: ref.bonus || '₹0',
            bonusAmount: 0
          };
      }
    }));
    
    // Calculate summary statistics
    const summary = {
      totalReferrals: formattedReferrals.length,
      totalBonusAmount: formattedReferrals.reduce((sum, ref) => sum + ref.bonusAmount, 0),
      activeReferrals: formattedReferrals.filter(ref => ref.status === 'Active').length,
      completedReferrals: formattedReferrals.filter(ref => ref.status === 'Completed' || ref.status === 'Bonus Paid').length,
      pendingReferrals: formattedReferrals.filter(ref => ref.status === 'Pending').length,
      c2cCount: formattedReferrals.filter(ref => ref.referralType === 'C2C').length,
      c2vCount: formattedReferrals.filter(ref => ref.referralType === 'C2V').length,
      v2vCount: formattedReferrals.filter(ref => ref.referralType === 'V2V').length,
    };
    
    // Get unique values for filters (optional)
    const cities = [];
    const vendors = [];
    const statuses = ['Pending', 'Active', 'Completed', 'Bonus Paid'];
    
    console.log("Summary:", summary);
    
    return NextResponse.json({
      success: true,
      data: {
        referrals: formattedReferrals,
        summary: summary,
        cities: cities,
        vendors: vendors,
        statuses: statuses
      }
    });
    
  } catch (error) {
    console.error("Referral report error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Failed to fetch referral report data", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "reports:view");
