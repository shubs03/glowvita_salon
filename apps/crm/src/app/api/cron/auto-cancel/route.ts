import { NextResponse } from "next/server";
import { autoCancelExpiredAppointments } from "@repo/lib/modules/scheduling/AutoCancellation";
import { garbageCollectExpired, reconcileRaceConditions } from "@repo/lib/modules/scheduling/OptimisticLocking";
import _db from "@repo/lib/db";

/**
 * API Route for triggering auto-cancellation of expired appointments.
 * This should be called by a scheduler (like Vercel Cron) every 15 minutes.
 * 
 * URL: /api/cron/auto-cancel
 */
export async function GET(request: Request) {
    try {
        await _db();
        // Optional: Add a simple secret check if needed
        // const { searchParams } = new URL(request.url);
        // if (searchParams.get('secret') !== process.env.CRON_SECRET) {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        console.log("[CRON] Running full system maintenance (Auto-cancel, Garbage Collection, Reconciliation)");
        
        const [cancelResult, garbageResult, reconciliationResult] = await Promise.all([
            autoCancelExpiredAppointments({
                gracePeriodMinutes: 15,
                dryRun: false,
            }),
            garbageCollectExpired(),
            reconcileRaceConditions()
        ]) as [any, any, any];

        return NextResponse.json({
            success: true,
            summary: {
                appointmentsCancelled: cancelResult.cancelled?.length || 0,
                garbageCollected: garbageResult.expiredLocks || 0,
                reconciledItems: reconciliationResult.reconciledItems || 0
            },
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("[CRON] Auto-cancellation API failed:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || "Internal Server Error" 
        }, { status: 500 });
    }
}
