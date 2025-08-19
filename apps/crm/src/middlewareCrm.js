// middlewares/auth.js
import jwt from "jsonwebtoken";
import VendorUserModel from "../../../packages/lib/src/models/vendor/VendorUser.model.js";
import _db from "../../../packages/lib/src/db.js";
import { JWT_SECRET_VENDOR } from "../../../packages/config/config.js";

export function authMiddlewareVendor(handler, allowedRoles = []) {
  return async (req, ctx) => {
    await _db();

    // Change the header for vendor token
    const token = req.headers.get("vendor-authorization")?.split(" ")[1];
    if (!token) {
      return Response.json(
        { message: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    try {
      // Change the secret
      if (!JWT_SECRET_VENDOR) {
        throw new Error("JWT_SECRET_VENDOR is not defined on the server.");
      }

      const decoded = jwt.verify(token, JWT_SECRET_VENDOR);

      // Change the model
      const vendor = await VendorUserModel.findById(decoded.userId).select(
        "-password"
      );

      if (!vendor) {
        return Response.json(
          { message: "Unauthorized: Vendor not found" },
          { status: 401 }
        );
      }

      req.user = vendor;
      return handler(req, ctx);
    } catch (err) {
      console.error("Auth Middleware Error:", err.message);
      return Response.json(
        { message: `Invalid token: ${err.message}` },
        { status: 401 }
      );
    }
  };
}
