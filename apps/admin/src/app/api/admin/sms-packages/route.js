import { NextResponse } from "next/server";
import _db from "../../../../../../../packages/lib/src/db.js";
import SmsPackage from "../../../../../../../packages/lib/src/models/Marketing/SmsPackage.model.js";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

await _db();

// GET all SMS packages
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    const packages = await SmsPackage.find({}).sort({ createdAt: -1 });
    return NextResponse.json(packages, { status: 200 });
  } catch (error) {
    console.error("Error fetching SMS packages:", error);
    return NextResponse.json(
      { message: "Error fetching SMS packages", error: error.message },
      { status: 500 }
    );
  }
}, ["superadmin", "admin"]);

// POST a new SMS package
export const POST = authMiddlewareAdmin(async (req) => {
  try {
    const body = await req.json();
    
    // Validate required fields
    const { name, smsCount, price, description, validityDays } = body;
    if (!name || !smsCount || !price || !description || !validityDays) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new package
    const newPackage = new SmsPackage({
      name,
      smsCount,
      price,
      description,
      validityDays,
      isPopular: body.isPopular || false,
      features: body.features || [],
      status: body.status || "active"
    });

    await newPackage.save();
    
    return NextResponse.json(
      { message: "SMS package created successfully", data: newPackage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating SMS package:", error);
    return NextResponse.json(
      { message: "Error creating SMS package", error: error.message },
      { status: 500 }
    );
  }
}, ["superadmin", "admin"]);

// PUT update an SMS package
export const PUT = authMiddlewareAdmin(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { message: "Package ID is required" },
        { status: 400 }
      );
    }

    const updatedPackage = await SmsPackage.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedPackage) {
      return NextResponse.json(
        { message: "SMS package not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "SMS package updated successfully",
      data: updatedPackage
    });
  } catch (error) {
    console.error("Error updating SMS package:", error);
    return NextResponse.json(
      { message: "Error updating SMS package", error: error.message },
      { status: 500 }
    );
  }
}, ["superadmin", "admin"]);

// DELETE an SMS package
export const DELETE = authMiddlewareAdmin(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: "Package ID is required" },
        { status: 400 }
      );
    }

    const deletedPackage = await SmsPackage.findByIdAndDelete(id);

    if (!deletedPackage) {
      return NextResponse.json(
        { message: "SMS package not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "SMS package deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting SMS package:", error);
    return NextResponse.json(
      { message: "Error deleting SMS package", error: error.message },
      { status: 500 }
    );
  }
}, ["superadmin", "admin"]);
