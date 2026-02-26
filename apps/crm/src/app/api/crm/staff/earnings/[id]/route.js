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

            const completedBillings = await BillingModel.find({
                vendorId: new mongoose.Types.ObjectId(vendorId),
                paymentStatus: 'Completed',
                "items.staffMember.id": new mongoose.Types.ObjectId(staffId)
            }).select('_id').lean();

            console.log(`[Earnings] Found ${completedAppointments.length} appointments and ${completedBillings.length} billings to sync`);

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

            // Re-sync each appointment and billing using the same logic as real-time
            const { syncStaffCommission, syncBillingCommission } = await import('@repo/lib/modules/accounting/StaffAccounting');

            for (const appt of completedAppointments) {
                try {
                    await syncStaffCommission(appt._id.toString());
                } catch (e) {
                    console.error(`[Earnings] Error syncing appointment ${appt._id}:`, e.message);
                }
            }

            for (const billing of completedBillings) {
                try {
                    await syncBillingCommission(billing._id.toString());
                } catch (e) {
                    console.error(`[Earnings] Error syncing billing ${billing._id}:`, e.message);
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
                select: 'clientName serviceName totalAmount date serviceItems staffCommission',
                populate: { path: 'client', select: 'fullName' },
                options: { strictPopulate: false }
            })
            .populate({
                path: 'billingId',
                select: 'clientInfo clientName totalAmount invoiceNumber createdAt items',
                options: { strictPopulate: false }
            })
            .lean();

        // 4. MANUAL FALLBACK: If population failed, try to fetch missing docs in bulk
        const missingBillingIds = transactions
            .filter(t => t.billingId && typeof t.billingId !== 'object')
            .map(t => t.billingId);

        const missingApptIds = transactions
            .filter(t => t.appointmentId && typeof t.appointmentId !== 'object')
            .map(t => t.appointmentId);

        // Detect missing billing links by checking descriptions for Invoice numbers
        const invoicesToFetch = transactions
            .filter(t => !t.billingId && t.description?.includes('(Invoice:'))
            .map(t => {
                const match = t.description.match(/\(Invoice: ([^\)]+)\)/);
                return match ? match[1] : null;
            })
            .filter(Boolean);

        let extraBillings = [];
        if (missingBillingIds.length > 0) {
            extraBillings = await BillingModel.find({ _id: { $in: missingBillingIds } }).lean();
        }

        let extraBillingsByInvoice = [];
        if (invoicesToFetch.length > 0) {
            extraBillingsByInvoice = await BillingModel.find({
                vendorId: new mongoose.Types.ObjectId(vendorId),
                invoiceNumber: { $in: invoicesToFetch }
            }).lean();
        }

        let extraAppts = [];
        if (missingApptIds.length > 0) {
            extraAppts = await AppointmentModel.find({ _id: { $in: missingApptIds } })
                .populate({ path: 'client', select: 'fullName' })
                .lean();
        }

        // Merge missing data back into transactions
        const enrichedTransactions = transactions.map(t => {
            // Restore by ID
            if (t.billingId && typeof t.billingId !== 'object') {
                t.billingId = extraBillings.find(b => b._id.toString() === t.billingId.toString());
            }
            // Restore by Invoice
            if (!t.billingId && t.description?.includes('(Invoice:')) {
                const match = t.description.match(/\(Invoice: ([^\)]+)\)/);
                if (match) {
                    const inv = match[1];
                    t.billingId = extraBillingsByInvoice.find(b => b.invoiceNumber === inv);
                }
            }
            // Restore Appt
            if (t.appointmentId && typeof t.appointmentId !== 'object') {
                t.appointmentId = extraAppts.find(a => a._id.toString() === t.appointmentId.toString());
            }
            return t;
        });

        // 5. Format for the UI
        const commissionHistory = enrichedTransactions
            .filter(t => t.type === 'CREDIT')
            .map(t => {
                // Determine if it's a Billing/Sale or an Appointment
                // It's a billing if it has billingId OR if the description explicitly mentions an Invoice
                const isBilling = !!t.billingId || t.description?.includes('(Invoice:');

                if (isBilling) {
                    const b = t.billingId;
                    const isPopulated = b && typeof b === 'object' && (b.clientInfo || b.items);

                    // Try to extract item name from description if not populated or item not found
                    // Description format: "Commission for [Item Name] (Invoice: [Invoice No])"
                    let itemName = 'Product/Service Sale';
                    if (t.description && t.description.includes('Commission for ')) {
                        itemName = t.description.split('Commission for ')[1].split(' (Invoice:')[0];
                        // If there's an adjustment prefix, strip it
                        if (itemName.startsWith('REVERSAL: ')) itemName = itemName.replace('REVERSAL: ', '');
                        if (itemName.startsWith('ADJUSTMENT: ')) itemName = itemName.replace('ADJUSTMENT: ', '');
                    }

                    if (isPopulated) {
                        const billingItem = b.items?.find(item => {
                            const itemStaffId = item.staffMember?.id || item.staffMember?._id || item.staffMember;
                            const matchesStaff = itemStaffId?.toString() === staffId.toString();
                            const matchesName = t.description?.includes(item.name) || itemName === item.name;
                            return matchesStaff && matchesName;
                        });

                        // Fallback to any item for this staff if name match fails
                        const fallbackItem = !billingItem ? b.items?.find(item => {
                            const itemStaffId = item.staffMember?.id || item.staffMember?._id || item.staffMember;
                            return itemStaffId?.toString() === staffId.toString();
                        }) : null;

                        const finalItem = billingItem || fallbackItem;

                        return {
                            id: b._id || t._id,
                            date: t.transactionDate,
                            clientName: b.clientInfo?.fullName || b.clientName || 'Walk-in Client',
                            serviceName: finalItem?.name || itemName,
                            totalAmount: finalItem?.totalPrice || b.totalAmount || 0,
                            commissionAmount: t.amount,
                            commissionRate: finalItem?.staffMember?.staffCommissionRate || 0,
                            description: t.description,
                            type: 'SALE'
                        };
                    } else {
                        // Fallback for unpopulated billingId (using data from description)
                        return {
                            id: b?._id || t._id,
                            date: t.transactionDate,
                            clientName: 'Walk-in (Sale)',
                            serviceName: itemName,
                            totalAmount: 0,
                            commissionAmount: t.amount,
                            commissionRate: 0,
                            description: t.description,
                            type: 'SALE'
                        };
                    }
                }

                // Appointment path
                const a = t.appointmentId;
                const isApptPopulated = a && typeof a === 'object' && (a.serviceName || a.clientName || a.totalAmount);

                if (isApptPopulated) {
                    // Try to find the specific commission rate for this staff in the appointment
                    let rate = 0;
                    if (a.serviceItems && Array.isArray(a.serviceItems)) {
                        const serviceItem = a.serviceItems.find(item => {
                            const itemStaffId = item.staff?.toString();
                            return itemStaffId === staffId.toString();
                        });
                        rate = serviceItem?.staffCommission?.rate || a.staffCommission?.rate || 0;
                    } else {
                        rate = a.staffCommission?.rate || 0;
                    }

                    return {
                        id: a._id,
                        date: t.transactionDate,
                        clientName: a.client?.fullName || a.clientName || 'Unknown',
                        serviceName: a.serviceName || 'Service',
                        totalAmount: a.totalAmount || 0,
                        commissionAmount: t.amount,
                        commissionRate: rate,
                        description: t.description,
                        type: 'APPOINTMENT'
                    };
                } else {
                    return {
                        id: a?._id || a || t._id,
                        date: t.transactionDate,
                        clientName: 'Client (Appt)',
                        serviceName: 'Service',
                        totalAmount: 0,
                        commissionAmount: t.amount,
                        commissionRate: 0,
                        description: t.description,
                        type: 'APPOINTMENT'
                    };
                }
            });

        const payouts = enrichedTransactions
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

