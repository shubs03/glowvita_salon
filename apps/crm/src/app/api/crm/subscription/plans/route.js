import { NextResponse } from "next/server";
import _db from "@repo/lib/db";
import SubscriptionPlan from "@repo/lib/models/admin/SubscriptionPlan";

export const GET = async () => {
  try {
    await _db();
    const plans = await SubscriptionPlan.find({ isAvailableForPurchase: { $ne: false } }).sort({ createdAt: -1 });
    return NextResponse.json(plans, { status: 200 });
  } catch (error) {
    console.error("Error fetching subscription plans (CRM):", error);
    return NextResponse.json(
      { message: "Error fetching subscription plans", error: error.message },
      { status: 500 }
    );
  }
};
