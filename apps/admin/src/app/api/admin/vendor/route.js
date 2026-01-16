import _db from "@repo/lib/db";
import VendorModel from "@repo/lib/models/Vendor/Vendor.model";
import ClientModel from "@repo/lib/models/Vendor/Client.model";
import PlanModel from "@repo/lib/models/admin/SubscriptionPlan";
import RegionModel from "@repo/lib/models/admin/Region.model";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin";
import bcrypt from "bcryptjs";
import { uploadBase64, deleteFile } from "@repo/lib/utils/upload";
import { buildRegionQueryFromRequest, validateAndLockRegion, hasPermission, forbiddenResponse } from "@repo/lib";

await _db();

// Helper function to validate base64 image
const isValidBase64Image = (str) => {
  if (!str || typeof str !== "string") return false;
  const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,/;
  return base64Regex.test(str);
};

// Utility function to process base64 image and upload it
// Also deletes the old image if a new one is uploaded
const processBase64Image = async (base64String, fileName, oldImageUrl = null) => {
    if (!base64String) return null;
    
    // Check if it's already a URL (not base64)
    if (base64String.startsWith('http')) {
        return base64String; // Already uploaded, return as is
    }
    
    // Upload the base64 image and return the URL
    const imageUrl = await uploadBase64(base64String, fileName);
    
    // If upload was successful and there's an old image, delete the old one
    if (imageUrl && oldImageUrl && oldImageUrl.startsWith('http')) {
        try {
            // Attempt to delete the old file
            // We don't await this as we don't want to fail the whole operation if deletion fails
            deleteFile(oldImageUrl).catch(err => {
                console.warn('Failed to delete old image:', err);
            });
        } catch (err) {
            console.warn('Error deleting old image:', err);
        }
    }
    
    return imageUrl;
};
// Create Vendor
export const POST = authMiddlewareAdmin(
  async (req) => {
    if (!hasPermission(req.user, "vendors:edit")) {
      return forbiddenResponse();
    }
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
        ["at-salon", "at-home", "custom-location"].includes(sc)
      )
    ) {
      return Response.json(
        { message: "Invalid subCategories" },
        { status: 400 }
      );
    }
    if (profileImage && !profileImage.startsWith("http") && !isValidBase64Image(profileImage)) {
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
        if (
          image &&
          !image.startsWith("http") && // allow existing uploaded URLs
          !isValidBase64Image(image)   // validate only new Base64 uploads
        ) {
          return Response.json(
            { message: "Invalid gallery image format. Must be base64 encoded image." },
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
          accountHolder: bankDetails.accountHolder || null,
        }
      : {
          bankName: null,
          accountNumber: null,
          ifscCode: null,
          accountHolder: null,
        };

    // Handle profile image upload if provided
    let profileImageUrl = profileImage;
    if (profileImage) {
      const fileName = `vendor-${Date.now()}-profile`;
      profileImageUrl = await processBase64Image(profileImage, fileName);
      
      if (!profileImageUrl) {
        return Response.json(
          { message: "Failed to upload profile image" },
          { status: 500 }
        );
      }
    }
    
    // Handle gallery images upload if provided
    let galleryUrls = gallery || [];
    if (gallery && Array.isArray(gallery)) {
      galleryUrls = [];
      for (let i = 0; i < gallery.length; i++) {
        const image = gallery[i];
        if (image) {
          const fileName = `vendor-${Date.now()}-gallery-${i}`;
          const imageUrl = await processBase64Image(image, fileName);
          
          if (imageUrl) {
            galleryUrls.push(imageUrl);
          } else {
            galleryUrls.push(image);
          }
        } else {
          galleryUrls.push(image);
        }
      }
    }
    
    // Transform documents safely
    const documentsArray = Array.isArray(documents) ? documents : [];
    
    // Handle document uploads if provided
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
      // Initialize document status fields for new documents
      aadharCardStatus: documentsArray.find((d) => d.type === "aadhar")?.file ? "pending" : undefined,
      panCardStatus: documentsArray.find((d) => d.type === "pan")?.file ? "pending" : undefined,
      udyogAadharStatus: documentsArray.find((d) => d.type === "gst")?.file ? "pending" : undefined,
      shopLicenseStatus: documentsArray.find((d) => d.type === "license")?.file ? "pending" : undefined,
      udhayamCertStatus: documentsArray.find((d) => d.type === "udhayam")?.file ? "pending" : undefined,
    };
    
    // Process document uploads
    if (documentsArray.length > 0) {
      for (const doc of documentsArray) {
        if (doc.file && !doc.file.startsWith('http')) {
          const fileName = `vendor-${Date.now()}-${doc.type}`;
          const docUrl = await processBase64Image(doc.file, fileName);
          
          if (docUrl) {
            // Update the document field with the uploaded URL
            const docField = doc.type === 'aadhar' ? 'aadharCard' : 
                           doc.type === 'pan' ? 'panCard' : 
                           doc.type === 'gst' ? 'udyogAadhar' : 
                           doc.type === 'license' ? 'shopLicense' : 
                           doc.type === 'udhayam' ? 'udhayamCert' : null;
            
            if (docField) {
              documentsData[docField] = docUrl;
            }
          }
        }
      }
    }

    // Validate and lock region
    let finalRegionId = validateAndLockRegion(req.user, body.regionId);

    // Auto-Assign Region Logic if not provided (Safety Net)
    if (!finalRegionId && (city || state || location)) {
      const { assignRegion } = await import("@repo/lib");
      finalRegionId = await assignRegion(city, state, location);
    }

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
      regionId: finalRegionId,
      category,
      subCategories,
      password: hashedPassword,
      website: website || null,
      address,
      location,
      description: description || null,
      profileImage: profileImageUrl || null,
      subscription: subscriptionData,
      gallery: galleryUrls,
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
  ["SUPER_ADMIN", "REGIONAL_ADMIN"]
);

// Get All Vendors
export const GET = authMiddlewareAdmin(async (req) => {
  if (!hasPermission(req.user, "vendors:view")) {
    return forbiddenResponse();
  }
  const url = new URL(req.url);
  const vendorIdParam = url.searchParams.get('vendorId');
  
  console.log('[Vendor GET] Request from user:', {
    userId: req.user._id,
    roleName: req.user.roleName,
    assignedRegions: req.user.assignedRegions,
    vendorIdParam,
    requestUrl: req.url
  });
  
  // If vendorId is provided, fetch clients for that vendor
  if (vendorIdParam) {
    try {
      const clients = await ClientModel.find({ vendorId: vendorIdParam })
        .sort({ lastVisit: -1, createdAt: -1 })
        .select('-emergencyContact -socialMediaLinks -tags -notes')
        .lean();
      
      return Response.json(clients);
    } catch (error) {
      console.error('Error fetching vendor clients:', error);
      return Response.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }
  }
  
  // Otherwise fetch all vendors with region filter
  const regionQuery = buildRegionQueryFromRequest(req);
  console.log('[Vendor GET] Query:', regionQuery);
  const vendors = await VendorModel.find(regionQuery).select("-password").lean();
  console.log('[Vendor GET] Found vendors:', vendors.length);
  return Response.json(vendors);
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);

// Update Vendor
export const PUT = authMiddlewareAdmin(
  async (req) => {
    if (!hasPermission(req.user, "vendors:edit")) {
      return forbiddenResponse();
    }
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
        ["at-salon", "at-home", "custom-location"].includes(sc)
      )
    ) {
      return Response.json(
        { message: "Invalid subCategories" },
        { status: 400 }
      );
    }
    if (profileImage && !profileImage.startsWith("http") && !isValidBase64Image(profileImage)) {
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
        if (
          image &&
          !image.startsWith("http") && // allow existing uploaded URLs
          !isValidBase64Image(image)   // validate only new Base64 uploads
        ) {
          return Response.json(
            { message: "Invalid gallery image format. Must be base64 encoded image." },
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
          accountHolder: bankDetails.accountHolder || null,
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

    // Handle profile image upload if provided
    let profileImageUrl = profileImage;
    if (profileImage && !profileImage.startsWith('http')) {
      // Get existing vendor to get old image URL for deletion
      const existingVendor = await VendorModel.findById(id);
      const fileName = `vendor-${id}-profile`;
      profileImageUrl = await processBase64Image(profileImage, fileName, existingVendor?.profileImage);
      
      if (profileImageUrl === null && profileImage) {
        return Response.json(
          { message: "Failed to upload profile image" },
          { status: 500 }
        );
      }
    }
    
    // Handle gallery images upload if provided
    let galleryUrls = gallery || [];
    if (gallery && Array.isArray(gallery)) {
      galleryUrls = [];
      // Get existing vendor to get old gallery URLs for deletion
      const existingVendor = await VendorModel.findById(id);
      
      for (let i = 0; i < gallery.length; i++) {
        const image = gallery[i];
        if (image && !image.startsWith('http')) {
          const fileName = `vendor-${id}-gallery-${i}`;
          // Get the old image URL for this position if it exists
          const oldImageUrl = existingVendor?.gallery && existingVendor.gallery[i] ? existingVendor.gallery[i] : null;
          const imageUrl = await processBase64Image(image, fileName, oldImageUrl);
          
          if (imageUrl) {
            galleryUrls.push(imageUrl);
          } else {
            galleryUrls.push(image);
          }
        } else {
          galleryUrls.push(image);
        }
      }
    }
    
    // Handle document uploads if provided
    const documentsDataWithUrls = { ...documentsData };
    if (documents && Array.isArray(documents)) {
      // Get existing vendor to get old document URLs for deletion
      const existingVendor = await VendorModel.findById(id);
      
      for (const doc of documents) {
        if (doc.file && !doc.file.startsWith('http')) {
          const fileName = `vendor-${id}-${doc.type}`;
          // Get the old document URL if it exists
          const docField = doc.type === 'aadhar' ? 'aadharCard' : 
                         doc.type === 'pan' ? 'panCard' : 
                         doc.type === 'gst' ? 'udyogAadhar' : 
                         doc.type === 'license' ? 'shopLicense' : 
                         doc.type === 'udhayam' ? 'udhayamCert' : null;
          
          const oldDocUrl = docField && existingVendor?.documents ? existingVendor.documents[docField] : null;
          const docUrl = await processBase64Image(doc.file, fileName, oldDocUrl);
          
          if (docUrl) {
            documentsDataWithUrls[docField] = docUrl;
          }
        }
      }
    } else {
      // If no documents provided, keep existing document data
      const existingVendor = await VendorModel.findById(id);
      if (existingVendor?.documents) {
        Object.assign(documentsDataWithUrls, existingVendor.documents);
      }
    }

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
      profileImage: profileImageUrl || null,
      subscription: subscriptionData,
      gallery: galleryUrls,
      bankDetails: bankDetailsData,
      documents: documentsDataWithUrls,
      regionId: validateAndLockRegion(req.user, body.regionId),
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
  ["SUPER_ADMIN", "REGIONAL_ADMIN"]
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
  ["SUPER_ADMIN", "REGIONAL_ADMIN"]
);

// Update Vendor Status or Document Status
export const PATCH = authMiddlewareAdmin(
  async (req) => {
    const body = await req.json();
    const { id, status, vendorId, documentType, rejectionReason } = body;

    // Check if this is a vendor status update
    if (id && status && !documentType) {
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
    }
    
    // Check if this is a document status update
    else if (vendorId && documentType && status) {
      // Validate required fields
      if (!vendorId || !documentType || !status) {
        return Response.json(
          { message: "Vendor ID, document type, and status are required" },
          { status: 400 }
        );
      }

      // Validate document type
      const validDocumentTypes = [
        'aadharCard', 'udyogAadhar', 'udhayamCert', 
        'shopLicense', 'panCard'
      ];
      
      if (!validDocumentTypes.includes(documentType)) {
        return Response.json(
          { message: "Invalid document type" },
          { status: 400 }
        );
      }

      // Validate status
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return Response.json(
          { message: "Invalid status. Must be pending, approved, or rejected" },
          { status: 400 }
        );
      }

      // Validate rejection reason for rejected status
      if (status === 'rejected' && (!rejectionReason || rejectionReason.trim() === '')) {
        return Response.json(
          { message: "Rejection reason is required when status is rejected" },
          { status: 400 }
        );
      }

      // Prepare update data
      const updateData = {
        [`documents.${documentType}Status`]: status,
      };

      // Add rejection reason if status is rejected
      if (status === 'rejected') {
        updateData[`documents.${documentType}AdminRejectionReason`] = rejectionReason;
      } else {
        // Clear rejection reason if status is not rejected
        updateData[`documents.${documentType}AdminRejectionReason`] = null;
      }

      const updatedVendor = await VendorModel.findByIdAndUpdate(
        vendorId,
        { $set: updateData },
        { new: true }
      ).select("-password");

      if (!updatedVendor) {
        return Response.json({ message: "Vendor not found" }, { status: 404 });
      }

      return Response.json({
        message: `Document ${status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Reset to Pending"} successfully`,
        vendor: updatedVendor,
      });
    }
    
    // Invalid request
    else {
      return Response.json(
        { message: "Invalid request parameters" },
        { status: 400 }
      );
    }
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN"]
);
