
import jwt from "jsonwebtoken";
import VendorModel from "../../../packages/lib/src/models/Vendor/Vendor.model.js";
import DoctorModel from "../../../packages/lib/src/models/Vendor/Docters.model.js";
import SupplierModel from "../../../packages/lib/src/models/Vendor/Supplier.model.js";
import StaffModel from "../../../packages/lib/src/models/Vendor/Staff.model.js";
import _db from "../../../packages/lib/src/db.js";
import { 
  JWT_SECRET_VENDOR
} from "../../../packages/config/config.js";

const roleToModelMap = {
  vendor: VendorModel,
  doctor: DoctorModel,
  supplier: SupplierModel,
  staff: StaffModel,
};

export function authMiddlewareCrm(handler, allowedRoles = []) {
  return async (req, ctx) => {
    await _db();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    try {
      if (!JWT_SECRET_VENDOR) {
        throw new Error("JWT_SECRET_VENDOR is not defined on the server.");
      }
      
      const decoded = jwt.verify(token, JWT_SECRET_VENDOR);
      const { userId, role } = decoded;

      if (!role || !roleToModelMap[role]) {
        return Response.json({ message: "Invalid token: Role missing or invalid" }, { status: 401 });
      }

      const Model = roleToModelMap[role];
      const user = await Model.findById(userId).select("-password");

      if (!user) {
        return Response.json({ message: `Unauthorized: ${role} not found` }, { status: 401 });
      }

      // Role check: ensure the user's role is one of the allowed roles for the endpoint
      if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        return Response.json({ message: "Forbidden: You do not have permission to access this resource" }, { status: 403 });
      }

      // Attach user and role to the request for use in the handler
      req.user = user;
      req.user.role = role;
      
      return handler(req, ctx);
    } catch (err) {
      console.error("Auth Middleware Error:", err.message);
      return Response.json({ message: `Invalid token: ${err.message}` }, { status: 401 });
    }
  };
}
