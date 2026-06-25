/**
 * Auto-Cancellation Module
 * 
 * Handles automatic cancellation of appointments that have passed their end time
 * without being marked as completed or checked-in.
 * 
 * Business Logic:
 * - Appointments with endTime < current time
 * - Status is still 'scheduled' or 'confirmed'
 * - Automatically mark as 'no-show' or 'cancelled'
 */

/**
 * Auto-cancel appointments that have passed their end time
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.gracePeriodMinutes - Minutes after end time before auto-cancelling (default: 30)
 * @param {boolean} options.dryRun - If true, only log what would be cancelled without actually cancelling
 * @returns {Promise<Object>} - Results of the auto-cancellation process
 */
export async function autoCancelExpiredAppointments(options = {}) {
    try {
        const {
            gracePeriodMinutes = 15, // Grace period after end time (changed to 15 minutes)
            dryRun = false,
            notifyClients = true,  // Send email to clients
            notifyVendors = true   // Send email to vendors
        } = options;

        // Import Appointment model dynamically
        const Appointment = (await import('../../models/Appointment/Appointment.model.js')).default;

        const now = new Date();
        const gracePeriodMs = gracePeriodMinutes * 60 * 1000;
        const cutoffTime = new Date(now.getTime() - gracePeriodMs);

        // Build strict TODAY-only boundary (local server timezone)
        // This ensures ONLY today's appointments are ever considered —
        // tomorrow or any future date appointments are completely excluded.
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);

        console.log('=== Auto-Cancellation Job Started ===');
        console.log('Current time:', now.toISOString());
        console.log('Grace period:', gracePeriodMinutes, 'minutes');
        console.log('Cutoff time:', cutoffTime.toISOString());
        console.log('Today range:', startOfToday.toISOString(), 'to', endOfToday.toISOString());
        console.log('Dry run mode:', dryRun);

        // Find appointments that should be auto-cancelled
        // 1. Status is 'scheduled' or 'confirmed' (not completed, cancelled, or no-show)
        // 2. Appointment date is STRICTLY TODAY — future/tomorrow appointments are never touched
        const expiredAppointments = await Appointment.find({
            status: { $in: ['scheduled', 'confirmed'] },
            date: { $gte: startOfToday, $lte: endOfToday }, // ONLY today's appointments
        }).lean();

        console.log(`Found ${expiredAppointments.length} appointments to check`);

        // Filter appointments where endTime + grace period has passed
        const appointmentsToCancel = expiredAppointments.filter(appointment => {
            if (!appointment.date || !appointment.endTime) {
                console.warn(`Appointment ${appointment._id} missing date or endTime`);
                return false;
            }

            // Construct the full end datetime for this appointment.
            // We always work in LOCAL time: today's local date + the stored endTime (HH:MM).
            // Using setHours (local) consistently with how `now` and startOfToday are computed
            // avoids any UTC-vs-local timezone shift that could make the endTime land on the
            // wrong calendar day.
            const appointmentDate = new Date(now); // start from today's local date
            appointmentDate.setHours(0, 0, 0, 0);  // reset to midnight local

            const [hours, minutes] = appointment.endTime.split(':').map(Number);

            if (isNaN(hours) || isNaN(minutes)) {
                console.warn(`Invalid endTime format for appointment ${appointment._id}: ${appointment.endTime}`);
                return false;
            }

            // Apply the appointment's end hour/minute in local time
            appointmentDate.setHours(hours, minutes, 0, 0);

            // Check if end time + grace period has passed
            const shouldCancel = appointmentDate.getTime() + gracePeriodMs < now.getTime();

            if (shouldCancel) {
                console.log(`Appointment ${appointment._id} expired:`, {
                    scheduledEnd: appointmentDate.toISOString(),
                    currentTime: now.toISOString(),
                    gracePeriodEnd: new Date(appointmentDate.getTime() + gracePeriodMs).toISOString()
                });
            }

            return shouldCancel;
        });

        console.log(`${appointmentsToCancel.length} appointments will be auto-cancelled`);

        if (dryRun) {
            console.log('DRY RUN - No appointments will be modified');
            return {
                success: true,
                dryRun: true,
                appointmentsFound: appointmentsToCancel.length,
                appointments: appointmentsToCancel.map(apt => ({
                    id: apt._id,
                    clientName: apt.clientName,
                    serviceName: apt.serviceName,
                    date: apt.date,
                    endTime: apt.endTime,
                    status: apt.status
                })),
                timestamp: now
            };
        }

        // Process each appointment
        const results = {
            cancelled: [],
            failed: [],
            notified: []
        };

        for (const appointment of appointmentsToCancel) {
            try {
                // Update appointment status to 'no-show' or 'cancelled'
                // Using 'no-show' is more appropriate for appointments that weren't attended
                const updated = await Appointment.findByIdAndUpdate(
                    appointment._id,
                    {
                        status: 'cancelled',
                        cancellationReason: `This appointment was automatically cancelled due to client unavailability or not showing up.`,
                        notes: `Automatically cancelled by system: Client unavailability.`,
                        cancelledAt: now
                    },
                    { new: true }
                );

                if (updated) {
                    results.cancelled.push({
                        id: appointment._id,
                        clientName: appointment.clientName,
                        serviceName: appointment.serviceName,
                        date: appointment.date,
                        endTime: appointment.endTime
                    });

                    console.log(`✓ Auto-cancelled appointment ${appointment._id}`);

                    // Send notifications if enabled
                    if (notifyClients || notifyVendors) {
                        try {
                            await sendCancellationNotifications(updated, {
                                notifyClient: notifyClients,
                                notifyVendor: notifyVendors,
                                reason: 'auto-cancelled-no-show'
                            });
                            results.notified.push(appointment._id);
                        } catch (notifyError) {
                            console.error(`Failed to send notification for appointment ${appointment._id}:`, notifyError);
                        }
                    }
                }
            } catch (error) {
                console.error(`Failed to cancel appointment ${appointment._id}:`, error);
                results.failed.push({
                    id: appointment._id,
                    error: error.message
                });
            }
        }

        console.log('=== Auto-Cancellation Job Completed ===');
        console.log(`Successfully cancelled: ${results.cancelled.length}`);
        console.log(`Failed: ${results.failed.length}`);
        console.log(`Notifications sent: ${results.notified.length}`);

        return {
            success: true,
            dryRun: false,
            cancelled: results.cancelled,
            failed: results.failed,
            notified: results.notified,
            timestamp: now
        };

    } catch (error) {
        console.error('Error in auto-cancellation job:', error);
        throw error;
    }
}

/**
 * Send cancellation notifications to client and/or vendor
 * 
 * @param {Object} appointment - The cancelled appointment
 * @param {Object} options - Notification options
 */
async function sendCancellationNotifications(appointment, options = {}) {
    const {
        notifyClient = true,
        notifyVendor = true,
        reason = 'auto-cancelled'
    } = options;

    try {
        // Import email service
        const { sendEmail } = await import('../../emailService.js');
        const { noshowAppointmentEmail } = await import('../../emailTemplates.js');

        // Get vendor details
        const Vendor = (await import('../../models/Vendor/Vendor.model.js')).default;
        const vendor = await Vendor.findById(appointment.vendorId).select('businessName email phone');

        // Send email to client
        if (notifyClient && appointment.clientEmail) {
            const clientEmailContent = noshowAppointmentEmail({
                clientName: appointment.clientName,
                serviceName: appointment.serviceName,
                appointmentDate: appointment.date,
                appointmentTime: appointment.startTime,
                salonName: vendor?.businessName || 'Salon',
                reason: appointment.cancellationReason
            });

            await sendEmail({
                to: appointment.clientEmail,
                subject: 'Appointment Cancelled',
                html: clientEmailContent
            });

            console.log(`Notification sent to client: ${appointment.clientEmail}`);
        }

        // Send notification to vendor
        if (notifyVendor && vendor?.email) {
            const vendorEmailContent = `
        <h2>Appointment Auto-Cancelled</h2>
        <p>The following appointment was automatically cancelled:</p>
        <ul>
          <li><strong>Client:</strong> ${appointment.clientName}</li>
          <li><strong>Service:</strong> ${appointment.serviceName}</li>
          <li><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${appointment.startTime} - ${appointment.endTime}</li>
        </ul>
      `;

            await sendEmail({
                to: vendor.email,
                subject: 'Appointment Auto-Cancelled',
                html: vendorEmailContent
            });

            console.log(`Notification sent to vendor: ${vendor.email}`);
        }

    } catch (error) {
        console.error('Error sending cancellation notifications:', error);
        // Don't throw - notification failure shouldn't stop the cancellation
    }
}

/**
 * Get statistics about appointments that would be auto-cancelled
 * Useful for monitoring and reporting
 */
export async function getAutoCancellationStats(gracePeriodMinutes = 15) {
    const result = await autoCancelExpiredAppointments({
        gracePeriodMinutes,
        dryRun: true,
        notifyClients: false,
        notifyVendors: false
    });

    return {
        totalExpired: result.appointmentsFound,
        appointments: result.appointments,
        timestamp: result.timestamp
    };
}

export default {
    autoCancelExpiredAppointments,
    getAutoCancellationStats,
    sendCancellationNotifications
};
