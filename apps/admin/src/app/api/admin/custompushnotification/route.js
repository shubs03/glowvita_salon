// app/api/notifications/route.js
import _db from "@repo/lib/db";
import NotificationModel from "@repo/lib/models/admin/CustomPushNotificationAdmin";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";
import { NotificationService } from "@repo/lib";

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

    // Trigger Push Notification if status is Sent (default)
    if (newNotification.status === 'Sent') {
      try {
        const targetTypesArray = Array.isArray(targetType) ? targetType : [targetType];
        
        // Group recipient IDs by role
        const recipientsByRole = {
          client: new Set(),
          vendor: new Set(),
          staff: new Set(),
          admin: new Set(),
        };

        const UserModel = (await import("@repo/lib/models/user/User.model")).default;
        const VendorModel = (await import("@repo/lib/models/Vendor/Vendor.model")).default;
        const StaffModel = (await import("@repo/lib/models/Vendor/Staff.model")).default;
        const AdminModel = (await import("@repo/lib/models/admin/AdminUser")).default;

        for (const type of targetTypesArray) {
          if (type === 'all_users') {
            const query = (req.user.roleName === 'SUPER_ADMIN' && !body.regionId) ? {} : { regionId: finalRegionId };
            const users = await UserModel.find(query).select('_id').lean();
            users.forEach(u => recipientsByRole.client.add(u._id.toString()));
          } else if (type === 'all_vendors') {
            const query = (req.user.roleName === 'SUPER_ADMIN' && !body.regionId) ? {} : { regionId: finalRegionId };
            const vendors = await VendorModel.find(query).select('_id').lean();
            vendors.forEach(v => recipientsByRole.vendor.add(v._id.toString()));
          } else if (type === 'all_staff' || type === 'all_staffs') {
            const staffs = await StaffModel.find().select('_id').lean();
            staffs.forEach(s => recipientsByRole.staff.add(s._id.toString()));
          } else if (type === 'all_admins') {
            const admins = await AdminModel.find().select('_id').lean();
            admins.forEach(a => recipientsByRole.admin.add(a._id.toString()));
          } else if (type === 'specific_users') {
            if (specificIds && Array.isArray(specificIds)) {
              specificIds.forEach(id => recipientsByRole.client.add(id.toString()));
            }
          } else if (type === 'specific_vendors') {
            if (specificIds && Array.isArray(specificIds)) {
              specificIds.forEach(id => recipientsByRole.vendor.add(id.toString()));
            }
          }
        }

        // Send notifications for each role that has recipients
        for (const [role, idsSet] of Object.entries(recipientsByRole)) {
          const recipientIds = Array.from(idsSet);
          if (recipientIds.length > 0) {
            console.log(`Sending mass notification to ${recipientIds.length} ${role}s`);
            await NotificationService.sendMassNotification(recipientIds, role, {
              title: newNotification.title,
              body: newNotification.content,
              type: 'broadcast'
            });
          }
        }
      } catch (err) {
        console.error('Mass Notification Error:', err);
      }
    }

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