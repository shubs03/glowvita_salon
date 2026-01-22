import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import BillingModel from '@repo/lib/models/Vendor/Billing.model';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import StaffPayoutModel from '@repo/lib/models/Vendor/StaffPayout.model';
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

        console.log(`GET Earnings - Staff: ${staffId}, Start: ${startDate}, End: ${endDate}`);

        if (!staffId) {
            return NextResponse.json({ message: "Staff ID is required" }, { status: 400 });
        }

        // Aggregate earnings from Completed Appointments
        const earnings = await AppointmentModel.aggregate([
            {
                $match: {
                    vendorId: new mongoose.Types.ObjectId(vendorId),
                    status: 'completed',
                    $or: [
                        { staff: new mongoose.Types.ObjectId(staffId) },
                        { "serviceItems.staff": new mongoose.Types.ObjectId(staffId) }
                    ],
                    ...(startDate && endDate ? {
                        date: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        }
                    } : {})
                }
            },
            {
                $project: {
                    // Extract commission from main appointment or specific service items
                    commissionAmount: {
                        $cond: {
                            if: { $eq: ["$staff", new mongoose.Types.ObjectId(staffId)] },
                            then: { $ifNull: ["$staffCommission.amount", 0] },
                            else: {
                                $reduce: {
                                    input: "$serviceItems",
                                    initialValue: 0,
                                    in: {
                                        $add: [
                                            "$$value",
                                            {
                                                $cond: {
                                                    if: { $eq: ["$$this.staff", new mongoose.Types.ObjectId(staffId)] },
                                                    then: { $ifNull: ["$$this.staffCommission.amount", 0] },
                                                    else: 0
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalEarned: { $sum: "$commissionAmount" },
                    appointmentsCount: { $sum: 1 }
                }
            }
        ]);

        // Fetch detailed appointment history for commission reporting
        const requestQuery = {
            vendorId: vendorId,
            status: 'completed',
            $or: [
                { staff: staffId },
                { "serviceItems.staff": staffId }
            ],
            ...(startDate && endDate ? {
                date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            } : {})
        };

        const appointments = await AppointmentModel.find(requestQuery)
            .sort({ date: -1 })
            .limit(50)
            .populate('client', 'name')
            .populate('service', 'name')
            .lean();

        // Process appointments to formatted commission structure
        const commissionHistory = appointments.map(appt => {
            let rate = 0;
            let amount = 0;

            // Check main staff assignment
            if (appt.staff && appt.staff.toString() === staffId) {
                rate = appt.staffCommission?.rate || 0;
                amount = appt.staffCommission?.amount || 0;
            }
            // Check service items for multi-service support
            else if (appt.serviceItems && appt.serviceItems.length > 0) {
                const relevantItems = appt.serviceItems.filter(item =>
                    item.staff && item.staff.toString() === staffId
                );

                amount = relevantItems.reduce((sum, item) => sum + (item.staffCommission?.amount || 0), 0);
                // Rate might vary per item, but we can take the first meaningful one or just show N/A for rate if mixed
                rate = relevantItems.length > 0 ? (relevantItems[0].staffCommission?.rate || 0) : 0;
            }

            return {
                id: appt._id,
                date: appt.date,
                clientName: appt.client?.name || appt.clientName || 'Unknown',
                serviceName: appt.service?.name || appt.serviceName || 'Multiple Services',
                totalAmount: appt.finalAmount || appt.totalAmount,
                commissionRate: rate,
                commissionAmount: amount
            };
        }).filter(item => item.commissionAmount > 0); // Only return items with actual earning

        // Fetch payout history
        const payouts = await StaffPayoutModel.find({
            vendorId: vendorId,
            staffId: staffId
        }).sort({ payoutDate: -1 });

        const totalPaid = payouts.reduce((acc, p) => acc + p.amount, 0);
        const summary = earnings[0] || { totalEarned: 0, appointmentsCount: 0 };

        const balance = summary.totalEarned - totalPaid;

        return NextResponse.json({
            summary: {
                totalEarned: summary.totalEarned,
                totalPaid: totalPaid,
                balance: balance,
                appointmentsCount: summary.appointmentsCount
            },
            payouts: payouts,
            commissionHistory: commissionHistory
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching staff earnings:', error);
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

        const newPayout = await StaffPayoutModel.create({
            vendorId,
            staffId,
            amount: body.amount,
            paymentMethod: body.paymentMethod || 'Cash',
            notes: body.notes || '',
            payoutDate: body.payoutDate || new Date()
        });

        return NextResponse.json({ message: "Payout recorded successfully", payout: newPayout }, { status: 201 });

    } catch (error) {
        console.error('Error recording payout:', error);
        return NextResponse.json({ message: "Error recording payout", error: error.message }, { status: 500 });
    }
}, ['vendor', 'doctor']);
