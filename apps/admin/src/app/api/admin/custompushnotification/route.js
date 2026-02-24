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

    // 2️⃣ Validate and lock region
    const { validateAndLockRegion } = await import("@repo/lib");
    const finalRegionId = validateAndLockRegion(req.user, body.regionId);

    // 3️⃣ Create notification
    const newNotification = await NotificationModel.create({
      title,
      content,
      types,
      targetType,
      specificIds: specificIds || [],
      regionId: finalRegionId,
      date: Date.now(),
      updatedAt: Date.now(),
    });

    return Response.json(
      { message: "Notification created successfully", notification: newNotification },
      { status: 201 }
    );
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"],
  "push-notifications:edit"
);

export const GET = authMiddlewareAdmin(
  async (req) => {
    const { buildRegionQueryFromRequest } = await import("@repo/lib");
    const query = buildRegionQueryFromRequest(req);
    const notifications = await NotificationModel.find(query).sort({ createdAt: -1 });
    return Response.json(notifications);
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"],
  "push-notifications:view"
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
  ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"],
  "push-notifications:edit"
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
  ["SUPER_ADMIN", "REGIONAL_ADMIN"],
  "push-notifications:delete"
);