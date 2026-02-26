import { authMiddlewareAdmin } from "@/middlewareAdmin";
import _db from "@repo/lib/db";
import WeddingPackageModel from "@repo/lib/models/Vendor/WeddingPackage.model";
import { getRegionQuery } from "@repo/lib/utils/regionQuery";
import mongoose from "mongoose";

await _db();

// GET all pending wedding packages from all vendors
export const GET = authMiddlewareAdmin(async (req) => {
    try {
        const url = new URL(req.url);
        const regionId = url.searchParams.get('regionId');
        const regionQuery = getRegionQuery(req.user, regionId);

        const pendingPackages = await WeddingPackageModel.aggregate([
            // Filter for packages with a 'pending' status
            { $match: { status: "pending" } },
            // Populate vendor details to check region
            {
                $lookup: {
                    from: "vendors", // The actual collection name for VendorModel
                    localField: "vendorId",
                    foreignField: "_id",
                    as: "vendorDetails"
                }
            },
            // Deconstruct the vendorDetails array
            { $unwind: "$vendorDetails" },
            // Apply region filter from vendorDetails
            {
                $match: regionQuery.regionId ? { "vendorDetails.regionId": new mongoose.Types.ObjectId(regionQuery.regionId) } :
                    regionQuery.regionId?.$in ? { "vendorDetails.regionId": { $in: regionQuery.regionId.$in.map(id => new mongoose.Types.ObjectId(id)) } } : {}
            },
            // Reshape the output
            {
                $project: {
                    _id: 1,
                    name: 1,
                    totalPrice: 1,
                    discountedPrice: 1,
                    status: 1,
                    vendorName: "$vendorDetails.businessName",
                    vendorId: "$vendorDetails._id"
                }
            }
        ]);

        return Response.json(pendingPackages, { status: 200 });
    } catch (error) {
        console.error("Error fetching pending wedding packages:", error);
        return Response.json(
            { message: "Error fetching pending wedding packages", error: error.message },
            { status: 500 }
        );
    }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "wedding-approval:view");

// PATCH (update status) a wedding package by ID
export const PATCH = authMiddlewareAdmin(async (req) => {
    const { packageId, status, rejectionReason } = await req.json();

    if (!packageId || !status) {
        return Response.json(
            { message: "Package ID and status are required" },
            { status: 400 }
        );
    }

    if (!['approved', 'disapproved'].includes(status)) {
        return Response.json(
            { message: "Invalid status. Must be 'approved' or 'disapproved'" },
            { status: 400 }
        );
    }

    try {
        const updateFields = {
            status: status,
            updatedAt: new Date()
        };

        if (status === 'disapproved' && rejectionReason) {
            updateFields.rejectionReason = rejectionReason;
        } else if (status === 'approved') {
            updateFields.rejectionReason = null;
        }

        const updatedPackage = await WeddingPackageModel.findByIdAndUpdate(
            new mongoose.Types.ObjectId(packageId),
            {
                $set: updateFields
            },
            { new: true, runValidators: false }
        );

        if (!updatedPackage) {
            return Response.json({ message: "Wedding package not found" }, { status: 404 });
        }

        return Response.json({ message: "Wedding package status updated successfully", package: updatedPackage }, { status: 200 });
    } catch (error) {
        return Response.json(
            { message: "Error updating wedding package status", error: error.message },
            { status: 500 }
        );
    }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "wedding-approval:edit");
