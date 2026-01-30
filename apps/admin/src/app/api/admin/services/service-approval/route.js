import { authMiddlewareAdmin } from "@/middlewareAdmin";
import _db from "@repo/lib/db";
import VendorServicesModel from "@repo/lib/models/Vendor/VendorServices.model";
import { getRegionQuery } from "@repo/lib/utils/regionQuery";
import mongoose from "mongoose";

await _db();


// GET all vendor services (approved and disapproved) from all vendors
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    const url = new URL(req.url);
    const regionId = url.searchParams.get('regionId');
    const statusFilter = url.searchParams.get('status'); // Optional: 'approved', 'disapproved', or 'all'
    const regionQuery = getRegionQuery(req.user, regionId);

    const matchStage = {};

    // Filter by status if provided, otherwise show approved and disapproved (not pending)
    if (statusFilter && statusFilter !== 'all') {
      matchStage["services.status"] = statusFilter;
    } else {
      matchStage["services.status"] = { $in: ["approved", "disapproved"] };
    }

    const vendorServices = await VendorServicesModel.aggregate([
      // Deconstruct the services array
      { $unwind: "$services" },
      // Filter for services with approved or disapproved status
      { $match: matchStage },
      // Populate vendor details to check region
      {
        $lookup: {
          from: "vendors", // The actual collection name for VendorModel
          localField: "vendor",
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
      // Lookup category details
      {
        $lookup: {
          from: "categories",
          localField: "services.category",
          foreignField: "_id",
          as: "categoryDetails"
        }
      },
      // Reshape the output
      {
        $project: {
          _id: "$services._id", // Service ID
          name: "$services.name",
          category: { $arrayElemAt: ["$categoryDetails.name", 0] },
          categoryId: "$services.category",
          price: "$services.price",
          discountedPrice: "$services.discountedPrice",
          duration: "$services.duration",
          status: "$services.status",
          description: "$services.description",
          serviceImage: "$services.image",
          onlineBooking: "$services.onlineBooking",
          isActive: "$services.isActive",
          vendorName: "$vendorDetails.businessName",
          vendorId: "$vendorDetails._id",
          createdAt: "$services.createdAt",
          updatedAt: "$services.updatedAt"
        }
      },
      // Sort by creation date (newest first)
      { $sort: { createdAt: -1 } }
    ]);

    return Response.json(vendorServices, { status: 200 });
  } catch (error) {
    console.error("Error fetching vendor services:", error);
    return Response.json(
      { message: "Error fetching vendor services", error: error.message },
      { status: 500 }
    );
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);

// PATCH (update status) a service by ID
export const PATCH = authMiddlewareAdmin(async (req) => {
  const body = await req.json();
  const { serviceId, status, rejectionReason } = body;
  console.log("Service Approval PATCH - Payload:", { serviceId, status, rejectionReason });

  if (!serviceId || !status) {
    return Response.json(
      { message: "Service ID and status are required" },
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
    // Use raw collection update to bypass any Mongoose schema sync issues
    await VendorServicesModel.collection.updateOne(
      { "services._id": new mongoose.Types.ObjectId(serviceId) },
      {
        $set: {
          "services.$.status": status,
          "services.$.rejectionReason": status === 'disapproved' ? rejectionReason : null,
          "services.$.updatedAt": new Date()
        }
      }
    );

    // Fetch the updated document to confirm and return
    const updatedVendorService = await VendorServicesModel.findOne(
      { "services._id": new mongoose.Types.ObjectId(serviceId) }
    );

    if (!updatedVendorService) {
      return Response.json({ message: "Service not found after update" }, { status: 404 });
    }

    const updatedService = updatedVendorService.services.find(s => s._id.toString() === serviceId);
    console.log("Service Approval PATCH - Update Result Service:", {
      status: updatedService?.status,
      rejectionReason: updatedService?.rejectionReason
    });

    return Response.json({ message: "Service status updated successfully", service: updatedService }, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: "Error updating service status", error: error.message },
      { status: 500 }
    );
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);

// PUT (update onlineBooking) for a vendor service
export const PUT = authMiddlewareAdmin(async (req) => {
  const body = await req.json();
  const { serviceId, onlineBooking } = body;

  console.log("PUT /service-approval - Update onlineBooking:", { serviceId, onlineBooking });

  if (!serviceId || typeof onlineBooking !== 'boolean') {
    return Response.json(
      { message: "Service ID and onlineBooking status are required" },
      { status: 400 }
    );
  }

  try {
    const result = await VendorServicesModel.updateOne(
      { "services._id": new mongoose.Types.ObjectId(serviceId) },
      {
        $set: {
          "services.$.onlineBooking": onlineBooking,
          "services.$.isActive": onlineBooking
        }
      }
    );

    if (result.matchedCount === 0) {
      return Response.json({ message: "Service not found" }, { status: 404 });
    }

    console.log(`Updated service ${serviceId} onlineBooking to ${onlineBooking}`);

    return Response.json({
      message: "Service online booking status updated successfully",
      // We don't return the full service object here to save a query, 
      // but the frontend refreshes anyway. If needed we can fetch it.
      service: { _id: serviceId, onlineBooking }
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating service online booking status:", error);
    return Response.json(
      { message: "Error updating service online booking status", error: error.message },
      { status: 500 }
    );
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);
