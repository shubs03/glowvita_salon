
import { NextResponse } from 'next/server';
import StaffModel from '@repo/lib/models/Vendor/Staff.model';
import StaffTransactionsModel from '@repo/lib/models/Vendor/StaffTransaction.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm';
import mongoose from 'mongoose';

await _db();

// GET staff commission report for a vendor or doctor
export const GET = authMiddlewareCrm(async (req) => {
    try {
        const ownerId = req.user.userId;
        const userRole = req.user.role;

        let vendorId = null;

        if (userRole === 'vendor' || userRole === 'doctor') {
            vendorId = ownerId;
        } else if (userRole === 'staff') {
            // If logged in as staff, they might have vendorId in token
            if (req.user.vendorId) {
                vendorId = req.user.vendorId;
            } else {
                // Fallback: try to find staff member (expensive, but necessary if token incomplete)
                const staffMember = await StaffModel.findById(ownerId).select('vendorId').lean();
                if (staffMember) {
                    vendorId = staffMember.vendorId;
                }
            }
        }

        if (!vendorId) {
            return NextResponse.json({ message: "Could not determine organization context (Vendor ID missing)" }, { status: 400 });
        }

        // Ensure vendorId is an ObjectId
        if (!mongoose.Types.ObjectId.isValid(vendorId)) {
            return NextResponse.json({ message: "Invalid Vendor ID format" }, { status: 400 });
        }
        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

        const { searchParams } = new URL(req.url);

        const startDate = searchParams.get('startDate'); // optional
        const endDate = searchParams.get('endDate');     // optional
        const staffId = searchParams.get('staff');       // optional filter for specific staff

        // 1. Build the match query for transactions
        const transactionMatch = {
            vendorId: vendorObjectId
        };

        if (staffId && staffId !== 'all' && mongoose.Types.ObjectId.isValid(staffId)) {
            transactionMatch.staffId = new mongoose.Types.ObjectId(staffId);
        }

        if (startDate || endDate) {
            transactionMatch.transactionDate = {};
            // Parse dates and handle potential timezone issues if needed, but standard Date construction usually works for localized input strings if format is YYYY-MM-DD
            if (startDate) {
                const start = new Date(startDate);
                // Reset time to start of day
                start.setHours(0, 0, 0, 0);
                transactionMatch.transactionDate.$gte = start;
            }
            if (endDate) {
                // Set end date to end of day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                transactionMatch.transactionDate.$lte = end;
            }
        }

        // 2. Fetch staff. 
        // We want ALL staff that matches the criteria so we can show them even if they have 0 transactions in this period.
        let staffQuery = { vendorId: vendorId };
        if (staffId && staffId !== 'all' && mongoose.Types.ObjectId.isValid(staffId)) {
            staffQuery._id = staffId;
        }

        const allStaff = await StaffModel.find(staffQuery).select('fullName commissionRate accumulatedEarnings totalPaidOut netBalance commissionCount lastTransactionDate _id').lean();

        // 3. Aggregate transactions with Appointment Lookup
        // Note: We use the transactionMatch built above.
        const transactionStats = await StaffTransactionsModel.aggregate([
            { $match: transactionMatch },
            { $sort: { transactionDate: -1 } },

            // Lookup Appointment details to get amount and potentially client
            {
                $lookup: {
                    from: "appointments",
                    localField: "appointmentId",
                    foreignField: "_id",
                    as: "appointmentDetails"
                }
            },
            { $unwind: { path: "$appointmentDetails", preserveNullAndEmptyArrays: true } },

            // Lookup Service details based on Appointment's service ID
            {
                $lookup: {
                    from: "services", // Ensure 'services' matches your actual collection name for ServiceModel
                    localField: "appointmentDetails.service",
                    foreignField: "_id",
                    as: "serviceDetails"
                }
            },
            { $unwind: { path: "$serviceDetails", preserveNullAndEmptyArrays: true } },

            {
                $group: {
                    _id: "$staffId",
                    totalCommissionEarned: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0]
                        }
                    },
                    totalPaidOut: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0]
                        }
                    },
                    commissionCount: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "CREDIT"] }, 1, 0]
                        }
                    },
                    lastTransactionDate: { $max: "$transactionDate" },
                    // Push all fields including details
                    transactions: {
                        $push: {
                            _id: "$_id",
                            transactionDate: "$transactionDate",
                            appointmentId: "$appointmentId",
                            description: "$description",
                            amount: "$amount",
                            type: "$type",
                            paymentMethod: "$paymentMethod",
                            notes: "$notes",
                            appointmentDetails: {
                                clientName: "$appointmentDetails.clientName",
                                finalAmount: "$appointmentDetails.finalAmount",
                                totalAmount: "$appointmentDetails.totalAmount",
                                // We can use the service name from the Service model lookup as primary. Assuming Service Model has 'name'.
                                serviceName: { $ifNull: ["$serviceDetails.name", "$appointmentDetails.serviceName"] },
                            }
                        }
                    }
                }
            }
        ]);


        // 4. Merge data
        // Convert aggregation result to map for O(1) lookup
        const statsMap = new Map();
        transactionStats.forEach(stat => {
            // Ensure ID comparison works by converting to string
            statsMap.set(String(stat._id), stat);
        });

        const reportData = allStaff.map(staff => {
            const stats = statsMap.get(String(staff._id));

            let totalEarned = 0;
            let totalPaid = 0;
            let netBalance = 0;
            let count = 0;
            let lastDate = '-';
            let transactions = [];

            if (stats) {
                totalEarned = stats.totalCommissionEarned || 0;
                totalPaid = stats.totalPaidOut || 0;
                netBalance = totalEarned - totalPaid;
                count = stats.commissionCount || 0;
                lastDate = stats.lastTransactionDate ? new Date(stats.lastTransactionDate).toISOString().split('T')[0] : '-';

                // Format transactions
                transactions = (stats.transactions || []).map(t => {
                    const apt = t.appointmentDetails || {};
                    let serviceName = apt.serviceName;

                    // Fallback to description if service name lookup failed or is empty
                    if (!serviceName) {
                        serviceName = t.description;
                    }

                    if (!serviceName) serviceName = '-';

                    return {
                        transactionId: t._id.toString(),
                        transactionDate: t.transactionDate ? new Date(t.transactionDate).toISOString().split('T')[0] : '',
                        appointmentId: t.appointmentId ? t.appointmentId.toString() : '-',
                        client: apt.clientName || '-',
                        serviceName: serviceName,
                        appointmentAmount: (apt.finalAmount !== undefined ? apt.finalAmount : apt.totalAmount) || 0,
                        commissionRate: staff.commissionRate || 0,
                        commissionEarned: t.amount,
                        type: t.type,
                        notes: t.description || t.notes || '-'
                    };
                });
                // Sort transactions by date desc
                transactions.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));

            } else {
                // No transactions found for this period (or at all).
                // Use Staff Model fields ONLY if no date filter is active (Lifetime view)
                if (!startDate && !endDate) {
                    totalEarned = staff.accumulatedEarnings || 0;
                    totalPaid = staff.totalPaidOut || 0;
                    netBalance = staff.netBalance !== undefined ? staff.netBalance : (totalEarned - totalPaid);
                    count = staff.commissionCount || 0;
                    lastDate = staff.lastTransactionDate ? new Date(staff.lastTransactionDate).toISOString().split('T')[0] : 'N/A';
                }
            }


            return {
                staffId: staff._id,
                staffName: staff.fullName,
                commissionRate: staff.commissionRate ? `${staff.commissionRate}%` : '0%',
                totalCommissionEarned: totalEarned,
                totalPaidOut: totalPaid,
                netCommissionBalance: netBalance,
                commissionCount: count,
                lastTransactionDate: lastDate,
                transactions: transactions
            };
        });

        // Debug log to help trace if it's still empty
        console.log(`Report Generated | Vendor: ${vendorId} | Staff Found: ${allStaff.length} | Transaction Aggregation Groups: ${transactionStats.length}`);

        return NextResponse.json(reportData, { status: 200 });

    } catch (error) {
        console.error('Error in staff commission report API:', error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}, ['vendor', 'doctor']);

