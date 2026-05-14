
import _db from "@repo/lib/db";
import SuperDataModel from "@repo/lib/models/admin/SuperData";
import { authMiddlewareAdmin } from "../../../../../middlewareAdmin.js";

await _db();

const TYPE = "expenseType";

// GET all expense types
export const GET = async (req) => {
  try {
    const items = await SuperDataModel.find({ type: TYPE }).sort({ orderIndex: 1, createdAt: 1 });
    return Response.json(items, { status: 200 });
  } catch (error) {
    return Response.json({ message: "Error fetching expense types", error }, { status: 500 });
  }
};

// POST a new expense type
export const POST = authMiddlewareAdmin(async (req) => {
  const body = await req.json();
  const { name, description } = body;

  if (!name) {
    return Response.json({ message: "Name is required" }, { status: 400 });
  }

  try {
    const lastItem = await SuperDataModel.findOne({ type: TYPE }).sort({ orderIndex: -1 });
    const orderIndex = lastItem ? lastItem.orderIndex + 1 : 0;

    const newItem = await SuperDataModel.create({
      name,
      description,
      type: TYPE,
      orderIndex,
    });

    return Response.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error creating expense type:", error);
    return Response.json({ message: "Error creating expense type", error }, { status: 500 });
  }
}, ["SUPER_ADMIN"], "superdata:edit");

// PUT (update) an expense type by ID
export const PUT = authMiddlewareAdmin(async (req) => {
  const body = await req.json();
  const { id, action, newIndex, ...updateData } = body;

  if (!id) {
    return Response.json({ message: "ID is required for update" }, { status: 400 });
  }

  try {
    if (action === "move") {
      const currentItem = await SuperDataModel.findOne({ _id: id, type: TYPE });
      if (!currentItem) {
        return Response.json({ message: "Expense type not found" }, { status: 404 });
      }

      const { orderIndex: oldIndex } = currentItem;

      const itemsToUpdate = await SuperDataModel.find({ type: TYPE }).sort({ orderIndex: 1 });

      if (newIndex < 0 || newIndex >= itemsToUpdate.length) {
        return Response.json({ message: "Invalid index" }, { status: 400 });
      }

      const targetItem = itemsToUpdate[newIndex];
      if (targetItem) {
        await SuperDataModel.findByIdAndUpdate(targetItem._id, { orderIndex: oldIndex });
        await SuperDataModel.findByIdAndUpdate(id, { orderIndex: newIndex });
      }

      return Response.json({ message: "Expense type moved successfully" }, { status: 200 });
    }

    // Ensure type cannot be changed via this endpoint
    delete updateData.type;

    const updatedItem = await SuperDataModel.findOneAndUpdate(
      { _id: id, type: TYPE },
      updateData,
      { new: true }
    );

    if (!updatedItem) {
      return Response.json({ message: "Expense type not found" }, { status: 404 });
    }

    return Response.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error("Error updating expense type:", error);
    return Response.json({ message: "Error updating expense type", error: error.message }, { status: 500 });
  }
}, ["SUPER_ADMIN"], "superdata:edit");

// DELETE an expense type by ID
export const DELETE = authMiddlewareAdmin(async (req) => {
  const { id } = await req.json();

  if (!id) {
    return Response.json({ message: "ID is required for deletion" }, { status: 400 });
  }

  try {
    const deletedItem = await SuperDataModel.findOneAndDelete({ _id: id, type: TYPE });
    if (!deletedItem) {
      return Response.json({ message: "Expense type not found" }, { status: 404 });
    }
    return Response.json({ message: "Expense type deleted successfully" }, { status: 200 });
  } catch (error) {
    return Response.json({ message: "Error deleting expense type", error }, { status: 500 });
  }
}, ["SUPER_ADMIN"], "superdata:delete");
