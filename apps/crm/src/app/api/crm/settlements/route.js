import { NextResponse } from "next/server";
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import StaffModel from '@repo/lib/models/Vendor/Staff.model';
import VendorSettlementPaymentModel from '@repo/lib/models/Vendor/VendorSettlementPayment.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';
import mongoose from 'mongoose';

await _db();

/**
 * GET /api/crm/settlements
 * Fetch all vendor settlements based on completed appointments
 * 
 * Query Parameters:
 * - period: 'today' | 'week' | 'month' | 'year' | 'all'
 * - startDate: ISO date string
 * - endDate: ISO date string
 * - status: 'Paid' | 'Pending' | 'Partially Paid' | 'all'
 */
export const GET = authMiddlewareCrm(async (req) => {
    try {
        const { searchParams } = new URL(req.url);
        const userId = req.user.userId;
        const userRole = req.user.role;

        let vendorIdToUse = null;

        if (userRole === 'vendor' || userRole === 'doctor') {
            vendorIdToUse = userId;
        } else if (userRole === 'staff') {
            const staffMember = await StaffModel.findById(userId);
            if (staffMember && staffMember.vendorId) {
                vendorIdToUse = staffMember.vendorId;
            }
        }

        if (!vendorIdToUse) {
            return NextResponse.json(
                { success: false, message: "Vendor ID not found for current user" },
                { status: 403 }
            );
        }

        // Convert to ObjectId for querying
        const vendorObjectId = new mongoose.Types.ObjectId(vendorIdToUse.toString());

        // Get filter parameters
        const period = searchParams.get('period') || 'month';
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');
        const statusFilter = searchParams.get('status') || 'all';

        // Calculate date range
        let startDate, endDate;
        const now = new Date();

        if (startDateParam && endDateParam) {
            startDate = new Date(startDateParam);
            endDate = new Date(endDateParam);
        } else {
            switch (period) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                    break;
                case 'week':
                    const dayOfWeek = now.getDay();
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - dayOfWeek);
                    startDate.setHours(0, 0, 0, 0);
                    endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + 6);
                    endDate.setHours(23, 59, 59, 999);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                    break;
                case 'year':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
                    break;
                default: // 'all'
                    startDate = new Date(2020, 0, 1);
                    endDate = new Date(now.getFullYear() + 1, 0, 1, 23, 59, 59, 999);
            }
        }

        // Fetch completed appointments for this specific vendor
        const appointments = await AppointmentModel.find({
            vendorId: vendorObjectId,
            date: { $gte: startDate, $lte: endDate },
            paymentStatus: 'completed',
            mode: 'online', // Only online bookings
            status: { $in: ['scheduled', 'confirmed', 'completed'] } // Exclude cancelled
        })
            .populate({
                path: 'vendorId',
                select: 'businessName ownerName contactNumber email',
                strictPopulate: false
            })
            .sort({ date: -1 });

        // Fetch actual payment history
        const paymentHistory = await VendorSettlementPaymentModel.find({
            vendorId: vendorObjectId,
            paymentDate: { $gte: startDate, $lte: endDate }
        }).sort({ paymentDate: -1 });

        // Group appointments by vendor
        const vendorSettlementsMap = new Map();

        appointments.forEach(appt => {
            const vendorId = appt.vendorId?._id?.toString() || appt.vendorId?.toString();

            if (!vendorId) return;

            if (!vendorSettlementsMap.has(vendorId)) {
                vendorSettlementsMap.set(vendorId, {
                    vendorId: vendorId,
                    vendorName: appt.vendorId?.businessName || 'Unknown Vendor',
                    contactNo: appt.vendorId?.contactNumber || 'N/A',
                    ownerName: appt.vendorId?.ownerName || 'N/A',
                    appointments: [],
                    totalAmount: 0,
                    platformFeeTotal: 0,
                    serviceTaxTotal: 0,
                    deductionAmount: 0,
                    receivableAmount: 0,

                    // Pay Online: Admin owes vendor (service amount only)
                    adminOwesVendor: 0,

                    // Pay at Salon: Vendor owes admin (platform fee + service tax)
                    vendorOwesAdmin: 0,

                    // Net settlement (positive = admin owes vendor, negative = vendor owes admin)
                    netSettlement: 0,

                    adminReceivableAmount: 0,
                    vendorAmount: 0,
                    amountPaid: 0,
                    amountPending: 0,
                    paymentHistory: []
                });
            }

            const settlement = vendorSettlementsMap.get(vendorId);

            // Add appointment to settlement
            const appointmentData = {
                _id: appt._id.toString(),
                appointmentId: appt._id.toString(),
                date: appt.date,
                clientName: appt.clientName || 'N/A',
                serviceName: appt.serviceName || 'N/A',
                staffName: appt.staffName || 'N/A',
                totalAmount: appt.totalAmount || 0,
                platformFee: appt.platformFee || 0,
                serviceTax: appt.serviceTax || 0,
                finalAmount: appt.finalAmount || 0,
                paymentStatus: appt.paymentStatus || 'pending',
                paymentMethod: appt.paymentMethod || 'N/A',
                mode: appt.mode || 'offline',
            };

            settlement.appointments.push(appointmentData);

            // Calculate totals based on payment method
            const serviceAmount = (appt.totalAmount || 0); // Service amount (without fees/tax)
            const fees = (appt.platformFee || 0) + (appt.serviceTax || 0);

            settlement.totalAmount += appt.finalAmount || 0;
            settlement.platformFeeTotal += appt.platformFee || 0;
            settlement.serviceTaxTotal += appt.serviceTax || 0;

            if (appt.paymentMethod === 'Pay Online') {
                // Pay Online: Admin received full amount, owes vendor the service amount
                settlement.adminOwesVendor += serviceAmount;
            } else if (appt.paymentMethod === 'Pay at Salon') {
                // Pay at Salon: Vendor received full amount, owes admin the fees
                settlement.vendorOwesAdmin += fees;
            }
        });

        // Add payment history to settlements
        paymentHistory.forEach(payment => {
            const vId = payment.vendorId.toString();
            if (vendorSettlementsMap.has(vId)) {
                const s = vendorSettlementsMap.get(vId);
                s.paymentHistory.push(payment);

                // Track total amount already paid/transferred
                // Payment to Vendor means admin SENT money to vendor
                // Payment to Admin means vendor SENT money to admin
                if (payment.type === "Payment to Vendor") {
                    s.amountPaid += payment.amount;
                } else if (payment.type === "Payment to Admin") {
                    // This reduces what the vendor owes the admin
                    s.amountPaid -= payment.amount;
                }
            }
        });

        // Convert map to array and calculate final amounts
        const settlements = Array.from(vendorSettlementsMap.values()).map(settlement => {
            // Calculate net settlement
            // Positive = Admin owes vendor
            // Negative = Vendor owes admin
            settlement.netSettlement = settlement.adminOwesVendor - settlement.vendorOwesAdmin;

            // Base pending calculation
            if (settlement.netSettlement > 0) {
                // Admin owes vendor
                settlement.adminReceivableAmount = 0;
                settlement.vendorAmount = settlement.netSettlement;
                settlement.amountPending = Math.max(0, settlement.netSettlement - settlement.amountPaid);
            } else if (settlement.netSettlement < 0) {
                // Vendor owes admin
                const vendorOwes = Math.abs(settlement.netSettlement);
                settlement.adminReceivableAmount = vendorOwes;
                settlement.vendorAmount = 0;
                // If vendor paid admin, amountPaid was negative in my loop above (e.g. -= payment.amount)
                // Let's rethink logic: 
                // Let's use totalPaidVendor and totalPaidAdmin
                let totalPaidToVendor = settlement.paymentHistory
                    .filter(p => p.type === "Payment to Vendor").reduce((acc, p) => acc + p.amount, 0);
                let totalPaidToAdmin = settlement.paymentHistory
                    .filter(p => p.type === "Payment to Admin").reduce((acc, p) => acc + p.amount, 0);

                if (settlement.netSettlement > 0) {
                    settlement.amountPending = Math.max(0, settlement.netSettlement - totalPaidToVendor);
                } else {
                    settlement.amountPending = Math.max(0, Math.abs(settlement.netSettlement) - totalPaidToAdmin);
                }
            } else {
                // Balanced
                settlement.adminReceivableAmount = 0;
                settlement.vendorAmount = 0;
                settlement.amountPending = 0;
            }

            // Determine status
            if (settlement.amountPending <= 0) {
                settlement.status = 'Paid';
            } else {
                let paidAmt = settlement.netSettlement > 0 ?
                    settlement.paymentHistory.filter(p => p.type === "Payment to Vendor").reduce((acc, p) => acc + p.amount, 0) :
                    settlement.paymentHistory.filter(p => p.type === "Payment to Admin").reduce((acc, p) => acc + p.amount, 0);

                if (paidAmt > 0) {
                    settlement.status = 'Partially Paid';
                } else {
                    settlement.status = 'Pending';
                }
            }

            return {
                id: `SETTLEMENT_${settlement.vendorId}_${startDate.getTime()}`,
                ...settlement,
                settlementFromDate: startDate,
                settlementToDate: endDate,
            };
        });

        // Apply status filter
        const filteredSettlements = statusFilter === 'all'
            ? settlements
            : settlements.filter(s => s.status === statusFilter);

        return NextResponse.json({
            success: true,
            data: filteredSettlements,
            filters: {
                period,
                startDate,
                endDate,
                status: statusFilter,
            },
            summary: {
                totalSettlements: filteredSettlements.length,
                totalAmount: filteredSettlements.reduce((sum, s) => sum + s.totalAmount, 0),
                totalAdminReceivable: filteredSettlements.reduce((sum, s) => sum + s.adminReceivableAmount, 0),
                totalVendorAmount: filteredSettlements.reduce((sum, s) => sum + s.vendorAmount, 0),
                totalPaid: filteredSettlements.reduce((sum, s) => {
                    return sum + s.paymentHistory.reduce((acc, p) => acc + p.amount, 0);
                }, 0),
                totalPending: filteredSettlements.reduce((sum, s) => sum + s.amountPending, 0),
            }
        });

    } catch (error) {
        console.error("Error fetching settlements:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
});

/**
 * POST /api/crm/settlements
 * Record a payment (Transfer)
 * 
 * Body:
 * - vendorId: string
 * - amount: number
 * - type: "Payment to Vendor" | "Payment to Admin"
 * - paymentMethod: string
 * - transactionId?: string
 * - notes?: string
 */
export const POST = authMiddlewareCrm(async (req) => {
    try {
        const body = await req.json();
        const { vendorId, amount, type, paymentMethod, transactionId, notes } = body;
        const userId = req.user.userId;
        const userRole = req.user.role;

        // Determine authorized vendorId for this user
        let authVendorId = null;
        if (userRole === 'vendor' || userRole === 'doctor') {
            authVendorId = userId;
        } else if (userRole === 'staff') {
            const staffMember = await StaffModel.findById(userId);
            if (staffMember && staffMember.vendorId) {
                authVendorId = staffMember.vendorId;
            }
        }

        if (!authVendorId) {
            return NextResponse.json(
                { success: false, message: "Vendor ID not found for current user" },
                { status: 403 }
            );
        }

        // Ensure the vendorId in the request matches the authorized vendorId
        if (vendorId !== authVendorId.toString()) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        // Validate required fields
        if (!vendorId || !amount || !paymentMethod || !type) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Verify vendor exists
        const vendor = await VendorModel.findById(vendorId);
        if (!vendor) {
            return NextResponse.json(
                { success: false, message: "Vendor not found" },
                { status: 404 }
            );
        }

        const paymentRecord = await VendorSettlementPaymentModel.create({
            vendorId,
            amount,
            type,
            paymentMethod,
            transactionId,
            notes,
            paymentDate: new Date(),
            createdBy: req.user.userId,
        });

        return NextResponse.json({
            success: true,
            message: "Payment recorded successfully",
            data: paymentRecord
        });

    } catch (error) {
        console.error("Error recording payment:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
});

