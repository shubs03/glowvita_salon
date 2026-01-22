import _db from "@repo/lib/db";
import CategoryModel from "@repo/lib/models/admin/Category";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";
import { uploadBase64, deleteFile } from "@repo/lib/utils/upload";

await _db();

// GET all categories
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    const categories = await CategoryModel.find({});
    return Response.json(categories, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: "Error fetching categories", error: error.message },
      { status: 500 }
    );
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "vendor", "staff", "doctor", "supplier"]);

// POST a new category
export const POST = authMiddlewareAdmin(
  async (req) => {
    const body = await req.json();
    const { name, description, image } = body;

    if (!name) {
      return Response.json({ message: "Name is required" }, { status: 400 });
    }

    try {
      let imageUrl = null;

      // Upload image to VPS if provided
      if (image) {
        const fileName = `category-${Date.now()}`;
        imageUrl = await uploadBase64(image, fileName);

        if (!imageUrl) {
          return Response.json(
            { message: "Failed to upload image" },
            { status: 500 }
          );
        }
      }

      const newCategory = await CategoryModel.create({
        name,
        description,
        categoryImage: imageUrl
      });
      return Response.json(newCategory, { status: 201 });
    } catch (error) {
      return Response.json(
        { message: "Error creating category", error: error.message },
        { status: 500 }
      );
    }
  }, ["SUPER_ADMIN", "REGIONAL_ADMIN", "vendor", "staff", "doctor", "supplier"]);

// PUT (update) a category by ID
export const PUT = authMiddlewareAdmin(
  async (req) => {
    const { id, ...updateData } = await req.json();

    if (!id) {
      return Response.json(
        { message: "ID is required for update" },
        { status: 400 }
      );
    }

    try {
      // Get existing category to check for old image
      const existingCategory = await CategoryModel.findById(id);
      if (!existingCategory) {
        return Response.json(
          { message: "Category not found" },
          { status: 404 }
        );
      }

      // Handle image upload if new image is provided
      if (updateData.image !== undefined) {
        if (updateData.image) {
          // Upload new image to VPS
          const fileName = `category-${Date.now()}`;
          const imageUrl = await uploadBase64(updateData.image, fileName);

          if (!imageUrl) {
            return Response.json(
              { message: "Failed to upload image" },
              { status: 500 }
            );
          }

          // Delete old image from VPS if it exists
          if (existingCategory.categoryImage) {
            await deleteFile(existingCategory.categoryImage);
          }

          updateData.categoryImage = imageUrl;
        } else {
          // If image is null/empty, remove it
          updateData.categoryImage = null;

          // Delete old image from VPS if it exists
          if (existingCategory.categoryImage) {
            await deleteFile(existingCategory.categoryImage);
          }
        }
        delete updateData.image;
      }

      const updatedCategory = await CategoryModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      return Response.json(updatedCategory, { status: 200 });
    } catch (error) {
      return Response.json(
        { message: "Error updating category", error: error.message },
        { status: 500 }
      );
    }
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN"]
);

// DELETE a category by ID
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
      const deletedCategory = await CategoryModel.findByIdAndDelete(id);
      if (!deletedCategory) {
        return Response.json(
          { message: "Category not found" },
          { status: 404 }
        );
      }

      // Delete image from VPS if it exists
      if (deletedCategory.categoryImage) {
        await deleteFile(deletedCategory.categoryImage);
      }

      return Response.json(
        { message: "Category deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      return Response.json(
        { message: "Error deleting category", error: error.message },
        { status: 500 }
      );
    }
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN"]
);
