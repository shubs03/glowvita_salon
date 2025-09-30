import _db from "@repo/lib/db";
import CategoryModel from "@repo/lib/models/admin/Category";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

await _db();

// GET all categories
export const GET = async () => {
  try {
    const categories = await CategoryModel.find({});
    return Response.json(categories, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: "Error fetching categories", error: error.message },
      { status: 500 }
    );
  }
};

// POST a new category
export const POST = 
  async (req) => {
    const body = await req.json();
    const { name, description, image } = body;

    if (!name) {
      return Response.json({ message: "Name is required" }, { status: 400 });
    }

    try {
      const newCategory = await CategoryModel.create({ name, description, categoryImage: image });
      return Response.json(newCategory, { status: 201 });
    } catch (error) {
      return Response.json(
        { message: "Error creating category", error: error.message },
        { status: 500 }
      );
    }
  };

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

    // Rename 'image' to 'categoryImage' if it exists in updateData
    if (updateData.image !== undefined) {
      updateData.categoryImage = updateData.image;
      delete updateData.image;
    }

    try {
      const updatedCategory = await CategoryModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      if (!updatedCategory) {
        return Response.json(
          { message: "Category not found" },
          { status: 404 }
        );
      }
      return Response.json(updatedCategory, { status: 200 });
    } catch (error) {
      return Response.json(
        { message: "Error updating category", error: error.message },
        { status: 500 }
      );
    }
  },
  ["superadmin"]
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
  ["superadmin"]
);
