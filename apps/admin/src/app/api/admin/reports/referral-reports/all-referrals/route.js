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
    const formattedReferrals = referrals.map(ref => {
      // Determine user types based on referral type
      let referrerType = 'Client';
      let refereeType = 'Client';
      
      if (ref.referralType === 'C2C') {
        referrerType = 'Client';
        refereeType = 'Client';
      } else if (ref.referralType === 'C2V') {
        referrerType = 'Client';
        refereeType = 'Vendor';
      } else if (ref.referralType === 'V2V') {
        referrerType = 'Vendor';
        refereeType = 'Vendor';
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
        referrerName: ref.referrer || 'N/A',
        referrerType: referrerType,
        refereeName: ref.referee || 'N/A',
        refereeType: refereeType,
        date: ref.date || ref.createdAt,
        status: ref.status || 'Pending',
        bonus: ref.bonus || '₹0',
        bonusAmount: bonusAmount
      };
    });
    
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
