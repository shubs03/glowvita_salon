
import { NextResponse } from "next/server";
import { authMiddlewareCrm } from "../../../../middlewareCrm.js";
import _db from "@repo/lib/db";
import VendorModel from "@repo/lib/models/Vendor/Vendor.model";
import SupplierModel from "@repo/lib/models/Vendor/Supplier.model";
import DoctorModel from "@repo/lib/models/Vendor/Docters.model";
import SubscriptionPlanModel from "@repo/lib/models/admin/SubscriptionPlan.model";
import { queueOrActivateSubscription } from "@repo/lib/utils/subscriptionSchedule";

const getUserModel = (userType) => {
  switch (userType) {
    case 'vendor':
    case 'staff':
      return VendorModel;
    case 'supplier':
      return SupplierModel;
    case 'doctor':
      return DoctorModel;
    default:
      throw new Error('Invalid user type');
  }
};

// Change subscription plan
export const POST = authMiddlewareCrm(async (req) => {
  try {
    await _db();
    const { planId, userType } = await req.json();
    const userId = req.user.userId || req.user._id;

    console.log('Change Plan Request:', { planId, userType, userId });

    if (!planId) {
      return NextResponse.json({
        success: false,
        message: "Plan ID is required"
      }, { status: 400 });
    }

    // Get user's current subscription
    const UserModel = getUserModel(userType);
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found"
      }, { status: 404 });
    }

    // Get the new plan details
    const newPlan = await SubscriptionPlanModel.findById(planId);
    if (!newPlan || !newPlan.isAvailableForPurchase || newPlan.status !== 'Active') {
      return NextResponse.json({
        success: false,
        message: "Selected plan is not available"
      }, { status: 400 });
    }

    // Regional availability check
    const userRegion = user.regionId;
    if (!newPlan.regionId) {
      // Global plan: check if disabled for this region
      if (newPlan.disabledRegions?.map(r => r.toString()).includes(userRegion?.toString())) {
        return NextResponse.json({ success: false, message: "Selected plan is not available for your region" }, { status: 400 });
      }
    } else {
      // Regional plan: check if matches user's region
      if (newPlan.regionId.toString() !== userRegion?.toString()) {
        return NextResponse.json({ success: false, message: "Selected plan is not available for your region" }, { status: 400 });
      }
    }

    const subscriptionUpdate = queueOrActivateSubscription(user, newPlan);

    await user.save();

    // Check for referral credit if regular (paid) plan
    const isRegularPlan = newPlan.planType === 'regular' || (newPlan.price !== undefined && newPlan.price > 0);
    if (isRegularPlan) {
      try {
        const { checkAndCreditSubscriptionReferral } = await import("@repo/lib/utils/referralWalletCredit");
        const referralResult = await checkAndCreditSubscriptionReferral(userId, newPlan);
        console.log('[Referral Bonus] Subscription change referral result:', referralResult);
      } catch (err) {
        console.error("[Referral Bonus] Check failed on subscription change:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: subscriptionUpdate.mode === 'Scheduled'
        ? "Subscription plan purchased and scheduled successfully"
        : "Subscription plan changed successfully",
      data: user.subscription
    }, { status: 200 });

  } catch (error) {
    console.error('Error changing subscription plan:', error);
    return NextResponse.json({
      success: false,
      message: "Failed to change subscription plan",
      error: error.message
    }, { status: 500 });
  }
}, ['vendor', 'supplier', 'doctor', 'staff']);
