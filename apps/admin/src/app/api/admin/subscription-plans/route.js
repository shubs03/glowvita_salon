import { NextResponse } from "next/server";
import _db from "@repo/lib/db";
import SubscriptionPlan from "@repo/lib/models/admin/SubscriptionPlan";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

await _db();

// GET all subscription plans
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const regionId = searchParams.get('regionId');
    
    let query = {};
    const userRole = req.user.roleName || req.user.role;
    
    if (userRole !== "SUPER_ADMIN" && userRole !== "superadmin") {
      // Regional Admin: see global plans + their region's plans
      const userRegion = req.user.assignedRegions?.[0];
      query = {
        $or: [
          { regionId: userRegion },
          { regionId: null }
        ]
      };
      
      const plans = await SubscriptionPlan.find(query).sort({ regionId: -1, createdAt: -1 }).lean();
      
      // Post-process to add isRegionallyDisabled flag
      const processedPlans = plans.map(plan => ({
        ...plan,
        isRegionallyDisabled: !plan.regionId && plan.disabledRegions?.map(r => r.toString()).includes(userRegion?.toString()),
        isActive: plan.status === 'Active' // Mapping status to isActive like in offers if needed, or just keeping both
      }));
      
      return NextResponse.json(processedPlans, { status: 200 });
    } else {
      // Super Admin: allow filtering by region
      if (regionId) {
        query = { regionId };
      }
      const plans = await SubscriptionPlan.find(query).sort({ createdAt: -1 }).lean();
      const processedPlans = plans.map(plan => ({
        ...plan,
        isActive: plan.status === 'Active'
      }));
      return NextResponse.json(processedPlans, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return NextResponse.json(
      { message: "Error fetching subscription plans", error: error.message },
      { status: 500 }
    );
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "subscription-management:view");

// POST a new subscription plan
export const POST = authMiddlewareAdmin(async (req) => {
  try {
    const planData = await req.json();
    const { validateAndLockRegion } = await import("@repo/lib");
    const finalRegionId = validateAndLockRegion(req.user, planData.regionId);
    
    const newPlan = await SubscriptionPlan.create({
      ...planData,
      regionId: finalRegionId
    });
    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    return NextResponse.json(
      { message: "Error creating subscription plan", error: error.message },
      { status: 400 }
    );
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"], "subscription-management:edit");

// PATCH update a subscription plan
export const PATCH = authMiddlewareAdmin(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { message: "Subscription plan ID is required" },
        { status: 400 }
      );
    }

    const { validateAndLockRegion } = await import("@repo/lib");
    const userRole = req.user.roleName || req.user.role;

    // Special case: Disable global plan for a region
    if (body.action === 'disable_global') {
      const userRegion = req.user.assignedRegions?.[0];
      if (!userRegion) return NextResponse.json({ message: "No region assigned to user" }, { status: 400 });
      
      await SubscriptionPlan.findByIdAndUpdate(id, {
        $addToSet: { disabledRegions: userRegion }
      });
      return NextResponse.json({ message: "Plan disabled for your region" });
    }
    
    if (body.action === 'enable_global') {
        const userRegion = req.user.assignedRegions?.[0];
        if (!userRegion) return NextResponse.json({ message: "No region assigned to user" }, { status: 400 });
        
        await SubscriptionPlan.findByIdAndUpdate(id, {
          $pull: { disabledRegions: userRegion }
        });
        return NextResponse.json({ message: "Plan enabled for your region" });
    }

    // Standard update
    const plan = await SubscriptionPlan.findById(id);
    if (!plan) return NextResponse.json({ message: "Plan not found" }, { status: 404 });

    // Check permissions
    if (userRole !== "SUPER_ADMIN" && userRole !== "superadmin") {
      const userAssignedRegion = req.user.assignedRegions?.[0];
      const planRegionId = plan.regionId;

      // If it's a global plan (no regionId), regional admins MUST NOT use standard update
      // (they should use disable_global/enable_global which returns early above)
      if (!planRegionId) {
        return NextResponse.json({ message: "You cannot perform standard updates on global plans" }, { status: 403 });
      }

      // If it's a regional plan, it must match the user's assigned region
      if (planRegionId.toString() !== userAssignedRegion?.toString()) {
        return NextResponse.json({ 
          message: "You don't have permission to edit this plan",
          debug: { planReg: planRegionId, userReg: userAssignedRegion } 
        }, { status: 403 });
      }
    }

    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updatedPlan, { status: 200 });
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    return NextResponse.json(
      { message: "Error updating subscription plan", error: error.message },
      { status: 400 }
    );
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"], "subscription-management:edit");

// DELETE a subscription plan
export const DELETE = authMiddlewareAdmin(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: "Subscription plan ID is required" },
        { status: 400 }
      );
    }

    const plan = await SubscriptionPlan.findById(id);
    if (!plan) return NextResponse.json({ message: "Plan not found" }, { status: 404 });

    const userRole = req.user.roleName || req.user.role;
    if (userRole !== "SUPER_ADMIN" && userRole !== "superadmin") {
        if (plan.regionId?.toString() !== req.user.assignedRegions?.[0]?.toString()) {
          return NextResponse.json({ message: "You don't have permission to delete this plan" }, { status: 403 });
        }
    }

    await SubscriptionPlan.findByIdAndDelete(id);
    return NextResponse.json(
      { message: "Subscription plan deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting subscription plan:", error);
    return NextResponse.json(
      { message: "Error deleting subscription plan", error: error.message },
      { status: 400 }
    );
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"], "subscription-management:delete");
