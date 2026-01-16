import { NextResponse } from "next/server";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js"; // Adjust based on file depth
import _db from "@repo/lib/db";
import Vendor from "@repo/lib/models/Vendor.model";
import Supplier from "@repo/lib/models/Vendor/Supplier.model";
import Doctor from "@repo/lib/models/Vendor/Docters.model";
import SubscriptionPlan from "@repo/lib/models/admin/SubscriptionPlan";

// Ensure DB connection
await _db();

export const POST = authMiddlewareAdmin(async (req) => {
    try {
        const body = await req.json();
        console.log("📝 Renewal Payload:", body);

        const { vendorId, userId, planId, userType: payloadUserType } = body;
        const targetUserId = vendorId || userId;

        if (!targetUserId || !planId) {
            return NextResponse.json(
                { message: "User ID (vendorId or userId) and Plan ID are required" },
                { status: 400 }
            );
        }

        // 1. Fetch the Plan
        const plan = await SubscriptionPlan.findById(planId);
        if (!plan) {
            return NextResponse.json(
                { message: "Subscription Plan not found" },
                { status: 404 }
            );
        }

        // 2. Fetch the User (Vendor, Supplier, or Doctor)
        let user = null;
        let foundUserType = 'vendor';

        // Optimization: Check specific type if provided
        if (payloadUserType) {
            const type = payloadUserType.toLowerCase();
            if (type === 'vendor') {
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
                { message: "User not found" },
                { status: 404 }
            );
        }

        // 3. Regional Filtering Security Check
        const { roleName, assignedRegions } = req.user;
        if ((roleName === "REGIONAL_ADMIN") && assignedRegions && assignedRegions.length > 0) {
            const userRegionId = user.regionId ? user.regionId.toString() : null;
            if (!userRegionId || !assignedRegions.includes(userRegionId)) {
                return NextResponse.json(
                    { message: "Forbidden: You cannot renew subscriptions for users outside your assigned regions" },
                    { status: 403 }
                );
            }
        }

        const now = new Date();
        const startDate = new Date(now);
        const endDate = new Date(now);

        // Add duration (in days) to start date to get end date
        let durationDays = 30;
        if (typeof plan.duration === 'number') {
            durationDays = plan.duration;
        } else if (typeof plan.duration === 'string') {
            const lower = plan.duration.toLowerCase();
            if (lower.includes('year')) durationDays = 365;
            else if (lower.includes('month')) durationDays = 30;
            else if (lower.includes('week')) durationDays = 7;
            else {
                const parsed = parseInt(plan.duration);
                if (!isNaN(parsed)) durationDays = parsed;
            }
        }
        endDate.setDate(endDate.getDate() + durationDays);

        // 4. Archive Current Subscription if exists
        if (user.subscription && user.subscription.plan) {
            if (user.subscription.status === 'Active' && user.subscription.endDate && new Date(user.subscription.endDate) > new Date()) {
                const name = user.businessName || user.shopName || user.clinicName || (user.firstName + ' ' + user.lastName);
                return NextResponse.json(
                    { message: `Subscription is already active for ${name}` },
                    { status: 400 }
                );
            }

            if (!Array.isArray(user.subscription.history)) {
                user.subscription.history = [];
            }

            // Create history entry
            const historyEntry = {
                plan: user.subscription.plan,
                status: user.subscription.status || 'Expired',
                startDate: user.subscription.startDate,
                endDate: user.subscription.endDate,
                archivedAt: new Date()
            };

            user.subscription.history.push(historyEntry);
        } else {
            if (!user.subscription) user.subscription = {};
            if (!user.subscription.history) user.subscription.history = [];
        }

        // 5. Update Subscription Fields Individually
        user.subscription.plan = plan._id;
        user.subscription.status = 'Active';
        user.subscription.startDate = startDate;
        user.subscription.endDate = endDate;

        // Save user
        await user.save();

        // Populate the plan for the frontend
        await user.populate('subscription.plan');

        return NextResponse.json(
            {
                success: true,
                message: "Subscription renewed successfully",
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
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);
