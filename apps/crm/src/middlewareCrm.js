
import jwt from "jsonwebtoken";
import VendorModel from "../../../packages/lib/src/models/Vendor/Vendor.model.js";
import DoctorModel from "../../../packages/lib/src/models/Vendor/Docters.model.js";
import SupplierModel from "../../../packages/lib/src/models/Vendor/Supplier.model.js";
import _db from "../../../packages/lib/src/db.js";
import { 
  JWT_SECRET_VENDOR, 
  JWT_SECRET_DOCTOR, // Assuming you add these to config
  JWT_SECRET_SUPPLIER // Assuming you add these to config
} from "../../../packages/config/config.js";

const roleToModelMap = {
  vendor: VendorModel,
  doctor: DoctorModel,
  supplier: SupplierModel,
};

const roleToSecretMap = {
  vendor: JWT_SECRET_VENDOR,
  doctor: JWT_SECRET_DOCTOR,
  supplier: JWT_SECRET_SUPPLIER,
};

export function authMiddlewareVendor(handler, allowedRoles = []) {
  return async (req, ctx) => {
    await _db();

    const authHeader = req.headers.get("authorization"); // Use standard header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    try {
      // First, decode the token to get the role without verifying signature
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

      // Now verify the token with the correct secret
      const decoded = jwt.verify(token, secret);
      
      const user = await Model.findById(decoded.userId).select("-password");

      if (!user) {
        return Response.json({ message: `Unauthorized: ${role} not found` }, { status: 401 });
      }

      // Role check (can be enhanced with specific permissions)
      if (allowedRoles.length && !allowedRoles.includes(role)) {
        return Response.json({ message: "Forbidden" }, { status: 403 });
      }

      req.user = user;
      req.user.role = role; // Ensure role is attached to the request
      
      return handler(req, ctx);
    } catch (err) {
      console.error("Auth Middleware Error:", err.message);
      return Response.json({ message: `Invalid token: ${err.message}` }, { status: 401 });
    }
  };
}
