import { NextResponse } from "next/server";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";
import { forbiddenResponse } from "@repo/lib";
import _db from "@repo/lib/db";
import Vendor from "@repo/lib/models/Vendor.model";
import Supplier from "@repo/lib/models/Vendor/Supplier.model";
import Doctor from "@repo/lib/models/Vendor/Docters.model";
import SubscriptionPlan from "@repo/lib/models/admin/SubscriptionPlan";
import { queueOrActivateSubscription } from "@repo/lib/utils/subscriptionSchedule";

// Ensure DB connection
await _db();

export const POST = authMiddlewareAdmin(async (req) => {
    try {
        const body = await req.json();
        console.log("📝 Admin Renewal Payload:", body);

        const { vendorId, userId, planId, userType: payloadUserType } = body;
        const targetUserId = vendorId || userId;

        if (!targetUserId || !planId) {
            return NextResponse.json(
                { success: false, message: "User ID (vendorId or userId) and Plan ID are required" },
                { status: 400 }
            );
        }

        // 1. Fetch the Plan
        const plan = await SubscriptionPlan.findById(planId);
        if (!plan) {
            return NextResponse.json(
                { success: false, message: "Subscription Plan not found" },
                { status: 404 }
            );
        }

        // 2. Fetch the User (Vendor, Supplier, or Doctor)
        let user = null;
        let foundUserType = 'vendor';

        // Optimization: Check specific type if provided
        if (payloadUserType) {
            const type = payloadUserType.toLowerCase();
            if (type === 'vendor' || type === 'staff') {
                user = await Vendor.findById(targetUserId);
                foundUserType = 'vendor';
            } else if (type === 'supplier') {
                user = await Supplier.findById(targetUserId);
                foundUserType = 'supplier';
            } else if (type === 'doctor') {
                user = await Doctor.findById(targetUserId);
                foundUserType = 'doctor';
            }
        }

        // Fallback: Sequential search if not found yet (or no type provided)
        if (!user) {
            user = await Vendor.findById(targetUserId);
            foundUserType = 'vendor';
        }
        if (!user) {
            user = await Supplier.findById(targetUserId);
            foundUserType = 'supplier';
        }
        if (!user) {
            user = await Doctor.findById(targetUserId);
            foundUserType = 'doctor';
        }

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        // 3. Regional Filtering Security Check
        const { roleName, assignedRegions } = req.user;
        if ((roleName === "REGIONAL_ADMIN") && assignedRegions && assignedRegions.length > 0) {
            const userRegionId = user.regionId ? user.regionId.toString() : null;
            const regionIdsStrings = assignedRegions.map(r => r.toString());
            if (!userRegionId || !regionIdsStrings.includes(userRegionId)) {
                return forbiddenResponse("You cannot renew subscriptions for users outside your assigned regions");
            }
        }

        // 4. Use the shared scheduling utility (same as CRM)
        //    - If user has an active subscription → SCHEDULES the new plan in history
        //    - If user's subscription is expired/none → ACTIVATES immediately
        const now = new Date();
        const subscriptionUpdate = queueOrActivateSubscription(user, plan, now);

        // Save user
        await user.save();

        // 5. Check for referral credit — only fires on paid plans
        const isRegularPlan = plan.planType === 'regular' || (plan.price !== undefined && plan.price > 0);
        if (isRegularPlan) {
            try {
                const { checkAndCreditSubscriptionReferral } = await import("@repo/lib/utils/referralWalletCredit");
                const referralResult = await checkAndCreditSubscriptionReferral(user._id.toString(), plan);
                console.log('[Referral Bonus] Admin subscription-renewal referral result:', referralResult);
            } catch (err) {
                console.error("[Referral Bonus] Check failed on admin subscription-renewal:", err);
            }
        }

        // Populate the plan for the frontend
        await user.populate('subscription.plan');

        const mode = subscriptionUpdate.mode; // 'Active' | 'Scheduled'

        return NextResponse.json(
            {
                success: true,
                message: mode === 'Scheduled'
                    ? "Subscription purchased and scheduled successfully (will activate after current plan ends)"
                    : "Subscription renewed successfully",
                schedulingMode: mode,
                user: {
                    _id: user._id,
                    subscription: user.subscription,
                    userType: foundUserType
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error renewing subscription:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"], "subscription-management:edit");
