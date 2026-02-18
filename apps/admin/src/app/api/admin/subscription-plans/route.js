import { NextResponse } from "next/server";
import _db from "@repo/lib/db";
import SubscriptionPlan from "@repo/lib/models/admin/SubscriptionPlan";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

await _db();

// GET all subscription plans
export const GET = async (req) => {
  try {
    const plans = await SubscriptionPlan.find({}).sort({ createdAt: -1 });
    return NextResponse.json(plans, { status: 200 });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return NextResponse.json(
      { message: "Error fetching subscription plans", error: error.message },
      { status: 500 }
    );
  }
};

// POST a new subscription plan
export const POST = authMiddlewareAdmin(async (req) => {
  try {
    const planData = await req.json();
    const newPlan = await SubscriptionPlan.create(planData);
    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    return NextResponse.json(
      { message: "Error creating subscription plan", error: error.message },
      { status: 400 }
    );
  }
}, ["SUPER_ADMIN"], "subscription-plans:edit");

// PATCH update a subscription plan
export const PATCH = authMiddlewareAdmin(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: "Subscription plan ID is required" },
        { status: 400 }
      );
    }

    const updates = await req.json();
    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(id, updates, { new: true });
    
    if (!updatedPlan) {
      return NextResponse.json(
        { message: "Subscription plan not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedPlan, { status: 200 });
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    return NextResponse.json(
      { message: "Error updating subscription plan", error: error.message },
      { status: 400 }
    );
  }
}, ["SUPER_ADMIN"], "subscription-plans:edit");

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

    const deletedPlan = await SubscriptionPlan.findByIdAndDelete(id);
    
    if (!deletedPlan) {
      return NextResponse.json(
        { message: "Subscription plan not found" },
        { status: 404 }
      );
    }
    
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
}, ["SUPER_ADMIN"], "subscription-plans:delete");
