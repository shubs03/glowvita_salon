
import jwt from "jsonwebtoken";
import VendorModel from "../../../packages/lib/src/models/Vendor/Vendor.model.js";
import DoctorModel from "../../../packages/lib/src/models/Vendor/Docters.model.js";
import SupplierModel from "../../../packages/lib/src/models/Vendor/Supplier.model.js";
import StaffModel from "../../../packages/lib/src/models/Vendor/Staff.model.js";
import _db from "../../../packages/lib/src/db.js";
import { 
  JWT_SECRET_VENDOR, 
  JWT_SECRET_DOCTOR,
  JWT_SECRET_SUPPLIER 
} from "../../../packages/config/config.js";

const roleToModelMap = {
  vendor: VendorModel,
  doctor: DoctorModel,
  supplier: SupplierModel,
  staff: StaffModel,
};

const roleToSecretMap = {
  vendor: JWT_SECRET_VENDOR,
  doctor: JWT_SECRET_DOCTOR,
  supplier: JWT_SECRET_SUPPLIER,
  staff: JWT_SECRET_VENDOR, // Staff uses the same secret as vendors
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
      const decodedPayload = jwt.decode(token);
      if (!decodedPayload || !decodedPayload.role) {
        return Response.json({ message: "Invalid token: Role missing" }, { status: 401 });
      }

      const { role } = decodedPayload;
      const secret = roleToSecretMap[role];
      const Model = roleToModelMap[role];

      if (!secret || !Model) {
        return Response.json({ message: "Unauthorized: Invalid role specified in token" }, { status: 401 });
      }
      
      // Verify token with the correct secret
      const decoded = jwt.verify(token, secret);
      
      const user = await Model.findById(decoded.userId).select("-password");

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
