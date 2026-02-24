import StaffModel from "../../models/Vendor/Staff.model.js";
import StaffTransactionsModel from "../../models/Vendor/StaffTransaction.model.js";
import AppointmentModel from "../../models/Appointment/Appointment.model.js";
import BillingModel from "../../models/Vendor/Billing.model.js";

/**
 * Syncs staff commission for a given appointment.
 * Handles new credits, adjustments, and reversals.
 * NOTE: No MongoDB sessions/transactions used — compatible with standalone MongoDB.
 */
export const syncStaffCommission = async (appointmentId) => {
    try {
        console.log(`[StaffAccounting] syncStaffCommission called for appointment: ${appointmentId}`);

        const appointment = await AppointmentModel.findById(appointmentId);
        if (!appointment) {
            console.error(`[StaffAccounting] Appointment not found: ${appointmentId}`);
            return { success: false, message: 'Appointment not found' };
        }

        const allowedStatuses = ['completed', 'completed without payment'];
        const isEligible = allowedStatuses.includes(appointment.status);
        const vendorId = appointment.vendorId;

        console.log(`[StaffAccounting] Appointment status: "${appointment.status}" | Eligible: ${isEligible}`);

        // --- Build the list of commissions we WANT to exist after this sync ---
        let targetCommissions = [];

        if (isEligible) {
            // PRIORITY 1: Use serviceItems (works for both single and multi-service appointments)
            if (appointment.serviceItems && appointment.serviceItems.length > 0) {
                for (const item of appointment.serviceItems) {
                    const commAmount = item.staffCommission?.amount || 0;
                    if (item.staff && commAmount > 0) {
                        targetCommissions.push({
                            staffId: item.staff.toString(),
                            amount: commAmount,
                            description: `Commission for ${item.serviceName} (${item._id})`
                        });
                        console.log(`[StaffAccounting] Found serviceItem commission: Staff=${item.staff}, Service=${item.serviceName}, Amount=${commAmount}`);
                    }
                }
            }

            // PRIORITY 2: Fallback to top-level staffCommission (legacy single-service)
            if (targetCommissions.length === 0 && appointment.staff && (appointment.staffCommission?.amount || 0) > 0) {
                targetCommissions.push({
                    staffId: appointment.staff.toString(),
                    amount: appointment.staffCommission.amount,
                    description: `Commission for ${appointment.serviceName}`
                });
                console.log(`[StaffAccounting] Found top-level commission: Staff=${appointment.staff}, Amount=${appointment.staffCommission.amount}`);
            }
        }

        console.log(`[StaffAccounting] Total target commissions from stored data: ${targetCommissions.length}`);

        // FALLBACK: If no commissions found from stored data but appointment IS eligible,
        // recalculate live from the staff's current commission rate.
        // This handles cases where the appointment was saved before the commission rate was set.
        if (targetCommissions.length === 0 && isEligible) {
            console.log(`[StaffAccounting] No stored commissions found. Attempting live recalculation from staff records...`);

            if (appointment.serviceItems && appointment.serviceItems.length > 0) {
                const staffIds = [...new Set(
                    appointment.serviceItems
                        .map(item => item.staff?.toString())
                        .filter(Boolean)
                )];

                if (staffIds.length > 0) {
                    const staffMembers = await StaffModel.find({ _id: { $in: staffIds } });
                    const staffMap = new Map(staffMembers.map(s => [s._id.toString(), s]));

                    const totalBase = appointment.serviceItems.reduce((sum, item) => {
                        return sum + (item.amount || 0) + (item.addOns || []).reduce((s, a) => s + (a.price || 0), 0);
                    }, 0);
                    const totalDiscount = appointment.discountAmount || appointment.discount || 0;

                    for (const item of appointment.serviceItems) {
                        const itemStaffId = item.staff?.toString();
                        if (!itemStaffId) continue;
                        const staff = staffMap.get(itemStaffId);
                        if (!staff || !staff.commission || !staff.commissionRate) continue;

                        const rate = Number(staff.commissionRate) || 0;
                        if (rate === 0) continue;

                        const itemBase = (item.amount || 0) + (item.addOns || []).reduce((s, a) => s + (a.price || 0), 0);
                        const itemDiscount = totalBase > 0 && totalDiscount > 0 ? (itemBase / totalBase) * totalDiscount : 0;
                        const commissionable = Math.max(0, itemBase - itemDiscount);
                        const commAmount = Number(((commissionable * rate) / 100).toFixed(2));

                        if (commAmount > 0) {
                            targetCommissions.push({
                                staffId: itemStaffId,
                                amount: commAmount,
                                description: `Commission for ${item.serviceName} (${item._id})`
                            });
                            console.log(`[StaffAccounting] Live recalculation: Staff=${staff.fullName}, Rate=${rate}%, Amount=${commAmount}`);
                        }
                    }
                }
            } else if (appointment.staff) {
                const staff = await StaffModel.findById(appointment.staff);
                if (staff && staff.commission && staff.commissionRate) {
                    const rate = Number(staff.commissionRate) || 0;
                    const base = (appointment.amount || 0) + (appointment.addOnsAmount || 0);
                    const discount = appointment.discountAmount || appointment.discount || 0;
                    const commAmount = Number((Math.max(0, base - discount) * rate / 100).toFixed(2));

                    if (commAmount > 0) {
                        targetCommissions.push({
                            staffId: appointment.staff.toString(),
                            amount: commAmount,
                            description: `Commission for ${appointment.serviceName}`
                        });
                        console.log(`[StaffAccounting] Live recalculation (top-level): Staff=${staff.fullName}, Rate=${rate}%, Amount=${commAmount}`);
                    }
                }
            }

            console.log(`[StaffAccounting] After live recalculation, target commissions: ${targetCommissions.length}`);
        }

        // --- Fetch existing CREDIT transactions for this appointment ---
        const existingCredits = await StaffTransactionsModel.find({
            appointmentId: appointment._id,
            type: 'CREDIT'
        });

        console.log(`[StaffAccounting] Existing credit transactions: ${existingCredits.length}`);

        // --- Process reversals: credits that no longer have a matching target ---
        for (const existing of existingCredits) {
            const stillNeeded = targetCommissions.find(
                t => t.staffId === existing.staffId.toString() && t.description === existing.description
            );

            if (!stillNeeded) {
                // This credit is no longer valid (e.g. appointment was cancelled after being completed)
                console.log(`[StaffAccounting] REVERSING orphaned credit: ${existing.description}, Amount: ${existing.amount}`);
                await processTransaction({
                    vendorId,
                    staffId: existing.staffId,
                    amount: existing.amount,
                    type: 'DEBIT',
                    appointmentId: appointment._id,
                    description: `REVERSAL: ${existing.description}`,
                    isAdjustment: true
                });
            }
        }

        // --- Process new or adjusted commissions ---
        for (const target of targetCommissions) {
            // Find any existing credit for this exact staff + description
            const existing = existingCredits.find(
                t => t.staffId.toString() === target.staffId && t.description === target.description
            );

            if (!existing) {
                // No prior credit — create a new one
                console.log(`[StaffAccounting] CREDITING new commission: ${target.amount} to staff ${target.staffId}`);
                await processTransaction({
                    vendorId,
                    staffId: target.staffId,
                    amount: target.amount,
                    type: 'CREDIT',
                    appointmentId: appointment._id,
                    description: target.description,
                    isAdjustment: true
                });
            } else {
                // Prior credit exists — check if adjustment is needed
                const diff = target.amount - existing.amount;
                if (Math.abs(diff) > 0.01) {
                    console.log(`[StaffAccounting] ADJUSTING commission for ${target.description}: diff=${diff}`);
                    await processTransaction({
                        vendorId,
                        staffId: target.staffId,
                        amount: Math.abs(diff),
                        type: diff > 0 ? 'CREDIT' : 'DEBIT',
                        appointmentId: appointment._id,
                        description: `ADJUSTMENT: ${target.description}`,
                        isAdjustment: true
                    });
                } else {
                    console.log(`[StaffAccounting] Commission already up to date for ${target.description}`);
                }
            }
        }

        console.log(`[StaffAccounting] syncStaffCommission COMPLETED SUCCESSFULLY for appointment ${appointmentId}`);
        return { success: true };

    } catch (error) {
        console.error(`[StaffAccounting] ERROR in syncStaffCommission for ${appointmentId}:`, error);
        // Return instead of throw so callers don't crash
        return { success: false, message: error.message };
    }
};

/**
 * Syncs staff commission for a given billing record.
 */
export const syncBillingCommission = async (billingId) => {
    try {
        console.log(`[StaffAccounting] syncBillingCommission called for billing: ${billingId}`);

        const billing = await BillingModel.findById(billingId);
        if (!billing) {
            console.error(`[StaffAccounting] Billing record not found: ${billingId}`);
            return { success: false, message: 'Billing record not found' };
        }

        const allowedStatuses = ['Completed'];
        const isEligible = allowedStatuses.includes(billing.paymentStatus);
        const vendorId = billing.vendorId;

        console.log(`[StaffAccounting] Billing status: "${billing.paymentStatus}" | Eligible: ${isEligible}`);

        let targetCommissions = [];

        if (isEligible && billing.items && billing.items.length > 0) {
            for (const item of billing.items) {
                const commAmount = item.staffMember?.staffCommissionAmount || 0;
                if (item.staffMember?.id && commAmount > 0) {
                    targetCommissions.push({
                        staffId: item.staffMember.id.toString(),
                        amount: commAmount,
                        description: `Commission for ${item.name} (Invoice: ${billing.invoiceNumber})`
                    });
                    console.log(`[StaffAccounting] Found billing item commission: Staff=${item.staffMember.id}, Item=${item.name}, Amount=${commAmount}`);
                }
            }
        }

        console.log(`[StaffAccounting] Total target commissions from billing: ${targetCommissions.length}`);

        // Fetch existing CREDIT transactions for this billing
        const existingCredits = await StaffTransactionsModel.find({
            billingId: billing._id,
            type: 'CREDIT'
        });

        console.log(`[StaffAccounting] Existing credit transactions for billing: ${existingCredits.length}`);

        // Process reversals
        for (const existing of existingCredits) {
            const stillNeeded = targetCommissions.find(
                t => t.staffId === existing.staffId.toString() && t.description === existing.description
            );

            if (!stillNeeded) {
                console.log(`[StaffAccounting] REVERSING orphaned billing credit: ${existing.description}, Amount: ${existing.amount}`);
                await processTransaction({
                    vendorId,
                    staffId: existing.staffId,
                    amount: existing.amount,
                    type: 'DEBIT',
                    billingId: billing._id,
                    description: `REVERSAL: ${existing.description}`,
                    isAdjustment: true
                });
            }
        }

        // Process new or adjusted commissions
        for (const target of targetCommissions) {
            const existing = existingCredits.find(
                t => t.staffId.toString() === target.staffId && t.description === target.description
            );

            if (!existing) {
                console.log(`[StaffAccounting] CREDITING new billing commission: ${target.amount} to staff ${target.staffId}`);
                await processTransaction({
                    vendorId,
                    staffId: target.staffId,
                    amount: target.amount,
                    type: 'CREDIT',
                    billingId: billing._id,
                    description: target.description,
                    isAdjustment: true
                });
            } else {
                const diff = target.amount - existing.amount;
                if (Math.abs(diff) > 0.01) {
                    console.log(`[StaffAccounting] ADJUSTING billing commission for ${target.description}: diff=${diff}`);
                    await processTransaction({
                        vendorId,
                        staffId: target.staffId,
                        amount: Math.abs(diff),
                        type: diff > 0 ? 'CREDIT' : 'DEBIT',
                        billingId: billing._id,
                        description: `ADJUSTMENT: ${target.description}`,
                        isAdjustment: true
                    });
                }
            }
        }

        console.log(`[StaffAccounting] syncBillingCommission COMPLETED SUCCESSFULLY for billing ${billingId}`);
        return { success: true };

    } catch (error) {
        console.error(`[StaffAccounting] ERROR in syncBillingCommission for ${billingId}:`, error);
        return { success: false, message: error.message };
    }
};

// Alias for backward compatibility
export const creditStaffCommission = async (appointmentId) => syncStaffCommission(appointmentId);

/**
 * Records a staff payout (debit from their balance)
 */
export const recordStaffPayout = async ({ vendorId, staffId, amount, paymentMethod, notes, payoutDate }) => {
    try {
        await processTransaction({
            vendorId,
            staffId,
            amount,
            type: 'DEBIT',
            paymentMethod,
            notes,
            transactionDate: payoutDate || new Date(),
            description: notes || `Staff Payout (${paymentMethod})`
        });
        return { success: true };
    } catch (error) {
        console.error("Error in recordStaffPayout:", error);
        throw error;
    }
};

// Deprecated — kept for backward compatibility
export const debitStaffPayout = async () => {
    console.warn("debitStaffPayout is deprecated. Use recordStaffPayout instead.");
    return { success: false, message: "Deprecated" };
};

/**
 * Internal helper: records a transaction entry AND updates the Staff summary counters.
 * No sessions — works on standalone MongoDB.
 */
async function processTransaction({
    vendorId, staffId, amount, type,
    appointmentId, billingId, paymentMethod, notes,
    transactionDate, description, isAdjustment = false
}) {
    if (!amount || amount <= 0) {
        console.warn(`[StaffAccounting] processTransaction skipped: amount is ${amount}`);
        return;
    }

    console.log(`[StaffAccounting] processTransaction: ${type} ₹${amount} for staff ${staffId}`);

    // 1. Record the transaction entry
    await StaffTransactionsModel.create({
        vendorId,
        staffId,
        type,
        amount: Number(Number(amount).toFixed(2)),
        appointmentId: appointmentId || null,
        billingId: billingId || null,
        paymentMethod: paymentMethod || null,
        notes: notes || null,
        description: description || null,
        transactionDate: transactionDate || new Date()
    });

    // 2. Update the Staff summary
    let update;
    if (type === 'CREDIT') {
        update = { $inc: { accumulatedEarnings: amount, netBalance: amount, commissionCount: 1 } };
    } else if (isAdjustment) {
        // Reversal: undo a previous earning
        update = { $inc: { accumulatedEarnings: -amount, netBalance: -amount, commissionCount: -1 } };
    } else {
        // Real payout
        update = { $inc: { totalPaidOut: amount, netBalance: -amount } };
    }

    await StaffModel.findByIdAndUpdate(staffId, {
        ...update,
        $set: { lastTransactionDate: new Date() }
    });

    console.log(`[StaffAccounting] ✅ Done: ${type} ₹${amount} for staff ${staffId}`);
}
