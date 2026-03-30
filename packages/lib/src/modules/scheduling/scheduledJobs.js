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
        gracePeriodMinutes: 30, // Cancel appointments 30 minutes after end time
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
    },

    // Appointment Reminders - runs once an hour
    appointmentReminders: {
        schedule: '0 * * * *', // Every hour
        enabled: true,
        reminderWindowHours: 24 // Remind 24 hours before
    },

    // Abandoned Cart - runs every hour
    abandonedCart: {
        schedule: '15 * * * *', // Every hour at :15
        enabled: true,
        abandonmentThresholdHours: 2 // Notify if cart older than 2 hours
    },

    // Offer Expiry Reminders - runs daily at 10 AM
    offerExpiryReminders: {
        schedule: '0 10 * * *',
        enabled: true,
        daysBeforeExpiry: 1
    },

    // User Inactivity Reminders - runs every Monday at 11 AM
    inactivityReminders: {
        schedule: '0 11 * * 1',
        enabled: true,
        inactivityDays: 30
    },

    // Subscription Expiry - runs daily at 9 AM
    subscriptionExpiry: {
        schedule: '0 9 * * *',
        enabled: true,
        reminderDays: [7, 3, 1, 0] // Notify 7, 3, 1 day before and on same day
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

    // Job 4: Appointment Reminders
    if (JOB_CONFIG.appointmentReminders.enabled) {
        cron.schedule(JOB_CONFIG.appointmentReminders.schedule, async () => {
            console.log('\n[CRON] Running appointment reminders...');
            try {
                const { NotificationService, SmsService } = await import('@repo/lib');
                const AppointmentModel = (await import('@repo/lib/models/Appointment/Appointment.model')).default;
                
                const now = new Date();
                const windowStart = new Date(now.getTime() + (JOB_CONFIG.appointmentReminders.reminderWindowHours * 60 * 60 * 1000));
                const windowEnd = new Date(windowStart.getTime() + (60 * 60 * 1000)); // 1 hour window

                const upcoming = await AppointmentModel.find({
                    status: 'confirmed',
                    date: { $gte: windowStart, $lt: windowEnd },
                    reminderSent: { $ne: true }
                }).lean();

                for (const apt of upcoming) {
                    // Send Push
                    if (apt.client) {
                        await NotificationService.sendAppointmentAlert(apt.client, 'client', apt, 'reminder');
                    }
                    // Send SMS
                    const clientPhone = apt.clientPhone || apt.phone;
                    if (clientPhone) {
                        await SmsService.sendAppointmentSms(clientPhone, apt, 'reminder');
                    }
                    // Mark as sent
                    await AppointmentModel.updateOne({ _id: apt._id }, { $set: { reminderSent: true } });
                }
                console.log(`[CRON] Sent ${upcoming.length} reminders.`);
            } catch (error) {
                console.error('[CRON] Reminders failed:', error);
            }
        });
        console.log(`✓ Appointment reminders scheduled: ${JOB_CONFIG.appointmentReminders.schedule}`);
    }

    // Job 5: Abandoned Cart Notifications
    if (JOB_CONFIG.abandonedCart.enabled) {
        cron.schedule(JOB_CONFIG.abandonedCart.schedule, async () => {
            console.log('\n[CRON] Running abandoned cart check...');
            try {
                const { NotificationService } = await import('@repo/lib');
                const UserCartModel = (await import('@repo/lib/models/user/UserCart.model')).default;
                
                const threshold = new Date(Date.now() - (JOB_CONFIG.abandonedCart.abandonmentThresholdHours * 60 * 60 * 1000));
                
                const carts = await UserCartModel.find({
                    updatedAt: { $lt: threshold },
                    items: { $not: { $size: 0 } },
                    notified: { $ne: true }
                }).populate('items.vendorId').lean();

                for (const cart of carts) {
                    if (cart.userId) {
                        const vendorName = cart.items[0]?.vendorId?.businessName || 'GlowVita Salon';
                        await NotificationService.sendToUser(cart.userId, 'client', {
                            title: 'Finish your booking! 💅',
                            body: `Your cart at ${vendorName} is waiting for you. Get it before someone else does!`,
                            data: { type: 'cart', cartId: cart._id.toString() }
                        });
                        await UserCartModel.updateOne({ _id: cart._id }, { $set: { notified: true } });
                    }
                }
                console.log(`[CRON] Notified ${carts.length} abandoned carts.`);
            } catch (error) {
                console.error('[CRON] Abandoned cart job failed:', error);
            }
        });
        console.log(`✓ Abandoned cart job scheduled: ${JOB_CONFIG.abandonedCart.schedule}`);
    }

    // Job 6: Offer Expiry Reminders
    if (JOB_CONFIG.offerExpiryReminders.enabled) {
        cron.schedule(JOB_CONFIG.offerExpiryReminders.schedule, async () => {
            console.log('\n[CRON] Running offer expiry reminders...');
            try {
                const { NotificationService } = await import('@repo/lib');
                const AdminOfferModel = (await import('@repo/lib/models/admin/AdminOffers.model')).default;
                const CRMOfferModel = (await import('@repo/lib/models/Vendor/CRMOffer.model')).default;
                const UserModel = (await import('@repo/lib/models/user/User.model')).default;

                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + JOB_CONFIG.offerExpiryReminders.daysBeforeExpiry);
                const startOfTomorrow = new Date(tomorrow.setHours(0,0,0,0));
                const endOfTomorrow = new Date(tomorrow.setHours(23,59,59,999));

                // Find offers expiring tomorrow
                const adminOffers = await AdminOfferModel.find({
                    status: 'Active',
                    expires: { $gte: startOfTomorrow, $lte: endOfTomorrow }
                }).lean();

                const crmOffers = await CRMOfferModel.find({
                    status: 'Active',
                    expires: { $gte: startOfTomorrow, $lte: endOfTomorrow }
                }).lean();

                const allExpiring = [...adminOffers, ...crmOffers];

                if (allExpiring.length > 0) {
                    // This is tricky as we don't know who has the offer. 
                    // For global offers, we might notify everyone.
                    // For now, let's notify all active users about global admin offers.
                    const users = await UserModel.find({ isActive: true }).select('_id').lean();
                    
                    for (const offer of allExpiring) {
                        for (const user of users) {
                            await NotificationService.sendOfferReminder(user._id, 'client', offer);
                        }
                    }
                }
                console.log(`[CRON] Handled expiry for ${allExpiring.length} offers.`);
            } catch (error) {
                console.error('[CRON] Offer expiry reminders failed:', error);
            }
        });
        console.log(`✓ Offer expiry reminders scheduled: ${JOB_CONFIG.offerExpiryReminders.schedule}`);
    }

    // Job 7: Inactivity Reminders
    if (JOB_CONFIG.inactivityReminders.enabled) {
        cron.schedule(JOB_CONFIG.inactivityReminders.schedule, async () => {
            console.log('\n[CRON] Running inactivity reminders...');
            try {
                const { NotificationService } = await import('@repo/lib');
                const UserModel = (await import('@repo/lib/models/user/User.model')).default;
                const VendorModel = (await import('@repo/lib/models/Vendor/Vendor.model')).default;
                const DoctorModel = (await import('@repo/lib/models/Vendor/Docters.model')).default;
                const SupplierModel = (await import('@repo/lib/models/Vendor/Supplier.model')).default;
                const StaffModel = (await import('@repo/lib/models/Vendor/Staff.model')).default;

                const threshold = new Date();
                threshold.setDate(threshold.getDate() - JOB_CONFIG.inactivityReminders.inactivityDays);

                const models = [
                    { model: UserModel, role: 'client' },
                    { model: VendorModel, role: 'vendor' },
                    { model: DoctorModel, role: 'doctor' },
                    { model: SupplierModel, role: 'supplier' },
                    { model: StaffModel, role: 'staff' }
                ];

                for (const { model, role } of models) {
                    const inactiveUsers = await model.find({
                        $or: [{ isActive: true }, { status: 'Active' }],
                        lastLogin: { $lt: threshold },
                        inactivityReminderSent: { $ne: true }
                    }).lean();

                    for (const user of inactiveUsers) {
                        try {
                            await NotificationService.sendInactivityReminder(user._id, role, {
                                name: (user.firstName || user.name || user.fullName || 'User').trim()
                            });
                            await model.updateOne({ _id: user._id }, { $set: { inactivityReminderSent: true } });
                        } catch (err) {
                            console.error(`Failed to send inactivity reminder to ${role} ${user._id}:`, err);
                        }
                    }
                    console.log(`[CRON] Sent ${inactiveUsers.length} inactivity reminders to ${role}s.`);
                }
            } catch (error) {
                console.error('[CRON] Inactivity reminders failed:', error);
            }
        });
        console.log(`✓ Inactivity reminders scheduled: ${JOB_CONFIG.inactivityReminders.schedule}`);
    }

    // Job 8: Subscription Expiry
    if (JOB_CONFIG.subscriptionExpiry.enabled) {
        cron.schedule(JOB_CONFIG.subscriptionExpiry.schedule, async () => {
            console.log('\n[CRON] Running subscription expiry check...');
            try {
                const { NotificationService } = await import('@repo/lib');
                const VendorModel = (await import('@repo/lib/models/Vendor/Vendor.model')).default;
                const SupplierModel = (await import('@repo/lib/models/Vendor/Supplier.model')).default;
                const DoctorModel = (await import('@repo/lib/models/Vendor/Docters.model')).default;

                const checkModels = [
                    { model: VendorModel, role: 'vendor' },
                    { model: SupplierModel, role: 'supplier' },
                    { model: DoctorModel, role: 'doctor' }
                ];

                for (const { model, role } of checkModels) {
                    const users = await model.find({
                        'subscription.status': 'Active',
                        'subscription.endDate': { $exists: true }
                    }).populate('subscription.plan').lean();

                    for (const user of users) {
                        const endDate = new Date(user.subscription.endDate);
                        const today = new Date();
                        const timeDiff = endDate.getTime() - today.getTime();
                        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

                        if (JOB_CONFIG.subscriptionExpiry.reminderDays.includes(daysLeft)) {
                            const planName = user.subscription.plan?.name || 'Subscription Plan';
                            await NotificationService.sendSubscriptionAlert(user._id, role, planName, daysLeft);
                        }
                    }
                }
                console.log(`[CRON] Subscription expiry check completed.`);
            } catch (error) {
                console.error('[CRON] Subscription expiry job failed:', error);
            }
        });
        console.log(`✓ Subscription expiry job scheduled: ${JOB_CONFIG.subscriptionExpiry.schedule}`);
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
