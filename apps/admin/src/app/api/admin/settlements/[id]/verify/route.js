import { NextResponse } from "next/server";
import VendorSettlementPaymentModel from '@repo/lib/models/Vendor/VendorSettlementPayment.model';
import _db from '@repo/lib/db';
import { authMiddlewareAdmin } from '@/middlewareAdmin.js';
import mongoose from 'mongoose';

await _db();

/**
 * PATCH /api/admin/settlements/[id]/verify
 * Manually verify a payment record
 */
export const PATCH = authMiddlewareAdmin(async (req, { params }) => {
    try {
        const { id } = params;
        const body = await req.json();
        const { verified } = body;

        if (typeof verified !== 'boolean') {
            return NextResponse.json(
                { success: false, message: "Missing or invalid verified status" },
                { status: 400 }
            );
        }

        console.log(`[VerifyAPI] Direct DB Update for ${id} to verified: ${verified}`);
        
        // Use direct MongoDB driver to bypass Mongoose schema stripping for newly added fields
        const result = await VendorSettlementPaymentModel.collection.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(id) },
            { 
                $set: { 
                    verified: verified,
                    verifiedAt: verified ? new Date() : null,
                    verifiedBy: verified ? new mongoose.Types.ObjectId(req.user.userId) : null
                } 
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            console.error(`[VerifyAPI] Payment ${id} not found in direct update`);
            return NextResponse.json(
                { success: false, message: "Payment record not found" },
                { status: 404 }
            );
        }

        // Fetch fully populated version for frontend (using lean to avoid Mongoose stripping)
        const updatedPayment = await VendorSettlementPaymentModel.findById(id)
            .populate({ path: 'verifiedBy', select: 'name email', strictPopulate: false })
            .populate({ path: 'createdBy', select: 'name email', strictPopulate: false })
            .populate({ path: 'vendorId', select: 'businessName ownerName contactNumber email', strictPopulate: false })
            .lean();

        console.log(`[VerifyAPI] Final Save Check - Verified: ${updatedPayment?.verified}`);

        return NextResponse.json({
            success: true,
            message: `Payment marked as ${verified ? 'verified' : 'unverified'}`,
            data: updatedPayment
        });

    } catch (error) {
        console.error("Error verifying payment:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}, ['admin', 'SUPER_ADMIN', 'REGIONAL_ADMIN'], "payout:edit");
