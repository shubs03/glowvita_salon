import { NextResponse } from "next/server";
import _db from "@repo/lib/db";
import UserModel from "@repo/lib/models/user";
import AppointmentModel from "@repo/lib/models/Appointment/Appointment.model";
import ClientModel from "@repo/lib/models/Vendor/Client.model";
import VendorModel from "@repo/lib/models/Vendor/Vendor.model";
import mongoose from "mongoose";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

// Initialize database connection
const initDb = async () => {
  try {
    await _db();
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to database");
  }
};

// GET all users (read-only)
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    await initDb(); // Initialize DB connection
    
    // Get query parameters
    const url = new URL(req.url);
    const vendorId = url.searchParams.get('vendorId');
    const limit = parseInt(url.searchParams.get('limit')) || 100;
    const page = parseInt(url.searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;
    
    let users = [];
    let total = 0;
    
    if (vendorId) {
      // Find appointments for this vendor and get unique client IDs
      const appointments = await AppointmentModel.find({ 
        vendorId: vendorId,
        client: { $exists: true, $ne: null }
      }).select('client').lean();
      
      // Get unique client IDs from appointments
      const clientIds = [...new Set(appointments
        .filter(app => app.client)
        .map(app => app.client.toString())
      )];
      
      // Find users whose IDs match these client IDs
      if (clientIds.length > 0) {
        const query = { _id: { $in: clientIds } };
        users = await UserModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('firstName lastName emailAddress mobileNo createdAt')
          .lean();
        
        total = await UserModel.countDocuments(query);
      }
    } else {
      // If no vendorId specified, return all users with additional booking data
      users = await UserModel.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('firstName lastName emailAddress mobileNo createdAt')
        .lean();
      
      total = await UserModel.countDocuments({});
      
      // Add booking data for each user
      if (users.length > 0) {
        const userIds = users.map(user => user._id.toString());
        
        // Get appointment data for these users
        const appointmentData = await AppointmentModel.aggregate([
          { $match: { client: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) } } },
          {
            $group: {
              _id: "$client",
              totalBookings: { $sum: 1 },
              totalSpent: { $sum: "$totalAmount" },
              vendorIds: { $addToSet: "$vendorId" }
            }
          }
        ]);
        
        // Get vendor names
        const vendorIds = [...new Set(appointmentData.flatMap(data => data.vendorIds))];
        const vendors = await VendorModel.find({ _id: { $in: vendorIds } })
          .select('businessName')
          .lean();
        
        const vendorMap = {};
        vendors.forEach(vendor => {
          vendorMap[vendor._id.toString()] = vendor.businessName;
        });
        
        // Create a map for appointment data
        const appointmentMap = {};
        appointmentData.forEach(data => {
          // Convert ObjectId to string for mapping
          const clientId = data._id.toString();
          appointmentMap[clientId] = {
            totalBookings: data.totalBookings,
            totalSpent: data.totalSpent,
            vendors: data.vendorIds.map(id => vendorMap[id.toString()] || 'Unknown Vendor')
          };
        });
        
        // Add appointment data to users
        users = users.map(user => ({
          ...user,
          totalBookings: appointmentMap[user._id.toString()]?.totalBookings || 0,
          totalSpent: appointmentMap[user._id.toString()]?.totalSpent || 0,
          vendors: appointmentMap[user._id.toString()]?.vendors || []
        }));
      }
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
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);

// POST, PUT, DELETE methods are not implemented for read-only access
export const POST = () => NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 });
export const PUT = () => NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 });
export const DELETE = () => NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 });