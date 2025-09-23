import _db from "@repo/lib/db";
import ServiceModel from "@repo/lib/models/admin/Service";
import CategoryModel from "@repo/lib/models/admin/Category";
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

// POST a new service
export const POST = async (req) => {
  const body = await req.json();
  const { name, description, category , image} = body;

  if (!name || !category ) {
    return Response.json(
      { message: "Name and category are required" },
      { status: 400 }
    );
  }

  try {
    const newService = await ServiceModel.create({
      name,
      description,
      category,
      serviceImage: image
    });
    return Response.json(newService, { status: 201 });
  } catch (error) {
    return Response.json(
      { message: "Error creating service", error: error.message },
      { status: 500 }
    );
  }
};

// PUT (update) a service by ID
export const PUT = authMiddlewareAdmin(
  async (req) => {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return Response.json(
        { message: "ID is required for update" },
        { status: 400 }
      );
    }

    // Rename 'image' to 'serviceImage' if it exists in updateData
    if (updateData.image !== undefined) {
      updateData.serviceImage = updateData.image;
      delete updateData.image;
    }

    try {
      const updatedService = await ServiceModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      if (!updatedService) {
        return Response.json({ message: "Service not found" }, { status: 404 });
      }
      return Response.json(updatedService, { status: 200 });
    } catch (error) {
      return Response.json(
        { message: "Error updating service", error: error.message },
        { status: 500 }
      );
    }
  },
  ["superadmin"]
);

// DELETE a service by ID
export const DELETE = authMiddlewareAdmin(
  async (req) => {
    const { id } = await req.json();

    if (!id) {
      return Response.json(
        { message: "ID is required for deletion" },
        { status: 400 }
      );
    }

    try {
      const deletedService = await ServiceModel.findByIdAndDelete(id);
      if (!deletedService) {
        return Response.json({ message: "Service not found" }, { status: 404 });
      }
      return Response.json(
        { message: "Service deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      return Response.json(
        { message: "Error deleting service", error: error.message },
        { status: 500 }
      );
    }
  },
  ["superadmin"]
);
