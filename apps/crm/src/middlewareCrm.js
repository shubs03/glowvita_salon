
import jwt from "jsonwebtoken";
import VendorModel from "../../../packages/lib/src/models/vendor/Vendor.model.js";
import DoctorModel from "../../../packages/lib/src/models/vendor/Docters.model.js";
import SupplierModel from "../../../packages/lib/src/models/vendor/Supplier.model.js";
import StaffModel from "../../../packages/lib/src/models/vendor/Staff.model.js";
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

// Load secrets dynamically at runtime to ensure environment variables are loaded
const getRoleSecrets = () => {
  return {
    vendor: process.env.JWT_SECRET_VENDOR,
    doctor: process.env.JWT_SECRET_DOCTOR,
    supplier: process.env.JWT_SECRET_SUPPLIER,
    staff: process.env.JWT_SECRET_VENDOR, // Staff uses the same secret as vendors
  };
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
      const roleSecrets = getRoleSecrets();
      const secret = roleSecrets[role];
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
      console.error("Error details:", err);
      return Response.json({ message: `Invalid token: ${err.message}` }, { status: 401 });
    }
  };
}
