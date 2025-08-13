// middlewares/auth.js
import jwt from "jsonwebtoken";
import AdminUserModel from "../../../packages/lib/src/models/admin/AdminUser.model.js";
import _db from "../../../packages/lib/src/db.js";
import { JWT_SECRET_ADMIN } from "../../../packages/config/config.js";

export function authMiddlewareAdmin(handler, allowedRoles = []) {
  return async (req, ctx) => {
    await _db();

    const token = req.headers.get("admin-authorization")?.split(" ")[1];
    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET_ADMIN);
      const admin = await AdminUserModel.findById(decoded.userId);

      console.log("admin", admin);

      if (!admin) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
      }

      // Role check
      // if (allowedRoles.length && !allowedRoles.includes(admin.roleName)) {
      //   return Response.json({ message: "Forbidden" }, { status: 403 });
      // }

      req.user = admin;
      return handler(req, ctx);
    } catch (err) {
      return Response.json({ message: "Invalid token" }, { status: 401 });
    }
  };
}
