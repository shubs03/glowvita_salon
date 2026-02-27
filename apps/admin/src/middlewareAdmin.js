// middlewares/auth.js
import jwt from "jsonwebtoken";
import AdminUserModel from "@repo/lib/models/admin/AdminUser";
import VendorModel from "@repo/lib/models/Vendor.model";
import StaffModel from "@repo/lib/models/Vendor/Staff.model";
import DoctorModel from "@repo/lib/models/Vendor/Docters.model";
import SupplierModel from "@repo/lib/models/Vendor/Supplier.model";
import _db from "@repo/lib/db";
import {
  JWT_SECRET_ADMIN,
  JWT_SECRET_VENDOR,
  JWT_SECRET_DOCTOR,
  JWT_SECRET_SUPPLIER
} from "@repo/config/config";
import { hasPermission, forbiddenResponse } from "@repo/lib";


export function authMiddlewareAdmin(handler, allowedRoles = [], requiredPermission = null) {
  return async (req, ctx) => {
    await _db();

    let token = req.headers.get("authorization")?.split(" ")[1];

    // If no Authorization header, fall back to httpOnly cookie
    if (!token) {
      token = req.cookies?.get('admin_access_token')?.value;
    }

    if (!token) {
      return Response.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
      const decoded = jwt.decode(token);

      if (!decoded || !decoded.role) {
        return Response.json({ message: "Unauthorized: Invalid token" }, { status: 401 });
      }

      let secret;
      let Model;
      const role = decoded.role || decoded.roleName;

      // Determine secret and model based on role
      if (role === 'admin' || role === 'SUPER_ADMIN' || role === 'REGIONAL_ADMIN' || role === 'STAFF') {
        secret = JWT_SECRET_ADMIN;
        Model = AdminUserModel;
      } else if (role === 'vendor' || role === 'staff') {
        secret = JWT_SECRET_VENDOR;
        Model = role === 'vendor' ? VendorModel : StaffModel;
      } else if (role === 'doctor') {
        secret = JWT_SECRET_DOCTOR;
        Model = DoctorModel;
      } else if (role === 'supplier') {
        secret = JWT_SECRET_SUPPLIER;
        Model = SupplierModel;
      } else {
        return Response.json({ message: "Unauthorized: Invalid role" }, { status: 401 });
      }

      if (!secret) {
        throw new Error(`JWT secret for role ${role} is not defined on the server.`);
      }

      const verified = jwt.verify(token, secret);
      const user = await Model.findById(verified.userId || verified.id).select("-password");

      if (!user) {
        return Response.json({ message: `Unauthorized: ${role} not found` }, { status: 401 });
      }

      // Role check
      const userRoleLabel = user.roleName || user.role || role;
      if (allowedRoles.length && !allowedRoles.includes(userRoleLabel)) {
        return Response.json({ message: "Forbidden: You do not have permission to access this resource" }, { status: 403 });
      }

      // Granular Permission Check
      if (requiredPermission && !hasPermission(user, requiredPermission)) {
        return forbiddenResponse(`You do not have permission to ${requiredPermission.split(':')[1] || 'access'} this module`);
      }

      req.user = user;
      req.user.userId = user._id;
      req.user.roleName = userRoleLabel;
      req.user.permissions = verified.permissions || user.permissions || [];
      req.user.assignedRegions = verified.regions || user.assignedRegions || [];
      return handler(req, ctx);
    } catch (err) {
      console.error("Auth Middleware Error:", err.message);
      return Response.json({ message: `Unauthorized: ${err.message}` }, { status: 401 });
    }
  };
}
