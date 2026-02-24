// crm/api/referrals/route.js

import _db from "../../../../../../../packages/lib/src/db.js";
import { ReferralModel, V2VSettingsModel, D2DSettingsModel, S2SSettingsModel } from "../../../../../../../packages/lib/src/models/admin/Reffer.model.js";
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import DoctorModel from '@repo/lib/models/Vendor/Docters.model';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
import { authMiddlewareCrm } from "../../../../middlewareCrm.js";

await _db();

// Helper function to get the appropriate settings model - always use V2V for all roles
const getSettingsModel = (referralType) => {
  // Always use V2V settings for all roles
  return V2VSettingsModel;
};

// Helper function to get referral type - always use V2V for all roles
const getReferralTypeByRole = (role) => {
  // Always use V2V referral type for all roles
  return 'V2V';
};

// Helper function to get user model based on role
const getUserModel = (role) => {
  switch (role) {
    case 'vendor':
      return VendorModel;
    case 'doctor':
      return DoctorModel;
    case 'supplier':
      return SupplierModel;
    default:
      return VendorModel;
  }
};

// Get Referrals for the logged-in user
export const GET = authMiddlewareCrm(async (req) => {
  const user = req.user;
  const userRole = req.user.role;
  
  try {
    const url = new URL(req.url);
    const requestedReferralType = url.searchParams.get('referralType');
    
    // Always use V2V referral type for all roles
    const referralType = 'V2V';
    
    // Get user's business name/name for filtering
    // First try to get it from the JWT payload directly
    let referrerName = user.businessName || user.name || user.shopName;
    
    // If not in JWT payload, fetch from database
    if (!referrerName) {
      const UserModel = getUserModel(userRole);
      // Use the userId from JWT payload (note: it's userId, not _id)
      const userId = user.userId || user._id || user.id;
      if (!userId) {
        console.error("User ID not found in token", user);
        return Response.json({ message: "User ID not found in token" }, { status: 400 });
      }
      
      const userData = await UserModel.findById(userId);
      
      if (!userData) {
        console.error("User not found in database", { userId, userRole });
        return Response.json({ message: "User not found" }, { status: 404 });
      }
      
      referrerName = userData.businessName || userData.name || userData.shopName || (userData.firstName + ' ' + userData.lastName);
    }
    
    // Get referrals where this user is the referrer
    const referrals = await ReferralModel.find({ 
      referralType,
      referrer: referrerName 
    }).sort({ date: -1 });

    return Response.json(referrals);
  } catch (error) {
    console.error("Error fetching referrals:", error);
    return Response.json(
      { message: "Failed to fetch referrals" },
      { status: 500 }
    );
  }
}, ['vendor', 'doctor', 'supplier']);

// Get Settings for referral program
export const POST = authMiddlewareCrm(async (req) => {
  const user = req.user;
  const userRole = req.user.role;
  
  try {
    const { action, referralType: requestedReferralType } = await req.json();
    
    if (action === 'getSettings') {
      // Always use V2V settings for all roles
      const referralType = 'V2V';
      const SettingsModel = getSettingsModel(referralType);
      const userRegion = req.user.regionId;
      
      // Try to find regional settings first
      let settings = null;
      if (userRegion) {
        settings = await SettingsModel.findOne({ referralType, regionId: userRegion }).lean();
      }
      
      // Fallback to global settings if no regional settings exist
      if (!settings) {
        settings = await SettingsModel.findOne({ referralType, regionId: null }).lean();
      }
      
      // Return default settings if none exist
      if (!settings) {
        return Response.json({
          referralType: 'V2V',
          referrerBonus: { 
            bonusType: 'amount', 
            bonusValue: 0, 
            creditTime: '7 days' 
          },
          refereeBonus: { 
            enabled: false,
            bonusType: 'amount',
            bonusValue: 0,
            creditTime: '7 days'
          },
          usageLimit: 'unlimited',
          usageCount: 0,
          minOrders: 0,
          minBookings: 0,
          minPayoutCycle: 0,
        });
      }
      
      return Response.json(settings);
    }
    
    return Response.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in referrals API:", error);
    return Response.json(
      { message: "Failed to process request" },
      { status: 500 }
    );
  }
}, ['vendor', 'doctor', 'supplier']);
