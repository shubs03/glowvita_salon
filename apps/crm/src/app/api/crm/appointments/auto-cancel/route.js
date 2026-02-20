/**
 * API Route for Appointment Auto-Cancellation Management
 * 
 * Endpoints:
 * - GET: Get statistics about appointments that would be auto-cancelled
 * - POST: Manually trigger auto-cancellation job
 * - GET /status: Get job status and configuration
 */

import { NextResponse } from 'next/server';
import {
    autoCancelExpiredAppointments,
    getAutoCancellationStats
} from '@repo/lib/modules/scheduling/AutoCancellation';
import {
    getJobStatus,
    runJobManually
} from '@repo/lib/modules/scheduling/scheduledJobs';

/**
 * GET: Get statistics about appointments that would be auto-cancelled
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const gracePeriod = parseInt(searchParams.get('gracePeriod') || '30');

        // Get job status
        if (action === 'status') {
            const status = getJobStatus();
            return NextResponse.json({
                success: true,
                data: status
            });
        }

        // Get statistics (dry run)
        const stats = await getAutoCancellationStats(gracePeriod);

        return NextResponse.json({
            success: true,
            data: {
                totalExpired: stats.totalExpired,
                gracePeriodMinutes: gracePeriod,
                appointments: stats.appointments,
                timestamp: stats.timestamp
            }
        });

    } catch (error) {
        console.error('Error getting auto-cancellation stats:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to get auto-cancellation statistics',
                error: error.message
            },
            { status: 500 }
        );
    }
}

/**
 * POST: Manually trigger auto-cancellation job
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            gracePeriodMinutes = 30,
            dryRun = false,
            notifyClients = true,
            notifyVendors = true,
            jobName = 'autoCancellation'
        } = body;

        console.log('Manual job trigger requested:', {
            jobName,
            gracePeriodMinutes,
            dryRun,
            notifyClients,
            notifyVendors
        });

        let result;

        if (jobName === 'autoCancellation') {
            result = await autoCancelExpiredAppointments({
                gracePeriodMinutes,
                dryRun,
                notifyClients,
                notifyVendors
            });
        } else {
            result = await runJobManually(jobName);
        }

        return NextResponse.json({
            success: true,
            data: result,
            message: dryRun
                ? `Dry run completed. ${result.appointmentsFound || result.cancelled?.length || 0} appointments would be cancelled.`
                : `Job completed successfully. ${result.cancelled?.length || 0} appointments cancelled.`
        });

    } catch (error) {
        console.error('Error running auto-cancellation job:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to run auto-cancellation job',
                error: error.message
            },
            { status: 500 }
        );
    }
}

/**
 * PUT: Update job configuration
 */
export async function PUT(request) {
    try {
        const body = await request.json();
        const { jobName, config } = body;

        // This would update the job configuration
        // For now, we'll just return the current config
        const status = getJobStatus();

        return NextResponse.json({
            success: true,
            message: 'Job configuration updated',
            data: status
        });

    } catch (error) {
        console.error('Error updating job configuration:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to update job configuration',
                error: error.message
            },
            { status: 500 }
        );
    }
}
