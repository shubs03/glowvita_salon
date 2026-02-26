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


        // 1. Get Opening Balance (everything before startDate)
        const prevAppointments = await AppointmentModel.find({
            vendorId: vendorObjectId,
            date: { $lt: startDate },
            status: { $in: ['completed', 'partially-completed'] },
            $or: [
                { paymentMethod: 'Pay Online', paymentStatus: 'completed' },
                { paymentMethod: 'Pay at Salon' },
                { mode: 'online' }
            ]
        });

        const prevPayments = await VendorSettlementPaymentModel.find({
            vendorId: vendorObjectId,
            paymentDate: { $lt: startDate }
        });

        let openingAdminOwesVendor = 0;
        let openingVendorOwesAdmin = 0;
        let openingPaidToVendor = 0;
        let openingPaidToAdmin = 0;

        prevAppointments.forEach(appt => {
            if (appt.paymentMethod === 'Pay Online') {
                openingAdminOwesVendor += (appt.totalAmount || 0);
            } else {
                openingVendorOwesAdmin += (appt.platformFee || 0) + (appt.serviceTax || 0);
            }
        });

        prevPayments.forEach(p => {
            if (p.type === "Payment to Vendor") openingPaidToVendor += p.amount;
            else openingPaidToAdmin += p.amount;
        });

        // Opening Balance (Positive = Admin owes Vendor, Negative = Vendor owes Admin)
        const openingNetBalance = (openingAdminOwesVendor - openingVendorOwesAdmin) + (openingPaidToVendor - openingPaidToAdmin);

        // 2. Fetch current period appointments
        const appointments = await AppointmentModel.find({
            vendorId: vendorObjectId,
            date: { $gte: startDate, $lte: endDate },
            status: { $in: ['completed', 'partially-completed'] },
            $or: [
                { paymentMethod: 'Pay Online', paymentStatus: 'completed' },
                { paymentMethod: 'Pay at Salon' },
                { mode: 'online' }
            ]
        })
            .populate({
                path: 'vendorId',
                select: 'businessName ownerName contactNumber email',
                strictPopulate: false
            })
            .sort({ date: -1 });

        // 3. Fetch current period payment history
        const paymentHistory = await VendorSettlementPaymentModel.find({
            vendorId: vendorObjectId,
            paymentDate: { $gte: startDate, $lte: endDate }
        }).sort({ paymentDate: -1 });

        // Group appointments by vendor
        const vendorSettlementsMap = new Map();

        // Initialize with default or previous balance data
        const initialSettlement = {
            vendorId: vendorObjectId.toString(),
            vendorName: 'N/A', // Will be updated by appointments or fallback
            contactNo: 'N/A',
            ownerName: 'N/A',
            appointments: [],
            totalAmount: 0,
            platformFeeTotal: 0,
            serviceTaxTotal: 0,
            adminOwesVendor: 0,
            vendorOwesAdmin: 0,
            openingBalance: openingNetBalance,
            netSettlement: 0,
            adminReceivableAmount: 0,
            vendorAmount: 0,
            amountPaid: 0,
            amountPending: 0,
            paymentHistory: []
        };

        // If we have appointments, we'll get vendor info from them
        // If not, we should still try to get it from Vendor model for empty settlements
        if (appointments.length === 0) {
            const vendor = await VendorModel.findById(vendorObjectId);
            if (vendor) {
                initialSettlement.vendorName = vendor.businessName;
                initialSettlement.contactNo = vendor.contactNumber;
                initialSettlement.ownerName = vendor.ownerName;
            }
        }

        vendorSettlementsMap.set(vendorObjectId.toString(), initialSettlement);

        appointments.forEach(appt => {
            const vendorId = appt.vendorId?._id?.toString() || appt.vendorId?.toString();
            if (!vendorId) return;

            const settlement = vendorSettlementsMap.get(vendorId);
            settlement.vendorName = appt.vendorId?.businessName || settlement.vendorName;
            settlement.contactNo = appt.vendorId?.contactNumber || settlement.contactNo;
            settlement.ownerName = appt.vendorId?.ownerName || settlement.ownerName;

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

            const serviceAmount = (appt.totalAmount || 0);
            const fees = (appt.platformFee || 0) + (appt.serviceTax || 0);

            settlement.totalAmount += appt.finalAmount || 0;
            settlement.platformFeeTotal += appt.platformFee || 0;
            settlement.serviceTaxTotal += appt.serviceTax || 0;

            if (appt.paymentMethod === 'Pay Online') {
                settlement.adminOwesVendor += serviceAmount;
            } else {
                settlement.vendorOwesAdmin += fees;
            }
        });

        // Add payment history
        paymentHistory.forEach(payment => {
            const vId = payment.vendorId.toString();
            if (vendorSettlementsMap.has(vId)) {
                const s = vendorSettlementsMap.get(vId);
                s.paymentHistory.push(payment);
            }
        });

        // Calculate final amounts with Ledger Logic
        const settlements = Array.from(vendorSettlementsMap.values()).map(settlement => {
            // Period Balance = Amount earned in period - Fees in period
            const periodNet = settlement.adminOwesVendor - settlement.vendorOwesAdmin;

            // Total Ledger Balance including opening balance
            const totalNetBalance = settlement.openingBalance + periodNet;

            const totalPaidToVendorInPeriod = settlement.paymentHistory
                .filter(p => p.type === "Payment to Vendor").reduce((acc, p) => acc + p.amount, 0);
            const totalPaidToAdminInPeriod = settlement.paymentHistory
                .filter(p => p.type === "Payment to Admin").reduce((acc, p) => acc + p.amount, 0);

            // Closing Balance (Positive = Admin owes Vendor, Negative = Vendor owes Admin)
            const closingBalance = totalNetBalance - totalPaidToVendorInPeriod + totalPaidToAdminInPeriod;

            settlement.netSettlement = totalNetBalance; // Total amount to be settled (Opening + New)

            if (closingBalance > 0) {
                // Admin owes vendor
                settlement.adminReceivableAmount = 0;
                settlement.vendorAmount = closingBalance;
                settlement.amountPending = closingBalance;
                settlement.status = closingBalance <= 0 ? 'Paid' : (totalPaidToVendorInPeriod > 0 ? 'Partially Paid' : 'Pending');
            } else if (closingBalance < 0) {
                // Vendor owes admin
                const vendorOwes = Math.abs(closingBalance);
                settlement.adminReceivableAmount = vendorOwes;
                settlement.vendorAmount = 0;
                settlement.amountPending = vendorOwes;
                settlement.status = vendorOwes <= 0 ? 'Paid' : (totalPaidToAdminInPeriod > 0 ? 'Partially Paid' : 'Pending');
            } else {
                settlement.amountPending = 0;
                settlement.status = 'Paid';
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

        // Vendors can only record payments TO admin (platform fees owed for Pay at Salon)
        // Only admin can record 'Payment to Vendor' — that's done via /api/admin/settlements
        if (type !== 'Payment to Admin') {
            return NextResponse.json(
                { success: false, message: "Unauthorized: Vendors can only record payments to Admin. Admin payouts are managed by the Admin panel." },
                { status: 403 }
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

