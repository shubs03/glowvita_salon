
// crm/api/notifications/route.js

import _db from "../../../../../../../packages/lib/src/db.js";
import VendorNotificationsModel from "../../../../../../../packages/lib/src/models/Vendor/VendorNotification.model.js";
import { authMiddlewareCrm } from "../../../../middlewareCrm.js";

await _db();

// POST: Create or update a VendorNotifications document, adding notifications to the array
export const POST = authMiddlewareCrm(async (req) => {
  const vendor = req.user;
  const body = await req.json();
  const { title, channels, content, targetType, targets } = body;

  const vendorId = vendor._id.toString();

  // 1️⃣ Validate required fields
  if (!vendorId || !title || !channels || !Array.isArray(channels) || !content || !targetType) {
    return Response.json(
      { message: "Vendor ID, title, channels array, content, and targetType are required" },
      { status: 400 }
    );
  }

  // 2️⃣ Validate target if specific
  if (targetType === 'specific_clients' && (!targets || !Array.isArray(targets))) {
    return Response.json(
      { message: "Targets array is required for specific_clients" },
      { status: 400 }
    );
  }

  const notificationToInsert = { 
    title, 
    channels, 
    content, 
    targetType, 
    targets: targetType === 'specific_clients' ? targets : [],
    date: new Date(),
    status: 'Sent', 
    createdAt: new Date(), 
    updatedAt: new Date() 
  };

  // 3️⃣ Create or update VendorNotifications document
  const vendorNotifications = await VendorNotificationsModel.findOneAndUpdate(
    { vendor: vendorId },
    {
      $push: { notifications: notificationToInsert },
      $set: { updatedAt: Date.now() },
    },
    { upsert: true, new: true }
  );

  return Response.json(
    { message: "Notification created successfully", vendorNotifications },
    { status: 201 }
  );
}, ["vendor", "doctor", "supplier"]);


const targetDisplayMap = {
  all_online_clients: "All Online Clients",
  all_offline_clients: "All Offline Clients",
  all_staffs: "All Staffs",
  specific_clients: "Specific Clients",
};

// GET: Retrieve VendorNotifications by vendor ID or paginated notifications
export const GET = authMiddlewareCrm(async (req) => {
  const vendorId = req.user._id.toString();

  if (!vendorId) {
    return Response.json(
      { message: "Vendor ID is required" },
      { status: 400 }
    );
  }

  const vendorNotificationsDoc = await VendorNotificationsModel.findOne({ vendor: vendorId }).lean();

  if (!vendorNotificationsDoc || vendorNotificationsDoc.notifications.length === 0) {
    return Response.json(
      {
        message: "No notifications found for this vendor",
        notifications: [],
        stats: { total: 0, pushSent: 0, smsSent: 0, mostTargeted: 'None' },
      },
      { status: 200 }
    );
  }

  const allNotifications = vendorNotificationsDoc.notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Compute stats
  const total = allNotifications.length;
  const pushSent = allNotifications.filter(n => n.channels.includes('Push')).length;
  const smsSent = allNotifications.filter(n => n.channels.includes('SMS')).length;

  const targetCounts = allNotifications.reduce((acc, n) => {
    acc[n.targetType] = (acc[n.targetType] || 0) + 1;
    return acc;
  }, {});

  const mostTargetedType = total > 0 ? Object.keys(targetCounts).reduce((a, b) => targetCounts[a] > targetCounts[b] ? a : b) : 'None';
  const mostTargeted = targetDisplayMap[mostTargetedType] || mostTargetedType;

  const response = {
    _id: vendorNotificationsDoc._id,
    vendor: vendorNotificationsDoc.vendor,
    notifications: allNotifications,
    createdAt: vendorNotificationsDoc.createdAt,
    updatedAt: vendorNotificationsDoc.updatedAt,
    stats: {
      total,
      pushSent,
      smsSent,
      mostTargeted,
    },
  };

  return Response.json(response);
}, ["vendor", "doctor", "supplier"]);

// DELETE: Remove specific notifications from the VendorNotifications document
export const DELETE = authMiddlewareCrm(async (req) => {
  const vendor = req.user._id.toString();

  const body = await req.json();
  const { notificationId } = body;

  if (!vendor) {
    return Response.json(
      { message: "Vendor ID is required" },
      { status: 400 }
    );
  }

  if (!notificationId) {
    return Response.json(
      { message: "Notification ID is required" },
      { status: 400 }
    );
  }

  // Delete the specific notification from vendor's notifications array
  const result = await VendorNotificationsModel.findOneAndUpdate(
    { vendor },
    {
      $pull: { notifications: { _id: notificationId } },
      $set: { updatedAt: Date.now() },
    },
    { new: true }
  );

  if (!result) {
    return Response.json(
      { message: "Vendor or notification not found" },
      { status: 404 }
    );
  }

  return Response.json(
    { message: "Notification deleted successfully", vendorNotifications: result },
    { status: 200 }
  );
}, ["vendor", "doctor", "supplier"]);
