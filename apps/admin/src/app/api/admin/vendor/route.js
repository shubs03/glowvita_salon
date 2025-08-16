import _db from "../../../../../../../packages/lib/src/db.js";
import VendorModel from "../../../../../../../packages/lib/src/models/Vendor/Vendor.model.js";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

await _db();

// Helper function to validate base64 image
const isValidBase64Image = (str) => {
  if (!str || typeof str !== 'string') return false;
  const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,/;
  return base64Regex.test(str);
};

// Create Vendor
export const POST = authMiddlewareAdmin(
  async (req) => {
    const body = await req.json();
    const {
      owner,
      name,
      email,
      phone,
      state,
      city,
      pincode,
      website,
      address,
      description,
      profileImage,
      subscription,
      gallery,
      bankDetails,
      documents,
    } = body;

    // Validate required fields
    if (!owner || !name || !email || !phone || !state || !city || !pincode || !address) {
      return Response.json(
        { message: "Required fields missing" },
        { status: 400 }
      );
    }

    // Validate email
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return Response.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate phone
    if (!/^\d{10}$/.test(phone)) {
      return Response.json(
        { message: "Invalid phone number. Must be 10 digits" },
        { status: 400 }
      );
    }

    // Validate pincode
    if (!/^\d{6}$/.test(pincode)) {
      return Response.json(
        { message: "Invalid pincode. Must be 6 digits" },
        { status: 400 }
      );
    }

    // Validate website if provided
    if (website && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(website)) {
      return Response.json(
        { message: "Invalid website URL" },
        { status: 400 }
      );
    }

    // Validate profile image if provided
    if (profileImage && !isValidBase64Image(profileImage)) {
      return Response.json(
        { message: "Invalid profile image format. Must be base64 encoded image." },
        { status: 400 }
      );
    }

    // Validate gallery images if provided
    if (gallery && Array.isArray(gallery)) {
      for (const image of gallery) {
        if (image && !isValidBase64Image(image)) {
          return Response.json(
            { message: "Invalid gallery image format. Must be base64 encoded image." },
            { status: 400 }
          );
        }
      }
    }

    // Validate bank details if provided
    if (bankDetails) {
      if (bankDetails.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode)) {
        return Response.json(
          { message: "Invalid IFSC code format" },
          { status: 400 }
        );
      }
    }

    // Check for duplicate email or phone
    const existingVendor = await VendorModel.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingVendor) {
      return Response.json(
        { message: "Vendor with this email or phone already exists" },
        { status: 400 }
      );
    }

    // Create vendor
    const newVendor = await VendorModel.create({
      owner,
      name,
      email,
      phone,
      state,
      city,
      pincode,
      website: website || null,
      address,
      description: description || null,
      profileImage: profileImage || null,
      subscription: subscription || { plan: "Basic", status: "Pending", expires: null },
      gallery: gallery || [],
      bankDetails: bankDetails || {},
      documents: documents || {},
    });

    return Response.json(
      { message: "Vendor created successfully", vendor: newVendor },
      { status: 201 }
    );
  },
  ["superadmin"]
);

// Get All Vendors
export const GET = authMiddlewareAdmin(
  async () => {
    const vendors = await VendorModel.find();
    return Response.json(vendors);
  },
  ["superadmin", "admin"]
);

// Update Vendor
export const PUT = authMiddlewareAdmin(
  async (req) => {
    const { id, ...body } = await req.json();

    // Validate required fields
    if (body.email && !/^\S+@\S+\.\S+$/.test(body.email)) {
      return Response.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    if (body.phone && !/^\d{10}$/.test(body.phone)) {
      return Response.json(
        { message: "Invalid phone number. Must be 10 digits" },
        { status: 400 }
      );
    }

    if (body.pincode && !/^\d{6}$/.test(body.pincode)) {
      return Response.json(
        { message: "Invalid pincode. Must be 6 digits" },
        { status: 400 }
      );
    }

    if (body.website && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(body.website)) {
      return Response.json(
        { message: "Invalid website URL" },
        { status: 400 }
      );
    }

    // Validate profile image if provided
    if (body.profileImage && !isValidBase64Image(body.profileImage)) {
      return Response.json(
        { message: "Invalid profile image format. Must be base64 encoded image." },
        { status: 400 }
      );
    }

    // Validate gallery images if provided
    if (body.gallery && Array.isArray(body.gallery)) {
      for (const image of body.gallery) {
        if (image && !isValidBase64Image(image)) {
          return Response.json(
            { message: "Invalid gallery image format. Must be base64 encoded image." },
            { status: 400 }
          );
        }
      }
    }

    // Validate bank details if provided (not read-only in create mode)
    if (body.bankDetails && !body.isEditMode) {
      if (body.bankDetails.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(body.bankDetails.ifscCode)) {
        return Response.json(
          { message: "Invalid IFSC code format" },
          { status: 400 }
        );
      }
    }

    // Check for duplicate email or phone (excluding current vendor)
    if (body.email || body.phone) {
      const existingVendor = await VendorModel.findOne({
        $or: [{ email: body.email }, { phone: body.phone }],
        _id: { $ne: id },
      });
      if (existingVendor) {
        return Response.json(
          { message: "Vendor with this email or phone already exists" },
          { status: 400 }
        );
      }
    }

    const updateData = {
      ...body,
      updatedAt: Date.now(),
    };

    // Prevent updating bank details and documents in edit mode
    if (body.isEditMode) {
      delete updateData.bankDetails;
      delete updateData.documents;
    }

    const updatedVendor = await VendorModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedVendor) {
      return Response.json({ message: "Vendor not found" }, { status: 404 });
    }

    return Response.json(updatedVendor);
  },
  ["superadmin"]
);

// Delete Vendor
export const DELETE = authMiddlewareAdmin(
  async (req) => {
    const { id } = await req.json();

    const deletedVendor = await VendorModel.findByIdAndDelete(id);
    if (!deletedVendor) {
      return Response.json({ message: "Vendor not found" }, { status: 404 });
    }

    return Response.json({ message: "Vendor deleted successfully" });
  },
  ["superadmin"]
);