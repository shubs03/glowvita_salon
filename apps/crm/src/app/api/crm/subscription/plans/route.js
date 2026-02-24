import { NextResponse } from "next/server";
import _db from "@repo/lib/db";
import SubscriptionPlan from "@repo/lib/models/admin/SubscriptionPlan";
import { authMiddlewareCrm } from "../../../../../middlewareCrm.js";

export const GET = authMiddlewareCrm(async (req) => {
  try {
    await _db();
    
    const userRole = (req.user.role || '').toLowerCase();
    const effectiveUserType = userRole === 'staff' ? 'vendor' : userRole;
    let userRegion = req.user.regionId ? req.user.regionId.toString() : null;

    console.log(`[CRM Plans] Initial attempt. User: ${req.user.userId}, Role: ${userRole}, Region: ${userRegion}`);

    // Fallback: If regionId missing from token, try to fetch from User model
    if (!userRegion) {
      try {
        const userId = req.user.userId || req.user.id;
        console.log(`[CRM Plans] Region missing in token, falling back to database for userId: ${userId}`);
        
        let Model;
        const normalizedRole = effectiveUserType.toLowerCase();
        
        if (normalizedRole === 'vendor') {
           const { default: Vendor } = await import("@repo/lib/models/Vendor/Vendor.model");
           Model = Vendor;
        } else if (normalizedRole === 'doctor') {
           const { default: Doctor } = await import("@repo/lib/models/Vendor/Docters.model");
           Model = Doctor;
        } else if (normalizedRole === 'supplier') {
           const { default: Supplier } = await import("@repo/lib/models/Vendor/Supplier.model");
           Model = Supplier;
        }
        
        if (Model && userId) {
          const userDoc = await Model.findById(userId).select('regionId').lean();
          if (userDoc?.regionId) {
            userRegion = userDoc.regionId.toString();
            console.log(`[CRM Plans] Found region in database: ${userRegion}`);
          } else {
            console.log(`[CRM Plans] No regionId found in database for user ${userId}`);
          }
        }
      } catch (err) {
        console.warn("[CRM Plans] Could not fallback lookup region:", err.message);
      }
    }

    // Regional query matching "all-offers" logic:
    // 1. If user has a regionId: show that region's plans + global plans (filtered later)
    // 2. If user has no regionId: show global plans only
    const regionQuery = userRegion
      ? { $or: [{ regionId: userRegion }, { regionId: null }] }
      : { regionId: null };

    const query = {
      isAvailableForPurchase: true,
      status: 'Active',
      // Check both userTypes (plural) and userType (singular) for robustness
      $or: [
        { userTypes: { $in: [effectiveUserType] } },
        { userType: { $in: [effectiveUserType] } }
      ],
      ...regionQuery
    };

    console.log("[CRM Plans] Executing Mongo Query:", JSON.stringify(query));

    const plans = await SubscriptionPlan.find(query).sort({ regionId: -1, createdAt: -1 }).lean();
    
    console.log(`[CRM Plans] Found ${plans.length} candidate plans in DB`);

    // Filter global plans disabled for this region
    // Matches logic in apps/web/src/app/api/all-offers/route.js
    const finalPlans = plans.filter(plan => {
      // Global plans (regionId: null) can be disabled per region
      if (!plan.regionId && userRegion) {
        const disabledList = (plan.disabledRegions || []).map(r => r.toString());
        if (disabledList.includes(userRegion)) {
          console.log(`[CRM Plans] Skipped global plan "${plan.name}" (disabled for region ${userRegion})`);
          return false;
        }
      }
      return true;
    });

    console.log(`[CRM Plans] Returning ${finalPlans.length} plans to client. Region: ${userRegion}`);
    return NextResponse.json(finalPlans, { status: 200 });
  } catch (error) {
    console.error("Error fetching subscription plans (CRM):", error);
    return NextResponse.json(
      { message: "Error fetching subscription plans", error: error.message },
      { status: 500 }
    );
  }
});
