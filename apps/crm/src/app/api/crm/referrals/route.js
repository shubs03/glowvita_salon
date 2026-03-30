// crm/api/referrals/route.js

import mongoose from "mongoose";
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
  const userId = req.user.userId || req.user._id;
  const userRole = req.user.role;
  
  try {
    const UserModel = getUserModel(userRole);
    const userData = await UserModel.findById(userId).lean();
    const possibleNames = [];
    if (userData) {
      if (userData.businessName) possibleNames.push(userData.businessName);
      if (userData.shopName) possibleNames.push(userData.shopName);
      if (userData.name) possibleNames.push(userData.name);
      if (userData.firstName || userData.lastName) possibleNames.push(`${userData.firstName || ''} ${userData.lastName || ''}`.trim());
    }

    // Get referrals where this user is the referrer
    // Search by ID or any of their names for legacy support
    const referrals = await ReferralModel.find({ 
      $or: [
        { referrer: userId.toString() },
        { referrer: { $in: possibleNames.filter(n => !!n) } }
      ],
      referralType: { $in: ['V2V', 'C2V', 'D2D', 'S2S', 'C2C'] }
    }).sort({ date: -1 }).lean();

    // Populate referee names
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

    const populatedReferrals = await Promise.all(referrals.map(async (ref) => {
      try {
          const refereeId = ref.referee;
          let refereeName = refereeId || 'New Account';
          
          if (mongoose.Types.ObjectId.isValid(refereeId)) {
            // Aggressive lookup: find this ID across ALL models to ensure we get a name
            const allModels = [Vendor, Doctor, Supplier, User];
            let doc = null;
            
            // Try the recorded type first for speed
            const primaryType = ref.refereeType || 'User';
            const PrimaryModel = getModel(primaryType);
            doc = await PrimaryModel.findById(refereeId).select('firstName lastName businessName shopName name').lean();
            
            // If not found, search others
            if (!doc) {
              const others = allModels.filter(m => m !== PrimaryModel);
              for (const M of others) {
                doc = await M.findById(refereeId).select('firstName lastName businessName shopName name').lean();
                if (doc) break;
              }
            }

            if (doc) {
              if (doc.businessName) refereeName = doc.businessName;
              else if (doc.shopName) refereeName = doc.shopName;
              else if (doc.name) refereeName = doc.name;
              else if (doc.firstName || doc.lastName) refereeName = `${doc.firstName || ''} ${doc.lastName || ''}`.trim();
              else refereeName = 'User Account';
            }
          }

          return {
              ...ref,
              refereeName
          };
      } catch (err) {
          console.error("[CRM] Populate err:", err);
          return {
            ...ref,
            refereeName: ref.referee || 'New Account'
          };
      }
    }));

    return Response.json(populatedReferrals);
  } catch (error) {
    console.error("Error fetching referrals:", error);
    return Response.json({ message: "Failed to fetch referrals" }, { status: 500 });
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
