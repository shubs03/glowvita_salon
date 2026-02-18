import { NextResponse } from "next/server";
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import VendorModel from '@repo/lib/models/Vendor.model';
import VendorSettlementPaymentModel from '@repo/lib/models/Vendor/VendorSettlementPayment.model';
import _db from '@repo/lib/db';
import { authMiddlewareAdmin } from '@/middlewareAdmin.js';
import mongoose from 'mongoose';

await _db();

/**
 * GET /api/admin/settlements
 * Fetch all vendor settlements based on completed appointments
 */
export const GET = authMiddlewareAdmin(async (req) => {
    try {
        const { searchParams } = new URL(req.url);

        // Get filter parameters
        const period = searchParams.get('period') || 'all';
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

        // Fetch completed appointments for ALL vendors
        const appointments = await AppointmentModel.find({
            date: { $gte: startDate, $lte: endDate },
            paymentStatus: 'completed',
            status: { $in: ['scheduled', 'confirmed', 'completed'] }
        })
            .populate({
                path: 'vendorId',
                select: 'businessName ownerName contactNumber email',
                strictPopulate: false
            })
            .sort({ date: -1 });

        // Fetch actual payment history for ALL vendors
        const paymentHistory = await VendorSettlementPaymentModel.find({
            paymentDate: { $gte: startDate, $lte: endDate }
        })
            .populate('vendorId', 'businessName ownerName contactNumber email')
            .sort({ paymentDate: -1 });

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
                    adminOwesVendor: 0,
                    vendorOwesAdmin: 0,
                    netSettlement: 0,
                    adminReceivableAmount: 0,
                    vendorAmount: 0,
                    amountPaid: 0,
                    amountPending: 0,
                    paymentHistory: []
                });
            }

            const settlement = vendorSettlementsMap.get(vendorId);

            const appointmentData = {
                _id: appt._id.toString(),
                date: appt.date,
                clientName: appt.clientName || 'N/A',
                serviceName: appt.serviceName || 'N/A',
                totalAmount: appt.totalAmount || 0,
                platformFee: appt.platformFee || 0,
                serviceTax: appt.serviceTax || 0,
                finalAmount: appt.finalAmount || 0,
                paymentMethod: appt.paymentMethod || 'N/A',
            };

            settlement.appointments.push(appointmentData);

            const serviceAmount = (appt.totalAmount || 0);
            const fees = (appt.platformFee || 0) + (appt.serviceTax || 0);

            settlement.totalAmount += appt.finalAmount || 0;
            settlement.platformFeeTotal += appt.platformFee || 0;
            settlement.serviceTaxTotal += appt.serviceTax || 0;

            if (appt.paymentMethod === 'Pay Online') {
                settlement.adminOwesVendor += serviceAmount;
            } else if (appt.paymentMethod === 'Pay at Salon') {
                settlement.vendorOwesAdmin += fees;
            }
        });

        // Add payment history and ensure all vendors with history are included
        paymentHistory.forEach(payment => {
            const vId = payment.vendorId?._id?.toString() || payment.vendorId?.toString();
            if (!vId) return;

            if (!vendorSettlementsMap.has(vId)) {
                vendorSettlementsMap.set(vId, {
                    vendorId: vId,
                    vendorName: payment.vendorId?.businessName || 'Unknown Vendor',
                    contactNo: payment.vendorId?.contactNumber || 'N/A',
                    ownerName: payment.vendorId?.ownerName || 'N/A',
                    appointments: [],
                    totalAmount: 0,
                    platformFeeTotal: 0,
                    serviceTaxTotal: 0,
                    adminOwesVendor: 0,
                    vendorOwesAdmin: 0,
                    netSettlement: 0,
                    adminReceivableAmount: 0,
                    vendorAmount: 0,
                    amountPaid: 0,
                    amountPending: 0,
                    paymentHistory: []
                });
            }

            const s = vendorSettlementsMap.get(vId);
            s.paymentHistory.push(payment);
        });

        // Calculate final amounts for each vendor
        const settlements = Array.from(vendorSettlementsMap.values()).map(settlement => {
            settlement.netSettlement = settlement.adminOwesVendor - settlement.vendorOwesAdmin;

            let totalPaidToVendor = settlement.paymentHistory
                .filter(p => p.type === "Payment to Vendor").reduce((acc, p) => acc + p.amount, 0);
            let totalPaidToAdmin = settlement.paymentHistory
                .filter(p => p.type === "Payment to Admin").reduce((acc, p) => acc + p.amount, 0);

            if (settlement.netSettlement > 0) {
                // Admin owes vendor
                settlement.adminReceivableAmount = 0;
                settlement.vendorAmount = settlement.netSettlement;
                settlement.amountPending = Math.max(0, settlement.netSettlement - totalPaidToVendor);
            } else if (settlement.netSettlement < 0) {
                // Vendor owes admin
                const vendorOwes = Math.abs(settlement.netSettlement);
                settlement.adminReceivableAmount = vendorOwes;
                settlement.vendorAmount = 0;
                settlement.amountPending = Math.max(0, vendorOwes - totalPaidToAdmin);
            }

            // Status
            if (settlement.amountPending <= 0) {
                settlement.status = 'Paid';
            } else {
                let paidAmt = settlement.netSettlement > 0 ? totalPaidToVendor : totalPaidToAdmin;
                settlement.status = paidAmt > 0 ? 'Partially Paid' : 'Pending';
            }

            let amountPaid = settlement.netSettlement > 0 ? totalPaidToVendor : totalPaidToAdmin;

            return {
                id: settlement.vendorId,
                ...settlement,
                totalVolume: settlement.totalAmount,
                totalToSettle: Math.abs(settlement.netSettlement),
                amountPaid: amountPaid,
                amountRemaining: settlement.amountPending
            };
        });

        // Filter by status if requested
        const filteredSettlements = statusFilter === 'all'
            ? settlements
            : settlements.filter(s => s.status === statusFilter);

        return NextResponse.json({
            success: true,
            data: filteredSettlements,
            history: paymentHistory,
            summary: {
                totalSettlements: filteredSettlements.length,
                totalAmount: filteredSettlements.reduce((sum, s) => sum + s.totalAmount, 0),
                totalAdminOwes: filteredSettlements.reduce((sum, s) => sum + (s.netSettlement > 0 ? s.amountPending : 0), 0),
                totalVendorOwes: filteredSettlements.reduce((sum, s) => sum + (s.netSettlement < 0 ? s.amountPending : 0), 0),
            }
        });

    } catch (error) {
        console.error("Error fetching admin settlements:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}, ['admin', 'SUPER_ADMIN', 'REGIONAL_ADMIN', 'STAFF'], "payout:view");

/**
 * POST /api/admin/settlements
 * Record a payment (Admin paying Vendor or receiving from Vendor)
 */
export const POST = authMiddlewareAdmin(async (req) => {
    try {
        const body = await req.json();
        const { vendorId, amount, type, paymentMethod, transactionId, notes } = body;

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
            type, // "Payment to Vendor" | "Payment to Admin"
            paymentMethod,
            transactionId,
            notes,
            paymentDate: new Date(),
            createdBy: req.user.userId,
            createdByType: 'admin'
        });

        return NextResponse.json({
            success: true,
            message: "Payment recorded successfully",
            data: paymentRecord
        });

    } catch (error) {
        console.error("Error recording admin settlement:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}, ['admin', 'SUPER_ADMIN', 'REGIONAL_ADMIN', 'STAFF'], "payout:edit");
