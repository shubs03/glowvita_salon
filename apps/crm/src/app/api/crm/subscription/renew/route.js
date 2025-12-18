import { NextResponse } from "next/server";
import { authMiddlewareCrm } from "../../../../../middlewareCrm.js";
import _db from "@repo/lib/db";
import VendorModel from "@repo/lib/models/Vendor/Vendor.model";
import SupplierModel from "@repo/lib/models/Vendor/Supplier.model";
import DoctorModel from "@repo/lib/models/Vendor/Docters.model";
import SubscriptionPlanModel from "@repo/lib/models/admin/SubscriptionPlan.model";

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

// Renew subscription plan
export const POST = authMiddlewareCrm(async (req) => {
  try {
    await _db();
    const { planId, userType, amount } = await req.json();
    const userId = req.user.userId || req.user._id;

    console.log('Renew request:', { planId, userType, userId });

    if (!planId) {
      return NextResponse.json({
        success: false,
        message: "Plan ID is required"
      }, { status: 400 });
    }

    const newPlan = await SubscriptionPlanModel.findById(planId);
    if (!newPlan || !newPlan.isAvailableForPurchase || newPlan.status !== 'Active') {
      return NextResponse.json({
        success: false,
        message: "Selected plan is not available"
      }, { status: 400 });
    }

    const UserModel = getUserModel(userType);
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found"
      }, { status: 404 });
    }

    // Compute new subscription period (renew from now)
    const startDate = new Date();
    const endDate = new Date(startDate);

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
      default:
        break;
    }

    // Push current subscription to history if exists
    if (user.subscription && user.subscription.plan) {
      const currentPlan = {
        plan: user.subscription.plan,
        startDate: user.subscription.startDate,
        endDate: user.subscription.endDate,
        status: user.subscription.status === 'Active' && user.subscription.endDate < new Date() ? 'Expired' : user.subscription.status
      };

      if (!Array.isArray(user.subscription.history)) {
        user.subscription.history = [];
      }
      user.subscription.history.push(currentPlan);
    }

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
      message: "Subscription renewed successfully",
      data: user.subscription
    }, { status: 200 });

  } catch (error) {
    console.error('Error renewing subscription plan:', error);
    return NextResponse.json({
      success: false,
      message: "Failed to renew subscription plan",
      error: error.message
    }, { status: 500 });
  }
}, ['vendor', 'supplier', 'doctor', 'staff']);
