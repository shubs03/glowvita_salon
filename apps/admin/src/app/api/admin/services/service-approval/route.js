import _db from "../../../../../../../packages/lib/src/db.js";
import ServiceModel from "../../../../../../../packages/lib/src/models/Vendor/VendorServices.model.js";
import CategoryModel from "../../../../../../../packages/lib/src/models/admin/Category.model.js";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

await _db();

// GET all services
export const GET = async () => {
  try {
    const services = await ServiceModel.find({}).populate("category", "name");
    return Response.json(services, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: "Error fetching services", error: error.message },
      { status: 500 }
    );
  }
};

// PATCH (update status) a service by ID
export const PATCH = async (req) => {
  const { id, status } = await req.json();

  if (!id || !status) {
    return Response.json(
      { message: "ID and status are required" },
      { status: 400 }
    );
  }

  if (!['pending', 'approved', 'disapproved'].includes(status)) {
    return Response.json(
      { message: "Invalid status. Must be 'pending', 'approved', or 'disapproved'" },
      { status: 400 }
    );
  }

  try {
    const updatedService = await ServiceModel.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedService) {
      return Response.json({ message: "Service not found" }, { status: 404 });
    }

    return Response.json({ message: "Service status updated successfully", service: updatedService }, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: "Error updating service status", error: error.message },
      { status: 500 }
    );
  }
};