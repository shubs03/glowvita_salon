import { NextResponse } from "next/server";
import _db from "@repo/lib/db";
import MarketingAgent from "@repo/lib/models/Marketing/MarketingAgent.model";
import { authMiddlewareAdmin } from "@/middlewareAdmin";

await _db();

// GET all agents
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    const agents = await MarketingAgent.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: agents }, { status: 200 });
  } catch (error) {
    console.error("Error fetching marketing agents:", error);
    return NextResponse.json({ success: false, message: "Error fetching agents" }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "marketing:view");

// POST a new agent
export const POST = authMiddlewareAdmin(async (req) => {
  try {
    const body = await req.json();
    const { name, email, phone, specialties, isActive } = body;
    if (!name || !email) {
      return NextResponse.json({ success: false, message: "Name and Email are required" }, { status: 400 });
    }

    const newAgent = await MarketingAgent.create({
      name,
      email,
      phone: phone || "",
      specialties: specialties || [],
      isActive: isActive !== undefined ? isActive : true
    });

    return NextResponse.json({ success: true, message: "Agent created successfully", data: newAgent }, { status: 201 });
  } catch (error) {
    console.error("Error creating marketing agent:", error);
    return NextResponse.json({ success: false, message: "Error creating agent" }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "marketing:edit");

// PUT update an agent
export const PUT = authMiddlewareAdmin(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json();
    
    if (!id) {
      return NextResponse.json({ success: false, message: "Agent ID is required" }, { status: 400 });
    }

    const updated = await MarketingAgent.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Agent updated successfully", data: updated });
  } catch (error) {
    console.error("Error updating marketing agent:", error);
    return NextResponse.json({ success: false, message: "Error updating agent" }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "marketing:edit");

// DELETE an agent
export const DELETE = authMiddlewareAdmin(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, message: "Agent ID is required" }, { status: 400 });
    }

    const deleted = await MarketingAgent.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Agent deleted successfully" });
  } catch (error) {
    console.error("Error deleting marketing agent:", error);
    return NextResponse.json({ success: false, message: "Error deleting agent" }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "marketing:delete");
