// app/api/admin-users/route.js
import _db from "../../../../../../packages/lib/src/db.js";
import AdminUserModel from "../../../../../../packages/lib/src/models/admin/AdminUser.model";
import { authMiddlewareAdmin } from "../../../middlewareAdmin.js";
import bcrypt from "bcryptjs";

await _db();

export const POST = authMiddlewareAdmin(
  async (req) => {

    const body = await req.json();
    const {
      fullName,
      emailAddress,
      mobileNo,
      address,
      designation,
      profileImage,
      password,
      roleName,
      permissions,
    } = body;

    // 1️⃣ Validate required fields
    if (
      !fullName ||
      !emailAddress ||
      !mobileNo ||
      !address ||
      !designation ||
      !password ||
      !roleName
    ) {
      return Response.json(
        { message: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // 2️⃣ Check if email or mobile already exists
    const existingAdmin = await AdminUserModel.findOne({
      $or: [{ emailAddress }, { mobileNo }],
    });
    if (existingAdmin) {
      return Response.json(
        { message: "Email or Mobile number already in use" },
        { status: 400 }
      );
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create admin
    const newAdmin = await AdminUserModel.create({
      fullName,
      emailAddress,
      mobileNo,
      address,
      designation,
      profileImage: profileImage || null,
      password: hashedPassword,
      roleName,
      permissions: permissions || [],
    });

    // 5️⃣ Remove password before returning
    const adminData = newAdmin.toObject();
    delete adminData.password;

    return Response.json(
      { message: "Admin created successfully", admin: adminData },
      { status: 201 }
    );
  },
  ["superadmin"]
); // ✅ only superadmin can add new admins


export const GET = authMiddlewareAdmin(
  async (req) => {
    const admins = await AdminUserModel.find().select("-password"); // Hide password
    return Response.json(admins);
  },
  ["superadmin"]
); // Only superadmin can view

export const PUT = authMiddlewareAdmin(
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

export const DELETE = authMiddlewareAdmin(
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
