import { NextResponse } from 'next/server';
import _db from '../../../../../../../../packages/lib/src/db.js';
import MarketingTicket from '../../../../../../../../packages/lib/src/models/Marketing/MarketingTicket.model.js';
import Vendor from '../../../../../../../../packages/lib/src/models/Vendor/Vendor.model.js';
import MarketingPackage from '../../../../../../../../packages/lib/src/models/Marketing/MarketingPackage.model.js';
import MarketingAgent from '../../../../../../../../packages/lib/src/models/Marketing/MarketingAgent.model.js';
import { authMiddlewareCrm } from '../../../../../middlewareCrm.js';

// GET: Fetch tickets for the logged-in vendor
export const GET = authMiddlewareCrm(async (req) => {
  try {
    await _db();
    const vendorId = req.user?.userId;
    if (!vendorId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const tickets = await MarketingTicket.find({ vendorId })
      .populate('packageId', 'name price')
      .populate('agentId', 'name email phone')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: tickets }, { status: 200 });
  } catch (error) {
    console.error("CRM Get tickets error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch tickets" }, { status: 500 });
  }
});

// POST: Create a new marketing ticket
export const POST = authMiddlewareCrm(async (req) => {
  try {
    await _db();
    const vendorId = req.user?.userId;
    if (!vendorId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { packageId, agentId, subject, description } = body;

    if (!packageId || !subject || !description) {
      return NextResponse.json({ success: false, message: "Package, Subject, and Description are required" }, { status: 400 });
    }

    // Fetch vendor details from database
    const vendorDoc = await Vendor.findById(vendorId);
    if (!vendorDoc) {
      return NextResponse.json({ success: false, message: "Vendor profile not found" }, { status: 404 });
    }

    const salonName = vendorDoc.businessName;
    const contactName = `${vendorDoc.firstName} ${vendorDoc.lastName}`.trim();
    const email = vendorDoc.email;
    const phone = vendorDoc.phone;

    const newTicket = await MarketingTicket.create({
      vendorId,
      salonName,
      contactName,
      email,
      phone,
      packageId,
      agentId: agentId || null,
      subject,
      description,
      status: "Pending"
    });

    // Populate the newly created ticket's package and agent details
    const populatedTicket = await MarketingTicket.findById(newTicket._id)
      .populate('packageId', 'name price')
      .populate('agentId', 'name email phone');

    return NextResponse.json({ success: true, message: "Ticket generated successfully", data: populatedTicket }, { status: 201 });
  } catch (error) {
    console.error("CRM Create ticket error:", error);
    return NextResponse.json({ success: false, message: "Failed to submit ticket" }, { status: 500 });
  }
});
