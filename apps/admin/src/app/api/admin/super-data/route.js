
import _db from "@repo/lib/db";
import SuperDataModel from "@repo/lib/models/admin/SuperData";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

await _db();

// GET all items
export const GET = authMiddlewareAdmin(async (req) => {
    try {
      const items = await SuperDataModel.find({}).sort({ orderIndex: 1, createdAt: 1 });
      return Response.json(items, { status: 200 });
    } catch (error) {
      return Response.json({ message: "Error fetching data", error }, { status: 500 });
    }
}, ["SUPER_ADMIN"], "superdata:view");

// POST a new item
export const POST = authMiddlewareAdmin(async (req) => {
    const body = await req.json();
    const { name, description, type, parentId, countryId, stateId, doctorType } = body;

    if (!name || !type) {
      return Response.json({ message: "Name and type are required" }, { status: 400 });
    }

    try {
      // Find the highest orderIndex for this type (and parentId if applicable)
      const lastItem = await SuperDataModel.findOne({ type, parentId: parentId || null }).sort({ orderIndex: -1 });
      const orderIndex = lastItem ? lastItem.orderIndex + 1 : 0;

      const newItem = await SuperDataModel.create({
        name,
        description,
        type,
        parentId,
        countryId,
        stateId,
        doctorType,
        orderIndex
      });
      return Response.json(newItem, { status: 201 });
    } catch (error) {
       console.error("Error creating SuperData item:", error);
      return Response.json({ message: "Error creating item", error }, { status: 500 });
    }
  }, ["SUPER_ADMIN"], "superdata:edit");

// PUT (update) an item by ID
export const PUT = authMiddlewareAdmin(async (req) => {
    const body = await req.json();
    const { id, action, newIndex, ...updateData } = body;

    if (!id) {
      return Response.json({ message: "ID is required for update" }, { status: 400 });
    }

    try {
      if (action === 'move') {
          const currentItem = await SuperDataModel.findById(id);
          if (!currentItem) return Response.json({ message: "Item not found" }, { status: 404 });

          const { type, parentId, orderIndex: oldIndex } = currentItem;
          
          // Simple swap or adjustment logic
          // Find the item currently at newIndex for this type/parent
          const itemsToUpdate = await SuperDataModel.find({ type, parentId: parentId || null }).sort({ orderIndex: 1 });
          
          if (newIndex < 0 || newIndex >= itemsToUpdate.length) {
              return Response.json({ message: "Invalid index" }, { status: 400 });
          }

          const targetItem = itemsToUpdate[newIndex];
          if (targetItem) {
              // Swap indices
              await SuperDataModel.findByIdAndUpdate(targetItem._id, { orderIndex: oldIndex });
              await SuperDataModel.findByIdAndUpdate(id, { orderIndex: newIndex });
          }

          return Response.json({ message: "Item moved successfully" }, { status: 200 });
      }

      const updatedItem = await SuperDataModel.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedItem) {
        return Response.json({ message: "Item not found" }, { status: 404 });
      }
      return Response.json(updatedItem, { status: 200 });
    } catch (error) {
      console.error("Error updating SuperData item:", error);
      return Response.json({ message: "Error updating item", error: error.message }, { status: 500 });
    }
  }, ["SUPER_ADMIN"], "superdata:edit");

// DELETE an item by ID
export const DELETE = authMiddlewareAdmin(async (req) => {
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
  }, ["SUPER_ADMIN"], "superdata:delete");
