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

        // MIGRATION: If no ledger exists OR force recalculate is requested OR it was initialized as empty
        // We check if netBalance, totalEarned etc are present or if forceRecalc is true
        if (forceRecalc || (staff.accumulatedEarnings === 0 && (!staff.commissionCount || staff.commissionCount === 0))) {
            console.log(`Starting ${forceRecalc ? 'recalculation' : 'migration'} for staff ${staffId}`);

            const commissionRate = staff.commissionRate || 0;
            const isCommissionEnabled = staff.commission === true;
            console.log(`Migration Debug: Staff ${staff.fullName} | Enabled: ${isCommissionEnabled} | Rate: ${commissionRate}%`);

            // Fetch all completed appointments for this staff
            const completedAppointments = await AppointmentModel.find({
                vendorId: new mongoose.Types.ObjectId(vendorId),
                status: { $in: ['completed', 'completed without payment'] },
                $or: [
                    { staff: new mongoose.Types.ObjectId(staffId) },
                    { "serviceItems.staff": new mongoose.Types.ObjectId(staffId) }
                ]
            }).lean();

            let totalEarned = 0;
            let commissionCount = 0;

            for (const appt of completedAppointments) {
                let apptCommission = 0;
                let contributed = false;

                // Case 1: Legacy/Single staff appointment
                console.log(`Processing Appointment ${appt._id} (${appt.status}) - Amount: ${appt.amount}, Final: ${appt.finalAmount}, Addons: ${appt.addOnsAmount}`);

                // Case 1: Single staff appointment
                const isSingleServiceStaff = appt.staff && appt.staff.toString() === staffId && !appt.isMultiService;

                if (isSingleServiceStaff) {
                    if (appt.staffCommission?.amount > 0) {
                        apptCommission = appt.staffCommission.amount;
                    } else if (isCommissionEnabled) {
                        let base = appt.finalAmount;
                        if (!base) {
                            base = (appt.amount || 0) + (appt.addOnsAmount || 0);
                        }

                        const disc = appt.discountAmount || appt.discount || 0;
                        apptCommission = (Math.max(0, base - disc) * commissionRate) / 100;
                        console.log(`   -> Calculated Single Commission: ${apptCommission} (Base: ${base}, Rate: ${commissionRate}%)`);
                    }
                    if (apptCommission > 0) contributed = true;
                }

                // Case 2: Multi-service items
                if ((appt.isMultiService || !contributed) && appt.serviceItems && appt.serviceItems.length > 0) {
                    let multiServiceCommission = 0;
                    let foundItems = false;

                    for (const item of appt.serviceItems) {
                        if (item.staff && item.staff.toString() === staffId) {
                            foundItems = true;
                            if (item.staffCommission?.amount > 0) {
                                multiServiceCommission += item.staffCommission.amount;
                            } else if (isCommissionEnabled) {
                                let itemBase = item.amount || 0;
                                multiServiceCommission += (itemBase * commissionRate) / 100;
                            }
                        }
                    }

                    if (foundItems && multiServiceCommission > 0) {
                        apptCommission += multiServiceCommission;
                        contributed = true;
                        console.log(`   -> Calculated Multi-Service Commission: ${multiServiceCommission}`);
                    }
                }

                if (contributed && apptCommission > 0) {
                    totalEarned += apptCommission;
                    commissionCount++;

                    console.log(`   -> SAVING Commission: ${apptCommission}`);

                    await StaffTransactionsModel.findOneAndUpdate(
                        { staffId, appointmentId: appt._id, type: 'CREDIT' },
                        {
                            $setOnInsert: {
                                vendorId,
                                staffId,
                                type: 'CREDIT',
                                amount: apptCommission,
                                appointmentId: appt._id,
                                description: `Historical: Commission for ${appt.serviceName || 'Service'}`,
                                transactionDate: appt.updatedAt || appt.createdAt || new Date()
                            }
                        },
                        { upsert: true }
                    );
                }
            }

            // In new consolidated schema, we don't have a separate StaffPayout collection to aggregate from for historical migration
            // We'd have to look at transactions of type DEBIT if they existed
            const payoutTransactions = await StaffTransactionsModel.aggregate([
                { $match: { staffId: new mongoose.Types.ObjectId(staffId), type: 'DEBIT' } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);

            const totalPaid = payoutTransactions[0]?.total || 0;

            // Update Staff model with consolidated values
            await StaffModel.findByIdAndUpdate(staffId, {
                accumulatedEarnings: totalEarned,
                totalPaidOut: totalPaid,
                netBalance: totalEarned - totalPaid,
                commissionCount: commissionCount,
                lastTransactionDate: new Date()
            });

            // Refresh staff object for the response
            staff.accumulatedEarnings = totalEarned;
            staff.totalPaidOut = totalPaid;
            staff.netBalance = totalEarned - totalPaid;
            staff.commissionCount = commissionCount;

            console.log(`Initialized ledger for ${staff.fullName} with ${totalEarned} accumulated earnings`);
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

