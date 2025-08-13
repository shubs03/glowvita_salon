// app/api/admin-users/route.js
import _db from "../../../../../../packages/lib/src/db.js";
import AdminUserModel from "../../../../../../packages/lib/src/models/admin/AdminUser.model";
import { authMiddlewareAdmin } from "../../../middlewareAdmin.js";

export const GET = authMiddlewareAdmin(
  async (req) => {
    const admins = await AdminUserModel.find().select("-password"); // Hide password
    return Response.json(admins);
  },
  ["superadmin"]
); // Only superadmin can view

export const PUT = authMiddleware(
  async (req) => {
    const { _id, ...body } = await req.json();

    const updatedAdmin = await AdminUserModel.findByIdAndUpdate(
      _id,
      { ...body, updatedAt: Date.now() },
      { new: true }
    ).select("-password");

    if (!updatedAdmin) {
      return Response.json({ message: "Admin not found" }, { status: 404 });
    }

    return Response.json(updatedAdmin);
  },
  ["superadmin"]
);

export const DELETE = authMiddleware(
  async (req) => {
    const { _id } = await req.json();
    const deleted = await AdminUserModel.findByIdAndDelete(_id);

    if (!deleted) {
      return Response.json({ message: "Admin not found" }, { status: 404 });
    }

    return Response.json({ message: "Admin deleted successfully" });
  },
  ["superadmin"]
);
