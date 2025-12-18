
import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import SubscriptionPlanModel from '@repo/lib/models/admin/SubscriptionPlan.model';

export async function GET(req) {
    await _db();
    const plans = await SubscriptionPlanModel.find({});
    return NextResponse.json({
        count: plans.length,
        plans: plans.map(p => ({
            _id: p._id,
            name: p.name,
            userTypes: p.userTypes || [],
            planType: p.planType,
            status: p.status,
            isAvailableForPurchase: p.isAvailableForPurchase
        }))
    });
}
