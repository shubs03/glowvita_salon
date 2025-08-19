import _db from "../../../../../../../packages/lib/src/db.js";
import CategoryModel from "../../../../../../../packages/lib/src/models/admin/Category.model.js";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

await _db();

// GET all categories
export const GET = authMiddlewareAdmin(
  async () => {
    try {
      const categories = await CategoryModel.find({});
      return Response.json(categories, { status: 200 });
    } catch (error) {
      return Response.json({ message: "Error fetching categories", error: error.message }, { status: 500 });
    }
  },
  ["superadmin", "admin"]
);

// POST a new category
export const POST = authMiddlewareAdmin(
  async (req) => {
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return Response.json({ message: "Name is required" }, { status: 400 });
    }

    try {
      const newCategory = await CategoryModel.create({ name, description });
      return Response.json(newCategory, { status: 201 });
    } catch (error) {
      return Response.json({ message: "Error creating category", error: error.message }, { status: 500 });
    }
  },
  ["superadmin"]
);

// PUT (update) a category by ID
export const PUT = authMiddlewareAdmin(
  async (req) => {
    const { id, ...updateData } = await req.json();

    if (!id) {
      return Response.json({ message: "ID is required for update" }, { status: 400 });
    }

    try {
      const updatedCategory = await CategoryModel.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedCategory) {
        return Response.json({ message: "Category not found" }, { status: 404 });
      }
      return Response.json(updatedCategory, { status: 200 });
    } catch (error) {
      return Response.json({ message: "Error updating category", error: error.message }, { status: 500 });
    }
  },
  ["superadmin"]
);

// DELETE a category by ID
export const DELETE = authMiddlewareAdmin(
  async (req) => {
    const { id } = await req.json();

    if (!id) {
      return Response.json({ message: "ID is required for deletion" }, { status: 400 });
    }

    try {
      const deletedCategory = await CategoryModel.findByIdAndDelete(id);
      if (!deletedCategory) {
        return Response.json({ message: "Category not found" }, { status: 404 });
      }
      return Response.json({ message: "Category deleted successfully" }, { status: 200 });
    } catch (error) {
      return Response.json({ message: "Error deleting category", error: error.message }, { status: 500 });
    }
  },
  ["superadmin"]
);
