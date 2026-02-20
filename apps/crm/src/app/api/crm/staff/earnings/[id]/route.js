import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import BillingModel from '@repo/lib/models/Vendor/Billing.model';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import StaffModel from '@repo/lib/models/Vendor/Staff.model';
import ClientModel from '@repo/lib/models/Vendor/Client.model';
import StaffTransactionsModel from '@repo/lib/models/Vendor/StaffTransaction.model';
import { recordStaffPayout } from '@repo/lib/modules/accounting/StaffAccounting';
import { authMiddlewareCrm } from '@/middlewareCrm';
import mongoose from 'mongoose';

await _db();

export const GET = authMiddlewareCrm(async (req, { params }) => {
    try {
        const vendorId = req.user.userId;
        const staffId = params.id;
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!staffId) {
            return NextResponse.json({ message: "Staff ID is required" }, { status: 400 });
        }

        // 1. Get current balance/summary directly from Staff model
        const staff = await StaffModel.findById(staffId);

        if (!staff) {
            return NextResponse.json({ message: "Staff member not found" }, { status: 404 });
        }

        const forceRecalc = searchParams.get('recalc') === 'true';

        // MIGRATION: If no ledger exists OR force recalculate is requested
        if (forceRecalc || (staff.accumulatedEarnings === 0 && (!staff.commissionCount || staff.commissionCount === 0))) {
            console.log(`[Earnings] Starting ${forceRecalc ? 'forced recalculation' : 'auto-migration'} for staff ${staffId}`);

            // Fetch all completed appointments for this staff
            const completedAppointments = await AppointmentModel.find({
                vendorId: new mongoose.Types.ObjectId(vendorId),
                status: { $in: ['completed', 'completed without payment'] },
                $or: [
                    { staff: new mongoose.Types.ObjectId(staffId) },
                    { "serviceItems.staff": new mongoose.Types.ObjectId(staffId) }
                ]
            }).select('_id').lean();

            console.log(`[Earnings] Found ${completedAppointments.length} completed appointments to sync`);

            // Reset the staff counters before re-syncing to avoid double-counting
            if (forceRecalc) {
                await StaffTransactionsModel.deleteMany({
                    staffId: new mongoose.Types.ObjectId(staffId),
                    type: 'CREDIT'
                });
                await StaffModel.findByIdAndUpdate(staffId, {
                    $set: {
                        accumulatedEarnings: 0,
                        netBalance: staff.totalPaidOut ? -staff.totalPaidOut : 0,
                        commissionCount: 0,
                        lastTransactionDate: new Date()
                    }
                });
                console.log(`[Earnings] Reset staff counters for recalculation`);
            }

            // Re-sync each appointment using the same logic as real-time
            const { syncStaffCommission } = await import('@repo/lib/modules/accounting/StaffAccounting');
            for (const appt of completedAppointments) {
                try {
                    await syncStaffCommission(appt._id.toString());
                } catch (e) {
                    console.error(`[Earnings] Error syncing appointment ${appt._id}:`, e.message);
                }
            }

            // Refresh staff object for the response
            const updatedStaff = await StaffModel.findById(staffId);
            if (updatedStaff) {
                staff.accumulatedEarnings = updatedStaff.accumulatedEarnings;
                staff.totalPaidOut = updatedStaff.totalPaidOut;
                staff.netBalance = updatedStaff.netBalance;
                staff.commissionCount = updatedStaff.commissionCount;
            }

            console.log(`[Earnings] Recalculation done. New accumulatedEarnings: ${staff.accumulatedEarnings}`);
        }

        // 2. Fetch Period-Specific Summary if dates are provided
        let periodEarned = staff.accumulatedEarnings;
        let periodPaid = staff.totalPaidOut;
        let periodApptCount = 0;

        if (startDate && endDate) {
            const periodEarnings = await StaffTransactionsModel.aggregate([
                {
                    $match: {
                        staffId: new mongoose.Types.ObjectId(staffId),
                        type: 'CREDIT',
                        transactionDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
                    }
                },
                { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
            ]);

            const periodPayouts = await StaffTransactionsModel.aggregate([
                {
                    $match: {
                        staffId: new mongoose.Types.ObjectId(staffId),
                        type: 'DEBIT',
                        transactionDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
                    }
                },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);

            periodEarned = periodEarnings[0]?.total || 0;
            periodPaid = periodPayouts[0]?.total || 0;
            periodApptCount = periodEarnings[0]?.count || 0;
        }

        // 3. Fetch Transaction History (The Ledger)
        const transactions = await StaffTransactionsModel.find({ staffId })
            .sort({ transactionDate: -1 })
            .limit(50)
            .populate({
                path: 'appointmentId',
                select: 'clientName serviceName totalAmount date',
                populate: { path: 'client', select: 'fullName' }
            })
            .lean();

        // 4. Format for the UI
        const commissionHistory = transactions
            .filter(t => t.type === 'CREDIT')
            .map(t => ({
                id: t.appointmentId?._id || t._id,
                date: t.transactionDate,
                clientName: t.appointmentId?.client?.fullName || t.appointmentId?.clientName || 'Unknown',
                serviceName: t.appointmentId?.serviceName || 'Service',
                totalAmount: t.appointmentId?.totalAmount || 0,
                commissionAmount: t.amount,
                description: t.description
            }));

        const payouts = transactions
            .filter(t => t.type === 'DEBIT')
            .map(t => ({
                _id: t._id,
                amount: t.amount,
                paymentMethod: t.paymentMethod || 'Cash',
                payoutDate: t.transactionDate,
                notes: t.notes || t.description
            }));

        return NextResponse.json({
            summary: {
                totalEarned: startDate && endDate ? periodEarned : staff.accumulatedEarnings,
                totalPaid: startDate && endDate ? periodPaid : staff.totalPaidOut,
                balance: staff.netBalance,
                appointmentsCount: startDate && endDate ? periodApptCount : (staff.commissionCount || 0)
            },
            payouts: payouts,
            commissionHistory: commissionHistory
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching staff earnings ledger:', error);
        return NextResponse.json({ message: "Error fetching staff earnings", error: error.message }, { status: 500 });
    }
}, ['vendor', 'doctor']);

export const POST = authMiddlewareCrm(async (req, { params }) => {
    try {
        const vendorId = req.user.userId;
        const staffId = params.id;
        const body = await req.json();

        if (!staffId || !body.amount) {
            return NextResponse.json({ message: "Staff ID and amount are required" }, { status: 400 });
        }

        // Record payout directly using consolidated accounting service
        await recordStaffPayout({
            vendorId,
            staffId,
            amount: body.amount,
            paymentMethod: body.paymentMethod || 'Cash',
            notes: body.notes || '',
            payoutDate: body.payoutDate || new Date()
        });

        return NextResponse.json({ message: "Payout recorded successfully" }, { status: 201 });

    } catch (error) {
        console.error('Error recording payout:', error);
        return NextResponse.json({ message: "Error recording payout", error: error.message }, { status: 500 });
    }
}, ['vendor', 'doctor']);

