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
 * Supports regionId query param for region-wise filtering (same as reports)
 */
export const GET = authMiddlewareAdmin(async (req) => {
    try {
        const { searchParams } = new URL(req.url);

        // Get filter parameters
        const period = searchParams.get('period') || 'all';
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');
        const statusFilter = searchParams.get('status') || 'all';
        const regionId = searchParams.get('regionId');

        // Build region filter based on admin role (mirrors getRegionQuery logic)
        const { roleName, assignedRegions } = req.user;
        const toObjectId = (id) => {
            if (id && typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)) {
                return new mongoose.Types.ObjectId(id);
            }
            return id;
        };

        const buildRegionFilter = () => {
            const role = (roleName || '').toUpperCase();
            if (role === 'SUPER_ADMIN' || role === 'SUPERADMIN') {
                if (regionId && regionId !== 'all') {
                    return { regionId: toObjectId(regionId) };
                }
                return {}; // No region restriction for Super Admin by default
            }

            // Regional Admin is scoped to their assigned regions
            if (assignedRegions && assignedRegions.length > 0) {
                const objectIdRegions = assignedRegions.map(toObjectId);
                if (regionId && regionId !== 'all' && assignedRegions.includes(regionId)) {
                    return { regionId: toObjectId(regionId) };
                }
                return { regionId: { $in: objectIdRegions } };
            }

            return { regionId: 'none' }; // Security fallback - matches nothing
        };

        const regionFilter = buildRegionFilter();
        console.log('[Settlements] Raw Region Filter:', JSON.stringify(regionFilter));

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
                    endDate = new Date(now.getFullYear() + 1, 11, 31, 23, 59, 59, 999);
            }
        }

        // 1. Get ALL vendors matching region to initialize the list
        // This ensures we show vendors with balances even if they have no new appointments
        const vendors = await VendorModel.find(regionFilter).select('businessName ownerName contactNumber email regionId');
        console.log(`[Settlements] Found ${vendors.length} vendors in region`);

        // Build appointment query: date + region
        const appointmentMatchFilter = {
            date: { $gte: startDate, $lte: endDate },
            status: { $in: ['completed', 'partially-completed'] },
            $or: [
                { paymentMethod: 'Pay Online', paymentStatus: 'completed' },
                { paymentMethod: 'Pay at Salon' },
                { mode: 'online' }
            ],
            ...regionFilter
        };

        // 2. Get Opening Balances for all vendors up to startDate
        const openingStatsArray = await AppointmentModel.aggregate([
            {
                $match: {
                    date: { $lt: startDate },
                    status: { $in: ['completed', 'partially-completed'] },
                    $or: [
                        { paymentMethod: 'Pay Online', paymentStatus: 'completed' },
                        { paymentMethod: 'Pay at Salon' },
                        { mode: 'online' }
                    ],
                    ...regionFilter
                }
            },
            {
                $group: {
                    _id: "$vendorId",
                    adminOwesVendor: {
                        $sum: { $cond: [{ $eq: ["$paymentMethod", "Pay Online"] }, "$totalAmount", 0] }
                    },
                    vendorOwesAdmin: {
                        $sum: { $cond: [{ $eq: ["$paymentMethod", "Pay at Salon"] }, { $add: ["$platformFee", "$serviceTax"] }, 0] }
                    }
                }
            }
        ]);

        const openingPaymentsArray = await VendorSettlementPaymentModel.aggregate([
            {
                $match: { 
                    paymentDate: { $lt: startDate },
                    verified: { $ne: false }
                }
            },
            {
                $group: {
                    _id: "$vendorId",
                    paidToAdmin: { $sum: { $cond: [{ $eq: ["$type", "Payment to Admin"] }, "$amount", 0] } },
                    paidToVendor: { $sum: { $cond: [{ $eq: ["$type", "Payment to Vendor"] }, "$amount", 0] } }
                }
            }
        ]);

        // Map for quick lookup
        const openingBalancesMap = new Map();
        openingStatsArray.forEach(s => {
            if (s._id) {
                const vId = s._id.toString();
                openingBalancesMap.set(vId, (s.adminOwesVendor - s.vendorOwesAdmin));
            }
        });
        openingPaymentsArray.forEach(p => {
            if (p._id) {
                const vId = p._id.toString();
                const current = openingBalancesMap.get(vId) || 0;
                openingBalancesMap.set(vId, current + (p.paidToVendor - p.paidToAdmin));
            }
        });

        // 3. Initialize the vendorSettlementsMap with ALL relevant vendors
        const vendorSettlementsMap = new Map();
        vendors.forEach(vendor => {
            const vId = vendor._id.toString();
            vendorSettlementsMap.set(vId, {
                vendorId: vId,
                vendorName: vendor.businessName || 'N/A',
                contactNo: vendor.contactNumber || 'N/A',
                ownerName: vendor.ownerName || 'N/A',
                appointments: [],
                totalAmount: 0,
                platformFeeTotal: 0,
                serviceTaxTotal: 0,
                adminOwesVendor: 0,
                vendorOwesAdmin: 0,
                openingBalance: openingBalancesMap.get(vId) || 0,
                netSettlement: 0,
                adminReceivableAmount: 0,
                vendorAmount: 0,
                amountPaid: 0,
                amountPending: 0,
                paymentHistory: []
            });
        });

        // 4. Fetch current period appointments and group them
        const appointments = await AppointmentModel.find(appointmentMatchFilter).sort({ date: -1 });

        appointments.forEach(appt => {
            const vendorId = appt.vendorId?.toString();
            if (!vendorId || !vendorSettlementsMap.has(vendorId)) return;

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
            } else {
                settlement.vendorOwesAdmin += fees;
            }
        });

        // 5. Fetch current period payment history
        const paymentHistoryFilter = {
            paymentDate: { $gte: startDate, $lte: endDate }
        };

        const paymentHistory = await VendorSettlementPaymentModel.find(paymentHistoryFilter)
            .populate({ path: 'vendorId', select: 'businessName ownerName contactNumber email', strictPopulate: false })
            .populate({ path: 'verifiedBy', select: 'name email', strictPopulate: false })
            .populate({ path: 'createdBy', select: 'name email', strictPopulate: false })
            .sort({ paymentDate: -1 })
            .lean();

        // Add payment history to map
        paymentHistory.forEach(payment => {
            const vId = payment.vendorId?._id?.toString() || payment.vendorId?.toString();
            if (!vId) return;

            if (vendorSettlementsMap.has(vId)) {
                const s = vendorSettlementsMap.get(vId);
                s.paymentHistory.push(payment);
            }
        });

        // 6. Calculate final amounts with Ledger Logic
        const settlements = Array.from(vendorSettlementsMap.values()).map(settlement => {
            const periodNet = settlement.adminOwesVendor - settlement.vendorOwesAdmin;
            const totalNetBalance = settlement.openingBalance + periodNet;

            const totalPaidToVendorInPeriod = settlement.paymentHistory
                .filter(p => p.type === "Payment to Vendor" && p.verified !== false).reduce((acc, p) => acc + p.amount, 0);
            const totalPaidToAdminInPeriod = settlement.paymentHistory
                .filter(p => p.type === "Payment to Admin" && p.verified !== false).reduce((acc, p) => acc + p.amount, 0);

            let closingBalance = totalNetBalance - totalPaidToVendorInPeriod + totalPaidToAdminInPeriod;
            // Handle float precision
            closingBalance = Math.round(closingBalance * 100) / 100;

            settlement.netSettlement = totalNetBalance;

            if (closingBalance > 0.01) {
                // Admin owes vendor
                settlement.adminReceivableAmount = 0;
                settlement.vendorAmount = closingBalance;
                settlement.amountPending = closingBalance;
                settlement.status = (totalPaidToVendorInPeriod > 0) ? 'Partially Paid' : 'Pending';
            } else if (closingBalance < -0.01) {
                // Vendor owes admin
                const vendorOwes = Math.abs(closingBalance);
                settlement.adminReceivableAmount = vendorOwes;
                settlement.vendorAmount = 0;
                settlement.amountPending = vendorOwes;
                settlement.status = (totalPaidToAdminInPeriod > 0) ? 'Partially Paid' : 'Pending';
            } else {
                settlement.amountPending = 0;
                settlement.adminReceivableAmount = 0;
                settlement.vendorAmount = 0;
                settlement.status = 'Paid';
            }

            return {
                id: settlement.vendorId,
                ...settlement,
                totalVolume: settlement.totalAmount,
                totalToSettle: Math.abs(settlement.netSettlement),
                amountPaid: Math.abs(closingBalance - totalNetBalance), // Amount paid in THIS period
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
        const { vendorId, amount, type, paymentMethod, transactionId, notes, paymentDate } = body;

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
            paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
            createdBy: req.user.userId,
            createdByType: 'admin',
            verified: true
        });
        
        // Also ensure verifiedAt and verifiedBy are set since it's already verified
        if (paymentRecord.verified) {
           paymentRecord.verifiedAt = new Date();
           paymentRecord.verifiedBy = req.user.userId;
           await paymentRecord.save();
        }

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
