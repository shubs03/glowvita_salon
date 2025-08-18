
import _db from "../../../../../../../packages/lib/src/db.js";
import SpecializationModel from "../../../../../../../packages/lib/src/models/admin/SpecializationModel.js";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js ";

await _db();

// Create Specialization
export const POST = authMiddlewareAdmin(
  async (req) => {
    const body = await req.json();
    const { name, description } = body;

    // Validate required fields
    if (!name) {
      return Response.json(
        { message: "Specialization name is required" },
        { status: 400 }
      );
    }

    // Check for duplicate specialization
    const existingSpecialization = await SpecializationModel.findOne({ name });
    if (existingSpecialization) {
      return Response.json(
        { message: "Specialization already exists" },
        { status: 400 }
      );
    }

    // Create specialization
    const newSpecialization = await SpecializationModel.create({
      name,
      description: description || null,
    });

    return Response.json(
      { message: "Specialization created successfully", specialization: newSpecialization },
      { status: 201 }
    );
  },
  ["superadmin"]
);

// Get All Specializations
export const GET = authMiddlewareAdmin(
  async () => {
    const specializations = await SpecializationModel.find();
    return Response.json(specializations);
  },
  ["superadmin", "admin"]
);

// Update Specialization
export const PUT = authMiddlewareAdmin(
  async (req) => {
    const { id, ...body } = await req.json();

    // Validate name if provided
    if (body.name) {
      const existingSpecialization = await SpecializationModel.findOne({
        name: body.name,
        _id: { $ne: id },
      });
      if (existingSpecialization) {
        return Response.json(
          { message: "Specialization name already exists" },
          { status: 400 }
        );
      }
    }

    const updateData = {
      ...body,
      updatedAt: Date.now(),
    };

    const updatedSpecialization = await SpecializationModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedSpecialization) {
      return Response.json({ message: "Specialization not found" }, { status: 404 });
    }

    return Response.json(updatedSpecialization);
  },
  ["superadmin"]
);

// Delete Specialization
export const DELETE = authMiddlewareAdmin(
  async (req) => {
    const { id } = await req.json();

    const deletedSpecialization = await SpecializationModel.findByIdAndDelete(id);
    if (!deletedSpecialization) {
      return Response.json({ message: "Specialization not found" }, { status: 404 });
    }

    return Response.json({ message: "Specialization deleted successfully" });
  },
  ["superadmin"]
);
