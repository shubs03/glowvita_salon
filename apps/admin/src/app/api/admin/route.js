// app/api/admin-users/route.js
import _db from "@repo/lib/db";
import AdminUserModel from "@repo/lib/models/admin/AdminUser";
import { authMiddlewareAdmin } from "../../../middlewareAdmin.js";
import bcrypt from "bcryptjs";
import { uploadBase64, deleteFile } from "@repo/lib/utils/upload";

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

    // Handle profile image upload if provided
    let profileImageUrl = null;
    if (profileImage) {
      const fileName = `admin-${Date.now()}`;
      profileImageUrl = await uploadBase64(profileImage, fileName);
      
      if (!profileImageUrl) {
        return Response.json(
          { message: "Failed to upload profile image" },
          { status: 500 }
        );
      }
    }

    // 4️⃣ Create admin
    const newAdmin = await AdminUserModel.create({
      fullName,
      emailAddress,
      mobileNo,
      address,
      designation,
      profileImage: profileImageUrl || null,
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

    // Get existing admin to check for old image
    const existingAdmin = await AdminUserModel.findById(_id);
    if (!existingAdmin) {
      return Response.json({ message: "Admin not found" }, { status: 404 });
    }

    // Handle profile image upload if provided
    if (body.profileImage !== undefined) {
      if (body.profileImage) {
        // Upload new image to VPS
        const fileName = `admin-${Date.now()}`;
        const imageUrl = await uploadBase64(body.profileImage, fileName);
        
        if (!imageUrl) {
          return Response.json(
            { message: "Failed to upload profile image" },
            { status: 500 }
          );
        }
        
        // Delete old image from VPS if it exists
        if (existingAdmin.profileImage) {
          await deleteFile(existingAdmin.profileImage);
        }
        
        body.profileImage = imageUrl;
      } else {
        // If image is null/empty, remove it
        body.profileImage = null;
        
        // Delete old image from VPS if it exists
        if (existingAdmin.profileImage) {
          await deleteFile(existingAdmin.profileImage);
        }
      }
    }

    const updatedAdmin = await AdminUserModel.findByIdAndUpdate(
      adminId,
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
    const url = new URL(req.url);
    const adminId = url.searchParams.get('id');
    
    if (!adminId) {
      const body = await req.json();
      // Fallback to body if ID not in query params
      const bodyId = body.id || body._id;
      if (!bodyId) {
        return Response.json({ message: "Admin ID is required" }, { status: 400 });
      }
      // Use body ID if query param not available
      const deleted = await AdminUserModel.findByIdAndDelete(bodyId);

      if (!deleted) {
        return Response.json({ message: "Admin not found" }, { status: 404 });
      }

      return Response.json({ message: "Admin deleted successfully" });
    }

    const deleted = await AdminUserModel.findByIdAndDelete(adminId);
    const { _id } = await req.json();
    
    // Get admin to check for profile image
    const admin = await AdminUserModel.findById(_id);
    if (!admin) {
      return Response.json({ message: "Admin not found" }, { status: 404 });
    }

    const deleted = await AdminUserModel.findByIdAndDelete(_id);

    if (!deleted) {
      return Response.json({ message: "Admin not found" }, { status: 404 });
    }
    
    // Delete profile image from VPS if it exists
    if (admin.profileImage) {
      await deleteFile(admin.profileImage);
    }

    return Response.json({ message: "Admin deleted successfully" });
  },
  ["superadmin"]
);