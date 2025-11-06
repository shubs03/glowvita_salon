import _db from "@repo/lib/db";
import ServiceModel from "@repo/lib/models/admin/Service";
import CategoryModel from "@repo/lib/models/admin/Category";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";
import { uploadBase64, deleteFile } from "@repo/lib/utils/upload";

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
    let imageUrl = null;
    
    // Upload image to VPS if provided
    if (image) {
      const fileName = `service-${Date.now()}`;
      imageUrl = await uploadBase64(image, fileName);
      
      if (!imageUrl) {
        return Response.json(
          { message: "Failed to upload image" },
          { status: 500 }
        );
      }
    }
    
    const newService = await ServiceModel.create({
      name,
      description,
      category,
      serviceImage: imageUrl
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

    try {
      // Get existing service to check for old image
      const existingService = await ServiceModel.findById(id);
      if (!existingService) {
        return Response.json({ message: "Service not found" }, { status: 404 });
      }

      // Handle image upload if new image is provided
      if (updateData.image !== undefined) {
        if (updateData.image) {
          // Upload new image to VPS
          const fileName = `service-${Date.now()}`;
          const imageUrl = await uploadBase64(updateData.image, fileName);
          
          if (!imageUrl) {
            return Response.json(
              { message: "Failed to upload image" },
              { status: 500 }
            );
          }
          
          // Delete old image from VPS if it exists
          if (existingService.serviceImage) {
            await deleteFile(existingService.serviceImage);
          }
          
          updateData.serviceImage = imageUrl;
        } else {
          // If image is null/empty, remove it
          updateData.serviceImage = null;
          
          // Delete old image from VPS if it exists
          if (existingService.serviceImage) {
            await deleteFile(existingService.serviceImage);
          }
        }
        delete updateData.image;
      }

      const updatedService = await ServiceModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
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
      
      // Delete image from VPS if it exists
      if (deletedService.serviceImage) {
        await deleteFile(deletedService.serviceImage);
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
