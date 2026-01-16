// middlewares/auth.js
import jwt from "jsonwebtoken";
import AdminUserModel from "@repo/lib/models/admin/AdminUser";
import _db from "@repo/lib/db";
import { JWT_SECRET_ADMIN } from "@repo/config/config";


export function authMiddlewareAdmin(handler, allowedRoles = []) {
  return async (req, ctx) => {
    await _db();

    let token = req.headers.get("authorization")?.split(" ")[1];
    
    // If no header, try to get from cookies
    if (!token) {
      token = req.cookies?.get('admin_access_token')?.value;
    }

    if (!token) {
      return Response.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
      if (!JWT_SECRET_ADMIN) {
        throw new Error("JWT_SECRET_ADMIN is not defined on the server.");
      }
      
      const decoded = jwt.verify(token, JWT_SECRET_ADMIN);
      const admin = await AdminUserModel.findById(decoded.userId).select("-password");

      if (!admin) {
        return Response.json({ message: "Unauthorized: Admin not found" }, { status: 401 });
      }

      // Role check for admin panel (superadmin, admin, etc.)
      if (allowedRoles.length && !allowedRoles.includes(admin.roleName)) {
        return Response.json({ message: "Forbidden: You do not have permission to access this resource" }, { status: 403 });
      }

      req.user = admin;
      req.user.roleName = decoded.roleName || admin.roleName;
      req.user.permissions = decoded.permissions || [];
      req.user.assignedRegions = decoded.regions || [];
      return handler(req, ctx);
    } catch (err) {
      console.error("Auth Middleware Error:", err.message);
      return Response.json({ message: `Invalid token: ${err.message}` }, { status: 401 });
    }
  };
}
