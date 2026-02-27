/**
 * Scheduled Jobs for Appointment Management
 * 
 * This module sets up cron jobs for:
 * 1. Auto-cancelling expired appointments (no-shows)
 * 2. Garbage collecting expired temporary locks
 * 3. Reconciling race conditions
 */

import cron from 'node-cron';
import { autoCancelExpiredAppointments } from './AutoCancellation.js';
import { garbageCollectExpired, reconcileRaceConditions } from './OptimisticLocking.js';

/**
 * Configuration for scheduled jobs
 */
const JOB_CONFIG = {
    // Auto-cancel appointments - runs every 15 minutes
    autoCancellation: {
        schedule: '*/15 * * * *', // Every 15 minutes
        enabled: true,
        gracePeriodMinutes: 15, // Cancel appointments 15 minutes after end time
        notifyClients: true,  // Send email to clients
        notifyVendors: true   // Send email to vendors
    },

    // Garbage collect expired locks - runs every 10 minutes
    garbageCollection: {
        schedule: '*/10 * * * *', // Every 10 minutes
        enabled: true
    },

    // Reconcile race conditions - runs every 30 minutes
    reconciliation: {
        schedule: '*/30 * * * *', // Every 30 minutes
        enabled: true
    }
};

/**
 * Start all scheduled jobs
 */
export function startScheduledJobs() {
    console.log('=== Starting Scheduled Jobs ===');

    // Job 1: Auto-cancel expired appointments
    if (JOB_CONFIG.autoCancellation.enabled) {
        cron.schedule(JOB_CONFIG.autoCancellation.schedule, async () => {
            console.log('\n[CRON] Running auto-cancellation job...');
            try {
                const result = await autoCancelExpiredAppointments({
                    gracePeriodMinutes: JOB_CONFIG.autoCancellation.gracePeriodMinutes,
                    notifyClients: JOB_CONFIG.autoCancellation.notifyClients,
                    notifyVendors: JOB_CONFIG.autoCancellation.notifyVendors,
                    dryRun: false
                });

                console.log('[CRON] Auto-cancellation completed:', {
                    cancelled: result.cancelled.length,
                    failed: result.failed.length,
                    notified: result.notified.length
                });
            } catch (error) {
                console.error('[CRON] Auto-cancellation job failed:', error);
            }
        });

        console.log(`✓ Auto-cancellation job scheduled: ${JOB_CONFIG.autoCancellation.schedule}`);
    }

    // Job 2: Garbage collect expired locks
    if (JOB_CONFIG.garbageCollection.enabled) {
        cron.schedule(JOB_CONFIG.garbageCollection.schedule, async () => {
            console.log('\n[CRON] Running garbage collection...');
            try {
                const result = await garbageCollectExpired();
                console.log('[CRON] Garbage collection completed:', {
                    expiredLocks: result.expiredLocks,
                    expiredAppointments: result.expiredAppointments
                });
            } catch (error) {
                console.error('[CRON] Garbage collection job failed:', error);
            }
        });

        console.log(`✓ Garbage collection job scheduled: ${JOB_CONFIG.garbageCollection.schedule}`);
    }

    // Job 3: Reconcile race conditions
    if (JOB_CONFIG.reconciliation.enabled) {
        cron.schedule(JOB_CONFIG.reconciliation.schedule, async () => {
            console.log('\n[CRON] Running race condition reconciliation...');
            try {
                const result = await reconcileRaceConditions();
                console.log('[CRON] Reconciliation completed:', {
                    reconciledItems: result.reconciledItems
                });
            } catch (error) {
                console.error('[CRON] Reconciliation job failed:', error);
            }
        });

        console.log(`✓ Reconciliation job scheduled: ${JOB_CONFIG.reconciliation.schedule}`);
    }

    console.log('=== All Scheduled Jobs Started ===\n');
}

/**
 * Stop all scheduled jobs
 */
export function stopScheduledJobs() {
    console.log('Stopping all scheduled jobs...');
    cron.getTasks().forEach(task => task.stop());
    console.log('All scheduled jobs stopped.');
}

/**
 * Get status of all scheduled jobs
 */
export function getJobStatus() {
    return {
        autoCancellation: {
            enabled: JOB_CONFIG.autoCancellation.enabled,
            schedule: JOB_CONFIG.autoCancellation.schedule,
            gracePeriodMinutes: JOB_CONFIG.autoCancellation.gracePeriodMinutes
        },
        garbageCollection: {
            enabled: JOB_CONFIG.garbageCollection.enabled,
            schedule: JOB_CONFIG.garbageCollection.schedule
        },
        reconciliation: {
            enabled: JOB_CONFIG.reconciliation.enabled,
            schedule: JOB_CONFIG.reconciliation.schedule
        }
    };
}

/**
 * Run a specific job manually (for testing)
 */
export async function runJobManually(jobName) {
    console.log(`Running ${jobName} manually...`);

    switch (jobName) {
        case 'autoCancellation':
            return await autoCancelExpiredAppointments({
                gracePeriodMinutes: JOB_CONFIG.autoCancellation.gracePeriodMinutes,
                notifyClients: JOB_CONFIG.autoCancellation.notifyClients,
                notifyVendors: JOB_CONFIG.autoCancellation.notifyVendors,
                dryRun: false
            });

        case 'garbageCollection':
            return await garbageCollectExpired();

        case 'reconciliation':
            return await reconcileRaceConditions();

        default:
            throw new Error(`Unknown job: ${jobName}`);
    }
}

export default {
    startScheduledJobs,
    stopScheduledJobs,
    getJobStatus,
    runJobManually,
    JOB_CONFIG
};
