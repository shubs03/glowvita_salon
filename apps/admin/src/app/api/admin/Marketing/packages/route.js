import { NextResponse } from "next/server";
import _db from "@repo/lib/db";
import MarketingPackage from "@repo/lib/models/Marketing/MarketingPackage.model";
import { authMiddlewareAdmin } from "@/middlewareAdmin";

await _db();

// GET all packages
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    const packages = await MarketingPackage.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: packages }, { status: 200 });
  } catch (error) {
    console.error("Error fetching marketing packages:", error);
    return NextResponse.json({ success: false, message: "Error fetching packages" }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "marketing:view");

// POST a new package
export const POST = authMiddlewareAdmin(async (req) => {
  try {
    const body = await req.json();
    const { name, price, description, features, isActive } = body;
    if (!name || price === undefined) {
      return NextResponse.json({ success: false, message: "Name and Price are required" }, { status: 400 });
    }

    const newPackage = await MarketingPackage.create({
      name,
      price,
      description,
      features: features || [],
      isActive: isActive !== undefined ? isActive : true
    });

    return NextResponse.json({ success: true, message: "Package created successfully", data: newPackage }, { status: 201 });
  } catch (error) {
    console.error("Error creating marketing package:", error);
    return NextResponse.json({ success: false, message: "Error creating package" }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "marketing:edit");

// PUT update a package
export const PUT = authMiddlewareAdmin(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json();
    
    if (!id) {
      return NextResponse.json({ success: false, message: "Package ID is required" }, { status: 400 });
    }

    const updated = await MarketingPackage.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Package updated successfully", data: updated });
  } catch (error) {
    console.error("Error updating marketing package:", error);
    return NextResponse.json({ success: false, message: "Error updating package" }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "marketing:edit");

// DELETE a package
export const DELETE = authMiddlewareAdmin(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, message: "Package ID is required" }, { status: 400 });
    }

    const deleted = await MarketingPackage.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Package deleted successfully" });
  } catch (error) {
    console.error("Error deleting marketing package:", error);
    return NextResponse.json({ success: false, message: "Error deleting package" }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "marketing:delete");
