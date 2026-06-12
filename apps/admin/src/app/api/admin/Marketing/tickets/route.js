import { NextResponse } from "next/server";
import _db from "@repo/lib/db";
import MarketingTicket from "@repo/lib/models/Marketing/MarketingTicket.model";
import MarketingPackage from "@repo/lib/models/Marketing/MarketingPackage.model";
import MarketingAgent from "@repo/lib/models/Marketing/MarketingAgent.model";
import { authMiddlewareAdmin } from "@/middlewareAdmin";

await _db();

// GET all marketing tickets
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    const tickets = await MarketingTicket.find({})
      .populate('packageId', 'name price')
      .populate('agentId', 'name email phone')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: tickets }, { status: 200 });
  } catch (error) {
    console.error("Error fetching marketing tickets:", error);
    return NextResponse.json({ success: false, message: "Error fetching tickets" }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "marketing:view");

// PUT: Update ticket status, assign agent, or update notes
export const PUT = authMiddlewareAdmin(async (req) => {
  try {
    const body = await req.json();
    const { id, status, agentId, adminNotes } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Ticket ID is required" }, { status: 400 });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (agentId !== undefined) updateData.agentId = agentId || null;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const updatedTicket = await MarketingTicket.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    .populate('packageId', 'name price')
    .populate('agentId', 'name email phone');

    if (!updatedTicket) {
      return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Ticket updated successfully", data: updatedTicket });
  } catch (error) {
    console.error("Error updating marketing ticket:", error);
    return NextResponse.json({ success: false, message: "Error updating ticket" }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "marketing:edit");
