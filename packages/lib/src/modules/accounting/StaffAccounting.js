import StaffModel from "../../models/Vendor/Staff.model.js";
import StaffTransactionsModel from "../../models/Vendor/StaffTransaction.model.js";
import AppointmentModel from "../../models/Appointment/Appointment.model.js";
import mongoose from "mongoose";

/**
 * Service to handle staff accounting credits and debits
 * Now handles sync (adjustments and reversals)
 */
export const syncStaffCommission = async (appointmentId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        console.log(`[StaffAccounting] syncStaffCommission called for appointment: ${appointmentId}`);
        const appointment = await AppointmentModel.findById(appointmentId).session(session);

        if (!appointment) {
            console.error(`[StaffAccounting] Appointment not found: ${appointmentId}`);
            throw new Error(`Appointment not found: ${appointmentId}`);
        }

        const allowedStatuses = ['completed', 'completed without payment'];
        const isEligible = allowedStatuses.includes(appointment.status);
        const vendorId = appointment.vendorId;

        // Collect all "Target" commissions based on current state
        let targetCommissions = [];
        if (isEligible) {
            if (appointment.serviceItems && appointment.serviceItems.length > 0) {
                targetCommissions = appointment.serviceItems
                    .filter(item => item.staff && (item.staffCommission?.amount || 0) > 0)
                    .map(item => ({
                        staffId: item.staff,
                        amount: item.staffCommission.amount,
                        description: `Commission for ${item.serviceName}${item._id ? ` (${item._id})` : ''}`,
                        itemId: item._id
                    }));
            } else if (appointment.staff && (appointment.staffCommission?.amount || 0) > 0) {
                targetCommissions = [{
                    staffId: appointment.staff,
                    amount: appointment.staffCommission.amount,
                    description: `Commission for ${appointment.serviceName}`
                }];
            }
        }

        // Fetch existing transactions for this appointment
        const existingTransactions = await StaffTransactionsModel.find({
            appointmentId: appointment._id
        }).session(session);

        // Map existing transactions by staff + description/itemId to identify pairs
        const existingCredited = existingTransactions.filter(t => t.type === 'CREDIT');

        // 1. Handle reversals or adjustments for already credited items
        for (const existing of existingCredited) {
            // Find if this specific item is still in the "target" list
            const target = targetCommissions.find(t =>
                !t.processed &&
                t.staffId.toString() === existing.staffId.toString() &&
                t.description === existing.description
            );

            if (!target) {
                // REVERSAL: Item is no longer eligible (status changed or item removed)
                // Check if we already reversed it
                const totalForThisItem = existingTransactions
                    .filter(t => t.staffId.toString() === existing.staffId.toString() && t.description === existing.description)
                    .reduce((sum, t) => sum + (t.type === 'CREDIT' ? t.amount : -t.amount), 0);

                if (totalForThisItem > 0) {
                    console.log(`[StaffAccounting] Reversing commission for ${existing.description}. Amount: ${totalForThisItem}`);
                    await processTransaction({
                        vendorId,
                        staffId: existing.staffId,
                        amount: totalForThisItem,
                        type: 'DEBIT',
                        appointmentId: appointment._id,
                        description: `REVERSAL: ${existing.description}`,
                        isAdjustment: true
                    }, session);
                }
            } else {
                // ADJUSTMENT: Compare amounts
                const currentNet = existingTransactions
                    .filter(t => t.staffId.toString() === existing.staffId.toString() && t.description === existing.description)
                    .reduce((sum, t) => sum + (t.type === 'CREDIT' ? t.amount : -t.amount), 0);

                const diff = target.amount - currentNet;
                if (Math.abs(diff) > 0.01) {
                    console.log(`[StaffAccounting] Adjusting commission for ${target.description}. Diff: ${diff}`);
                    await processTransaction({
                        vendorId,
                        staffId: target.staffId,
                        amount: Math.abs(diff),
                        type: diff > 0 ? 'CREDIT' : 'DEBIT',
                        appointmentId: appointment._id,
                        description: `ADJUSTMENT: ${target.description}`,
                        isAdjustment: true
                    }, session);
                }

                // Mark as processed so we don't treat it as "new"
                target.processed = true;
            }
        }

        // 2. Add new commissions that haven't been credited yet
        for (const target of targetCommissions) {
            if (!target.processed) {
                console.log(`[StaffAccounting] Crediting new commission for ${target.description}. Amount: ${target.amount}`);
                await processTransaction({
                    vendorId,
                    staffId: target.staffId,
                    amount: target.amount,
                    type: 'CREDIT',
                    appointmentId: appointment._id,
                    description: target.description,
                    isAdjustment: true
                }, session);
            }
        }

        await session.commitTransaction();
        return { success: true };
    } catch (error) {
        await session.abortTransaction();
        console.error("Error in syncStaffCommission:", error);
        throw error;
    } finally {
        session.endSession();
    }
};

// Keep old exports but proxy to syncStaffCommission for safety
export const creditStaffCommission = async (appointmentId) => syncStaffCommission(appointmentId);

/**
 * Handle Staff Payout (Debit)
 * Now directly records transaction and updates Staff model
 */
export const recordStaffPayout = async ({ vendorId, staffId, amount, paymentMethod, notes, payoutDate }) => {
    const session = await mongoose.startSession();
    session.startTransaction();
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
        }, session);

        await session.commitTransaction();
        return { success: true };
    } catch (error) {
        await session.abortTransaction();
        console.error("Error in recordStaffPayout:", error);
        throw error;
    } finally {
        session.endSession();
    }
};

// For backward compatibility
export const debitStaffPayout = async (payoutId) => {
    // This function originally took a payoutId from StaffPayout model.
    // Since we are deleting that model, this function is only kept to avoid breaking imports 
    // until all calls are updated to use recordStaffPayout.
    console.warn("debitStaffPayout is deprecated. Use recordStaffPayout instead.");
    return { success: false, message: "Deprecated" };
};

/**
 * Internal helper to update balance and record transaction
 */
async function processTransaction({ vendorId, staffId, amount, type, appointmentId, paymentMethod, notes, transactionDate, description, isAdjustment = false }, session) {
    if (amount <= 0) return;

    // Record the transaction
    await StaffTransactionsModel.create([{
        vendorId,
        staffId,
        type,
        amount: Number(amount.toFixed(2)),
        appointmentId,
        paymentMethod,
        notes,
        description,
        transactionDate: transactionDate || new Date()
    }], { session });

    // Update the Summary directly in the Staff model
    let update;
    if (type === 'CREDIT') {
        update = { $inc: { accumulatedEarnings: amount, netBalance: amount, commissionCount: 1 } };
    } else {
        // This is a DEBIT
        if (isAdjustment) {
            // Reversal of an earning
            update = { $inc: { accumulatedEarnings: -amount, netBalance: -amount, commissionCount: -1 } };
        } else {
            // Actual payout
            update = { $inc: { totalPaidOut: amount, netBalance: -amount } };
        }
    }

    await StaffModel.findByIdAndUpdate(
        staffId,
        {
            ...update,
            lastTransactionDate: new Date()
        },
        { session }
    );

    console.log(`[StaffAccounting] Transaction recorded: ${type} ${amount} for staff ${staffId}`);
}

