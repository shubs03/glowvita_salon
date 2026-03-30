import { NextResponse } from "next/server";
import _db from "@repo/lib/db";
import UserModel from "@repo/lib/models/user";
import AppointmentModel from "@repo/lib/models/Appointment/Appointment.model";
import VendorModel from "@repo/lib/models/Vendor/Vendor.model";
import mongoose from "mongoose";
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

// GET all users (read-only), with optional region filtering
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    await initDb();

    const url = new URL(req.url);
    const vendorId = url.searchParams.get('vendorId');
    const regionId = url.searchParams.get('regionId');
    const limit = parseInt(url.searchParams.get('limit')) || 100;
    const page = parseInt(url.searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    // ── Build the base user query ──────────────────────────────────────────────
    // Use getRegionQuery helper for cross-role consistency (Super vs Regional Admin)
    const userQuery = getRegionQuery(req.user, regionId && regionId !== 'all' ? regionId : null);

    // Debug logging to troubleshoot "empty" results
    console.log('=== ADMIN USERS API ===');
    console.log('Param regionId:', regionId);
    console.log('Final userQuery:', JSON.stringify(userQuery));

    // ── Optional: also filter by vendorId (show only users who booked that vendor)
    if (vendorId) {
      const appointments = await AppointmentModel.find({
        vendorId: vendorId,
        client: { $exists: true, $ne: null }
      }).select('client').lean();

      const clientIds = [...new Set(
        appointments.filter(a => a.client).map(a => a.client.toString())
      )];

      // Intersect with region filter (if any)
      if (clientIds.length > 0) {
        userQuery._id = { $in: clientIds.map(id => new mongoose.Types.ObjectId(id)) };
      } else {
        // No appointments for this vendor → no users
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 }
        }, { status: 200 });
      }
    }

    // ── Fetch users ────────────────────────────────────────────────────────────
    const [users, total] = await Promise.all([
      UserModel.find(userQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('firstName lastName emailAddress mobileNo createdAt regionId')
        .lean(),
      UserModel.countDocuments(userQuery)
    ]);

    console.log(`Found ${users.length} users for query. Total in DB matching query: ${total}`);

    // If query returned nothing but regionId was specified, log a sample user for debugging
    if (users.length === 0 && userQuery.regionId) {
      const sample = await UserModel.findOne({}).select('regionId firstName').lean();
      console.log('Sample user in DB:', sample ? { ...sample, regionId: sample.regionId?.toString() } : 'No users at all');
      if (sample && sample.regionId) {
        console.log(`Param ID (${regionId}) vs Sample ID (${sample.regionId.toString()}): ${regionId === sample.regionId.toString() ? 'MATCH' : 'MISMATCH'}`);
      }
    }

    // ── Enrich with booking data ───────────────────────────────────────────────
    if (users.length > 0) {
      const userIds = users.map(u => u._id);

      const appointmentData = await AppointmentModel.aggregate([
        { $match: { client: { $in: userIds } } },
        {
          $group: {
            _id: "$client",
            totalBookings: { $sum: 1 },
            totalSpent: { $sum: "$totalAmount" },
            vendorIds: { $addToSet: "$vendorId" }
          }
        }
      ]);

      // Fetch vendor names
      const allVendorIds = [...new Set(appointmentData.flatMap(d => d.vendorIds).filter(Boolean))];
      const vendors = await VendorModel.find({ _id: { $in: allVendorIds } })
        .select('businessName')
        .lean();

      const vendorMap = {};
      vendors.forEach(v => { vendorMap[v._id.toString()] = v.businessName; });

      const appointmentMap = {};
      appointmentData.forEach(d => {
        appointmentMap[d._id.toString()] = {
          totalBookings: d.totalBookings,
          totalSpent: d.totalSpent,
          vendors: d.vendorIds.map(id => id ? (vendorMap[id.toString()] || 'Unknown Vendor') : 'N/A')
        };
      });

      // Merge back into users array
      users.forEach(user => {
        const key = user._id.toString();
        user.totalBookings = appointmentMap[key]?.totalBookings || 0;
        user.totalSpent = appointmentMap[key]?.totalSpent || 0;
        user.vendors = appointmentMap[key]?.vendors || [];
        user.status = 'Active'; // For UI consistency
      });
    }

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({
      success: false,
      message: "Error fetching users",
      error: error.message
    }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "customers:view");

// POST, PUT, DELETE methods are not implemented for read-only access
export const POST = () => NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 });
export const PUT = () => NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 });
export const DELETE = () => NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 });