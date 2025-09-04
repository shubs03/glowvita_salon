import { NextResponse } from "next/server";
import { authMiddlewareCrm } from "@repo/lib/middlewareAdmin";
import _db from "@repo/lib/db";
import VendorModel from "@repo/lib/models/Vendor/Vendor.model";
import SupplierModel from "@repo/lib/models/Vendor/Supplier.model";
import DoctorModel from "@repo/lib/models/Vendor/Docters.model";
import SubscriptionPlanModel from "@repo/lib/models/admin/SubscriptionPlan.model";

const getUserModel = (userType) => {
  switch (userType) {
    case 'vendor':
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
    const userId = req.user._id;

    if (!planId) {
      return NextResponse.json({ 
        success: false, 
        message: "Plan ID is required" 
      }, { status: 400 });
    }

    // Get the new plan details
    const newPlan = await SubscriptionPlanModel.findById(planId);
    if (!newPlan || !newPlan.isAvailableForPurchase || newPlan.status !== 'Active') {
      return NextResponse.json({ 
        success: false, 
        message: "Selected plan is not available" 
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

    // Calculate new subscription dates
    const startDate = new Date();
    const endDate = new Date();
    
    switch (newPlan.durationType) {
      case 'days':
        endDate.setDate(endDate.getDate() + newPlan.duration);
        break;
      case 'weeks':
        endDate.setDate(endDate.getDate() + (newPlan.duration * 7));
        break;
      case 'months':
        endDate.setMonth(endDate.getMonth() + newPlan.duration);
        break;
      case 'years':
        endDate.setFullYear(endDate.getFullYear() + newPlan.duration);
        break;
    }

    // Add current plan to history if exists
    if (user.subscription && user.subscription.plan) {
      const currentPlan = {
        plan: user.subscription.plan,
        startDate: user.subscription.startDate,
        endDate: user.subscription.endDate,
        status: user.subscription.status
      };

      if (!user.subscription.history) {
        user.subscription.history = [];
      }
      user.subscription.history.push(currentPlan);
    }

    // Update subscription
    user.subscription = {
      plan: newPlan._id,
      status: 'Active',
      startDate,
      endDate,
      history: user.subscription?.history || []
    };

    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: "Subscription plan changed successfully",
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
}, ['vendor', 'supplier', 'doctor']);
