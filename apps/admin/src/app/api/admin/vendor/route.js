import _db from "../../../../../../../packages/lib/src/db";
import VendorModel from "../../../../../../../packages/lib/src/models/Vendor/Vendor.model";
import PlanModel from "../../../../../../../packages/lib/src/models/admin/SubscriptionPlan.model";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin";
import bcrypt from "bcryptjs";

await _db();

// Helper function to validate base64 image
const isValidBase64Image = (str) => {
  if (!str || typeof str !== "string") return false;
  const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,/;
  return base64Regex.test(str);
};

// Create Vendor
export const POST = authMiddlewareAdmin(
  async (req) => {
    const body = await req.json();
    const {
      firstName,
      lastName,
      businessName,
      email,
      phone,
      state,
      city,
      pincode,
      category,
      subCategories,
      password,
      website,
      location,
      address,
      description,
      profileImage,
      subscription,
      gallery,
      bankDetails,
      documents,
    } = body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !businessName ||
      !email ||
      !phone ||
      !state ||
      !city ||
      !pincode ||
      !category ||
      !subCategories ||
      subCategories.length === 0 ||
      !location ||
      !address ||
      !password
    ) {
      return Response.json(
        { message: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Validate formats
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return Response.json(
        { message: "Please enter a valid email address" },
        { status: 400 }
      );
    }
    if (!/^\d{10}$/.test(phone)) {
      return Response.json(
        { message: "Please enter a valid 10-digit phone number" },
        { status: 400 }
      );
    }
    if (!/^\d{6}$/.test(pincode)) {
      return Response.json(
        { message: "Please enter a valid 6-digit pincode" },
        { status: 400 }
      );
    }
    if (website && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(website)) {
      return Response.json(
        { message: "Please enter a valid URL" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return Response.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }
    if (!["unisex", "men", "women"].includes(category)) {
      return Response.json({ message: "Invalid category" }, { status: 400 });
    }
    if (
      !subCategories.every((sc) =>
        ["shop", "shop-at-home", "onsite"].includes(sc)
      )
    ) {
      return Response.json(
        { message: "Invalid subCategories" },
        { status: 400 }
      );
    }
    if (profileImage && !isValidBase64Image(profileImage)) {
      return Response.json(
        {
          message:
            "Invalid profile image format. Must be base64 encoded image.",
        },
        { status: 400 }
      );
    }
    if (gallery && Array.isArray(gallery)) {
      for (const image of gallery) {
        if (image && !isValidBase64Image(image)) {
          return Response.json(
            {
              message:
                "Invalid gallery image format. Must be base64 encoded image.",
            },
            { status: 400 }
          );
        }
      }
    }
    if (
      bankDetails?.ifscCode &&
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode)
    ) {
      return Response.json(
        { message: "Please enter a valid IFSC code" },
        { status: 400 }
      );
    }

    // Check for duplicate email or phone
    const existingVendor = await VendorModel.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingVendor) {
      return Response.json(
        { message: "Email or phone number already in use" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Transform subscription fields (resolve plan ObjectId)
    let planId = null;
    if (subscription?.package) {
      const planDoc = await PlanModel.findOne({ name: subscription.package });
      planId = planDoc ? planDoc._id : null;
    }
    const subscriptionData = subscription
      ? {
          plan: planId, // ObjectId reference
          status: subscription.isActive ? "Active" : "Pending",
          expires: subscription.endDate ? new Date(subscription.endDate) : null,
        }
      : {
          plan: (await PlanModel.findOne({ name: "Basic" }))?._id || null,
          status: "Pending",
          expires: null,
        };

    // Transform bankDetails
    const bankDetailsData = bankDetails
      ? {
          bankName: bankDetails.bankName || null,
          accountNumber: bankDetails.accountNumber || null,
          ifscCode: bankDetails.ifscCode || null,
          accountHolder: bankDetails.accountHolderName || null,
        }
      : {
          bankName: null,
          accountNumber: null,
          ifscCode: null,
          accountHolder: null,
        };

    // Transform documents
    const documentsData = documents
      ? {
          aadharCard: documents.find((d) => d.type === "aadhar")?.file || null,
          panCard: documents.find((d) => d.type === "pan")?.file || null,
          udyogAadhar: documents.find((d) => d.type === "gst")?.file || null,
          shopLicense:
            documents.find((d) => d.type === "license")?.file || null,
          udhayamCert:
            documents.find((d) => d.type === "udhayam")?.file || null,
          otherDocs:
            documents.filter((d) => d.type === "other").map((d) => d.file) ||
            [],
        }
      : {
          aadharCard: null,
          panCard: null,
          udyogAadhar: null,
          shopLicense: null,
          udhayamCert: null,
          otherDocs: [],
        };

    // Create vendor
    const newVendor = await VendorModel.create({
      firstName,
      lastName,
      businessName,
      email,
      phone,
      state,
      city,
      pincode,
      category,
      subCategories,
      password: hashedPassword,
      website: website || null,
      address,
      location,
      description: description || null,
      profileImage: profileImage || null,
      subscription: subscriptionData,
      gallery: gallery || [],
      bankDetails: bankDetailsData,
      documents: documentsData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Remove password from response
    const vendorData = newVendor.toObject();
    delete vendorData.password;

    return Response.json(
      { message: "Vendor created successfully", vendor: vendorData },
      { status: 201 }
    );
  },
  ["superadmin"]
);

// Get All Vendors
export const GET = (async () => {
  const vendors = await VendorModel.find().select("-password");
  return Response.json(vendors);
});

// Update Vendor
export const PUT = authMiddlewareAdmin(
  async (req) => {
    const { id, ...body } = await req.json();
    const {
      firstName,
      lastName,
      businessName,
      email,
      phone,
      state,
      city,
      pincode,
      category,
      subCategories,
      password,
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
    if (
      !firstName ||
      !lastName ||
      !businessName ||
      !email ||
      !phone ||
      !state ||
      !city ||
      !pincode ||
      !category ||
      !subCategories ||
      subCategories.length === 0 ||
      !address
    ) {
      return Response.json(
        { message: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Validate formats
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return Response.json(
        { message: "Please enter a valid email address" },
        { status: 400 }
      );
    }
    if (!/^\d{10}$/.test(phone)) {
      return Response.json(
        { message: "Please enter a valid 10-digit phone number" },
        { status: 400 }
      );
    }
    if (!/^\d{6}$/.test(pincode)) {
      return Response.json(
        { message: "Please enter a valid 6-digit pincode" },
        { status: 400 }
      );
    }
    if (website && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(website)) {
      return Response.json(
        { message: "Please enter a valid URL" },
        { status: 400 }
      );
    }
    if (password && password.length < 8) {
      return Response.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }
    if (!["unisex", "men", "women"].includes(category)) {
      return Response.json({ message: "Invalid category" }, { status: 400 });
    }
    if (
      !subCategories.every((sc) =>
        ["shop", "shop-at-home", "onsite"].includes(sc)
      )
    ) {
      return Response.json(
        { message: "Invalid subCategories" },
        { status: 400 }
      );
    }
    if (profileImage && !isValidBase64Image(profileImage)) {
      return Response.json(
        {
          message:
            "Invalid profile image format. Must be base64 encoded image.",
        },
        { status: 400 }
      );
    }
    if (gallery && Array.isArray(gallery)) {
      for (const image of gallery) {
        if (image && !isValidBase64Image(image)) {
          return Response.json(
            {
              message:
                "Invalid gallery image format. Must be base64 encoded image.",
            },
            { status: 400 }
          );
        }
      }
    }
    if (
      bankDetails?.ifscCode &&
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode)
    ) {
      return Response.json(
        { message: "Please enter a valid IFSC code" },
        { status: 400 }
      );
    }

    // Check for duplicate email or phone (excluding current vendor)
    if (email || phone) {
      const existingVendor = await VendorModel.findOne({
        $or: [{ email }, { phone }],
        _id: { $ne: id },
      });
      if (existingVendor) {
        return Response.json(
          { message: "Email or phone number already in use" },
          { status: 400 }
        );
      }
    }

    // Transform subscription fields (resolve plan ObjectId)
    let planId = null;
    if (subscription?.package) {
      const planDoc = await PlanModel.findOne({ name: subscription.package });
      planId = planDoc ? planDoc._id : null;
    }
    const subscriptionData = subscription
      ? {
          plan: planId, // ObjectId reference
          status: subscription.isActive ? "Active" : "Pending",
          expires: subscription.endDate ? new Date(subscription.endDate) : null,
        }
      : {
          plan: (await PlanModel.findOne({ name: "Basic" }))?._id || null,
          status: "Pending",
          expires: null,
        };

    // Transform bankDetails
    const bankDetailsData = bankDetails
      ? {
          bankName: bankDetails.bankName || null,
          accountNumber: bankDetails.accountNumber || null,
          ifscCode: bankDetails.ifscCode || null,
          accountHolder: bankDetails.accountHolderName || null,
        }
      : {
          bankName: null,
          accountNumber: null,
          ifscCode: null,
          accountHolder: null,
        };

    // Transform documents safely
    const documentsArray = Array.isArray(documents) ? documents : [];

    const documentsData = {
      aadharCard: documentsArray.find((d) => d.type === "aadhar")?.file || null,
      panCard: documentsArray.find((d) => d.type === "pan")?.file || null,
      udyogAadhar: documentsArray.find((d) => d.type === "gst")?.file || null,
      shopLicense:
        documentsArray.find((d) => d.type === "license")?.file || null,
      udhayamCert:
        documentsArray.find((d) => d.type === "udhayam")?.file || null,
      otherDocs:
        documentsArray.filter((d) => d.type === "other").map((d) => d.file) ||
        [],
    };

    // Hash password if provided
    const updateData = {
      firstName,
      lastName,
      businessName,
      email,
      phone,
      state,
      city,
      pincode,
      category,
      subCategories,
      password: password ? await bcrypt.hash(password, 10) : undefined,
      website: website || null,
      address,
      description: description || null,
      profileImage: profileImage || null,
      subscription: subscriptionData,
      gallery: gallery || [],
      bankDetails: bankDetailsData,
      documents: documentsData,
      updatedAt: Date.now(),
    };

    // Remove undefined fields to avoid overwriting with undefined
    if (!password) delete updateData.password;

    const updatedVendor = await VendorModel.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    if (!updatedVendor) {
      return Response.json({ message: "Vendor not found" }, { status: 404 });
    }

    return Response.json({
      message: "Vendor updated successfully",
      vendor: updatedVendor,
    });
  },
  ["superadmin"]
);

// Approve or Disapprove Vendor
export const PATCH = authMiddlewareAdmin(
  async (req) => {
    const { id, status } = await req.json();

    // Validate required fields
    if (!id || !status) {
      return Response.json(
        { message: "Vendor ID and action (approve/disapprove) are required" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData = {
      status: status,
    };

    const updatedVendor = await VendorModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!updatedVendor) {
      return Response.json({ message: "Vendor not found" }, { status: 404 });
    }

    return Response.json({
      message: `Vendor ${status === "Approved" ? "Approved" : "Disapproved"} successfully`,
      vendor: updatedVendor,
    });
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
