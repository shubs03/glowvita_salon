import _db from "@repo/lib/db";
import VendorServicesModel from "@repo/lib/models/Vendor/VendorServices.model";

await _db();

// GET all pending services from all vendors
export const GET = async () => {
  try {
    const pendingServices = await VendorServicesModel.aggregate([
      // Deconstruct the services array
      { $unwind: "$services" },
      // Filter for services with a 'pending' status
      { $match: { "services.status": "pending" } },
      // Populate vendor details
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
      // Reshape the output
      {
        $project: {
          _id: "$services._id", // Service ID
          serviceName: "$services.name",
          category: "$services.category",
          price: "$services.price",
          status: "$services.status",
          description: "$services.description",
          vendorName: "$vendorDetails.businessName",
          vendorId: "$vendorDetails._id"
        }
      }
    ]);
    
    return Response.json(pendingServices, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: "Error fetching pending services", error: error.message },
      { status: 500 }
    );
  }
};

// PATCH (update status) a service by ID
export const PATCH = async (req) => {
  const { serviceId, status } = await req.json();

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
    const updatedVendorService = await VendorServicesModel.findOneAndUpdate(
      { "services._id": serviceId },
      { 
        $set: { 
          "services.$.status": status,
          "services.$.updatedAt": new Date() 
        } 
      },
      { new: true }
    );

    if (!updatedVendorService) {
      return Response.json({ message: "Service not found" }, { status: 404 });
    }
    
    const updatedService = updatedVendorService.services.find(s => s._id.toString() === serviceId);

    return Response.json({ message: "Service status updated successfully", service: updatedService }, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: "Error updating service status", error: error.message },
      { status: 500 }
    );
  }
};
