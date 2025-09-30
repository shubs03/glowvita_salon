// app/api/geo-fences/route.js
import _db from "@repo/lib/db";
import GeoFenceModel from "@repo/lib/models/admin/GeoFence";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

await _db();

export const POST = authMiddlewareAdmin(
  async (req) => {
    const body = await req.json();
    const {
      name,
      city,
      coordinates,
      description,
      area,
    } = body;

    // 1️⃣ Validate required fields
    if (!name || !coordinates) {
      return Response.json(
        { message: "Name and coordinates are required" },
        { status: 400 }
      );
    }

    // 2️⃣ Validate coordinates structure
    if (
      !coordinates.geometry ||
      coordinates.geometry.type !== "Polygon" ||
      !Array.isArray(coordinates.geometry.coordinates) ||
      coordinates.geometry.coordinates.length === 0
    ) {
      return Response.json(
        { message: "Invalid coordinates format. Must be a valid GeoJSON Polygon" },
        { status: 400 }
      );
    }

    // 3️⃣ Generate unique fence ID
    const fenceCount = await GeoFenceModel.countDocuments();
    const fenceId = `FNC-${String(fenceCount + 1).padStart(3, "0")}`;

    // 4️⃣ Check if fence name already exists
    const existingFence = await GeoFenceModel.findOne({ name });
    if (existingFence) {
      return Response.json(
        { message: "Fence with this name already exists" },
        { status: 400 }
      );
    }

    // 5️⃣ Create geo fence
    const newGeoFence = await GeoFenceModel.create({
      fenceId,
      name,
      city: city || null,
      coordinates,
      description: description || null,
      area: area || null,
      createdBy: req.user.id, // From auth middleware
    });

    return Response.json(
      { message: "Geo fence created successfully", geoFence: newGeoFence },
      { status: 201 }
    );
  },
  ["superadmin", "admin"] // Both superadmin and admin can create fences
);

export const GET = authMiddlewareAdmin(
  async (req) => {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const city = url.searchParams.get('city');
    const isActive = url.searchParams.get('isActive');
    const search = url.searchParams.get('search');

    // Build filter object
    const filter = {};
    
    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }
    
    if (isActive !== null && isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fenceId: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalFences = await GeoFenceModel.countDocuments(filter);

    // Get fences with pagination
    const geoFences = await GeoFenceModel.find(filter)
      .populate('createdBy', 'fullName emailAddress')
      .populate('updatedBy', 'fullName emailAddress')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate pagination info
    const totalPages = Math.ceil(totalFences / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return Response.json({
      geoFences,
      pagination: {
        currentPage: page,
        totalPages,
        totalFences,
        hasNextPage,
        hasPrevPage,
        limit
      }
    });
  },
  ["superadmin", "admin", "manager"] // Multiple roles can view
);

export const PUT = authMiddlewareAdmin(
  async (req) => {
    const body = await req.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return Response.json(
        { message: "Fence ID is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Validate coordinates if being updated
    if (updateData.coordinates) {
      if (
        !updateData.coordinates.geometry ||
        updateData.coordinates.geometry.type !== "Polygon" ||
        !Array.isArray(updateData.coordinates.geometry.coordinates) ||
        updateData.coordinates.geometry.coordinates.length === 0
      ) {
        return Response.json(
          { message: "Invalid coordinates format. Must be a valid GeoJSON Polygon" },
          { status: 400 }
        );
      }
    }

    // 2️⃣ Check if fence name already exists (if name is being updated)
    if (updateData.name) {
      const existingFence = await GeoFenceModel.findOne({ 
        name: updateData.name,
        _id: { $ne: _id }
      });
      if (existingFence) {
        return Response.json(
          { message: "Fence with this name already exists" },
          { status: 400 }
        );
      }
    }

    // 3️⃣ Update the fence
    const updatedGeoFence = await GeoFenceModel.findByIdAndUpdate(
      _id,
      { 
        ...updateData, 
        updatedAt: Date.now(),
        updatedBy: req.user.id 
      },
      { new: true }
    ).populate('createdBy', 'fullName emailAddress')
     .populate('updatedBy', 'fullName emailAddress');

    if (!updatedGeoFence) {
      return Response.json(
        { message: "Geo fence not found" }, 
        { status: 404 }
      );
    }

    return Response.json({
      message: "Geo fence updated successfully",
      geoFence: updatedGeoFence
    });
  },
  ["superadmin", "admin"] // Only superadmin and admin can update
);

export const DELETE = authMiddlewareAdmin(
  async (req) => {
    const { _id } = await req.json();

    if (!_id) {
      return Response.json(
        { message: "Fence ID is required" },
        { status: 400 }
      );
    }

    const deleted = await GeoFenceModel.findByIdAndDelete(_id);

    if (!deleted) {
      return Response.json(
        { message: "Geo fence not found" }, 
        { status: 404 }
      );
    }

    return Response.json({ 
      message: "Geo fence deleted successfully",
      deletedFence: deleted
    });
  },
  ["superadmin"] // Only superadmin can delete fences
);