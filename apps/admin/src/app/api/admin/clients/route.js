// route.js
import { NextResponse } from "next/server";
import _db from "@repo/lib/db";
import ClientModel from "@repo/lib/models/Vendor/Client.model";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";
import { getRegionQuery } from "@repo/lib/utils/regionQuery";

// Initialize database connection
const initDb = async () => {
  try {
    await _db();
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to database");
  }
};

// GET all clients (read-only)
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    await initDb(); // Initialize DB connection
    
    // Get query parameters
    const url = new URL(req.url);
    const vendorId = url.searchParams.get('vendorId');
    const regionId = url.searchParams.get('regionId');
    const limit = parseInt(url.searchParams.get('limit')) || 100;
    const page = parseInt(url.searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;
    
    // Build region query
    const regionQuery = getRegionQuery(req.user, regionId);
    
    // Build query
    let query = { ...regionQuery };
    if (vendorId) {
      query.vendorId = vendorId;
    }
    
    // Fetch clients with pagination
    const clients = await ClientModel.find(query)
      .sort({ lastVisit: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('fullName email phone lastVisit status profilePicture totalBookings totalSpent createdAt updatedAt birthdayDate gender vendorId')
      .lean();
      
    const total = await ClientModel.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ 
      success: false,
      message: "Error fetching clients", 
      error: error.message 
    }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "customers:view");

// POST, PUT, DELETE methods are not implemented for read-only access
export const POST = () => NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 });
export const PUT = () => NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 });
export const DELETE = () => NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 });