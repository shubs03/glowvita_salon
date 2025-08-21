
import _db from "@repo/lib/db";
import SuperDataModel from "../../../../../../../packages/lib/src/models/admin/SuperData.model.js";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

await _db();

// GET all items
export const GET = authMiddlewareAdmin(
  async (req) => {
    try {
      const items = await SuperDataModel.find({});
      return Response.json(items, { status: 200 });
    } catch (error) {
      return Response.json({ message: "Error fetching data", error }, { status: 500 });
    }
  },
  ["superadmin", "admin"] 
);

// POST a new item
export const POST = authMiddlewareAdmin(
  async (req) => {
    const body = await req.json();
    const { name, description, type, parentId, countryId, stateId } = body;

    if (!name || !type) {
      return Response.json({ message: "Name and type are required" }, { status: 400 });
    }

    try {
      const newItem = await SuperDataModel.create({
        name,
        description,
        type,
        parentId,
        countryId,
        stateId
      });
      return Response.json(newItem, { status: 201 });
    } catch (error) {
      return Response.json({ message: "Error creating item", error }, { status: 500 });
    }
  },
  ["superadmin"]
);

// PUT (update) an item by ID
export const PUT = authMiddlewareAdmin(
  async (req) => {
    const { id, ...updateData } = await req.json();

    if (!id) {
      return Response.json({ message: "ID is required for update" }, { status: 400 });
    }

    try {
      const updatedItem = await SuperDataModel.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedItem) {
        return Response.json({ message: "Item not found" }, { status: 404 });
      }
      return Response.json(updatedItem, { status: 200 });
    } catch (error) {
      return Response.json({ message: "Error updating item", error }, { status: 500 });
    }
  },
  ["superadmin"]
);

// DELETE an item by ID
export const DELETE = authMiddlewareAdmin(
  async (req) => {
    const { id } = await req.json();

    if (!id) {
      return Response.json({ message: "ID is required for deletion" }, { status: 400 });
    }

    try {
      const deletedItem = await SuperDataModel.findByIdAndDelete(id);
      if (!deletedItem) {
        return Response.json({ message: "Item not found" }, { status: 404 });
      }
      return Response.json({ message: "Item deleted successfully" }, { status: 200 });
    } catch (error) {
      return Response.json({ message: "Error deleting item", error }, { status: 500 });
    }
  },
  ["superadmin"]
);
