// app/api/notifications/route.js
import _db from "@repo/lib/db";
import NotificationModel from "@repo/lib/models/admin/CustomPushNotificationAdmin";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

await _db();

export const POST = authMiddlewareAdmin(
  async (req) => {
    const body = await req.json();
    const {
      title,
      content,
      types,
      targetType,
      specificIds,
    } = body;

    // 1️⃣ Validate required fields
    if (
      !title ||
      !content ||
      !types ||
      !targetType
    ) {
      return Response.json(
        { message: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // 2️⃣ Create notification
    const newNotification = await NotificationModel.create({
      title,
      content,
      types,
      targetType,
      specificIds: specificIds || [],
      date: Date.now(),
      updatedAt: Date.now(),
    });

    return Response.json(
      { message: "Notification created successfully", notification: newNotification },
      { status: 201 }
    );
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN"]
);

export const GET = authMiddlewareAdmin(
  async (req) => {
    const notifications = await NotificationModel.find().sort({ createdAt: -1 });
    return Response.json(notifications);
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN"]
);

export const PUT = authMiddlewareAdmin(
  async (req) => {
    const { _id, ...body } = await req.json();

    const updatedNotification = await NotificationModel.findByIdAndUpdate(
      _id,
      { ...body, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedNotification) {
      return Response.json({ message: "Notification not found" }, { status: 404 });
    }

    return Response.json(updatedNotification);
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN"]
);

export const DELETE = authMiddlewareAdmin(
  async (req) => {
    const { _id } = await req.json();
    const deleted = await NotificationModel.findByIdAndDelete(_id);

    if (!deleted) {
      return Response.json({ message: "Notification not found" }, { status: 404 });
    }

    return Response.json({ message: "Notification deleted successfully" });
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN"]
);