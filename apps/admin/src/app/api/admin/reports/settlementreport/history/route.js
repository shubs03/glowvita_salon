import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import VendorSettlementPaymentModel from '@repo/lib/models/Vendor/VendorSettlementPayment.model';
import { authMiddlewareAdmin } from "../../../../../../middlewareAdmin";
import { getRegionQuery } from "@repo/lib/utils/regionQuery";

// Initialize database connection
const initDb = async () => {
    try {
        await _db();
    } catch (error) {
        console.error("Database connection error:", error);
        throw new Error("Failed to connect to database");
    }
};

// GET - Fetch settlement payment history report
export const GET = authMiddlewareAdmin(async (req) => {
    try {
        await initDb();

        // Extract filter parameters from query
        const { searchParams } = new URL(req.url);
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');
        const vendorName = searchParams.get('vendor');
        const regionId = searchParams.get('regionId');
        const type = searchParams.get('type'); // 'Payment to Vendor' or 'Payment to Admin'

        console.log("Settlement Payment History Report Filter parameters:", { startDateParam, endDateParam, vendorName, type });

        // Build main filter
        let filter = {};

        // Custom date range
        if (startDateParam && endDateParam) {
            filter.paymentDate = {
                $gte: new Date(startDateParam),
                $lte: new Date(endDateParam)
            };
        }

        // Region filter
        const regionQuery = getRegionQuery(req.user, regionId);
        filter = { ...filter, ...regionQuery };

        if (type && type !== 'all') {
            filter.type = type;
        }

        // Fetch payments with vendor info
        let query = VendorSettlementPaymentModel.find(filter)
            .populate({
                path: 'vendorId',
                select: 'businessName shopName city'
            })
            .sort({ paymentDate: -1 });

        const payments = await query;

        // Apply vendor name filter if provided (post-fetch since it's on populated field)
        let results = payments;
        if (vendorName && vendorName !== 'all') {
            results = payments.filter(p =>
                (p.vendorId?.businessName || p.vendorId?.shopName)?.toLowerCase().includes(vendorName.toLowerCase())
            );
        }

        // Format to report structure
        const formattedResults = results.map(p => ({
            id: p._id,
            date: p.paymentDate,
            vendorName: p.vendorId?.businessName || p.vendorId?.shopName || 'N/A',
            city: p.vendorId?.city || 'N/A',
            type: p.type,
            method: p.paymentMethod,
            amount: p.amount,
            transactionId: p.transactionId || '---',
            notes: p.notes || ''
        }));

        // Calculate totals
        const aggregatedTotals = formattedResults.reduce((acc, curr) => {
            if (curr.type === 'Payment to Vendor') {
                acc.totalPaidToVendor += curr.amount;
            } else {
                acc.totalPaidToAdmin += curr.amount;
            }
            return acc;
        }, { totalPaidToVendor: 0, totalPaidToAdmin: 0 });

        return NextResponse.json({
            success: true,
            data: formattedResults,
            aggregatedTotals,
            vendorNames: Array.from(new Set(payments.map(p => p.vendorId?.businessName || p.vendorId?.shopName).filter(Boolean)))
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching settlement history report:", error);
        return NextResponse.json({
            success: false,
            message: "Error fetching settlement history report",
            error: error.message
        }, { status: 500 });
    }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);
