
// crm/api/offers/route.js

import _db from "../../../../../../../packages/lib/src/db.js";
import CRMOfferModel from '@repo/lib/models/Vendor/CRMOffer.model';
import {
  authMiddlewareCrm,
  authMiddlewareCRM,
} from "../../../../middlewareCrm";
import { uploadBase64, deleteFile } from "@repo/lib/utils/upload";

// Predefined options for validation
const validSpecialties = [
  "Hair Cut",
  "Spa",
  "Massage",
  "Facial",
  "Manicure",
  "Pedicure",
];
const validCategories = ["Men", "Women", "Unisex"];

await _db();

// Helper function to generate random coupon code
const generateCouponCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Helper function to validate base64 image
const isValidBase64Image = (str) => {
  if (!str || typeof str !== "string") return false;
  const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,/;
  return base64Regex.test(str);
};

// Create Offer
export const POST = authMiddlewareCrm(
  async (req) => {
    const body = await req.json();
    const {
      code,
      type,
      value,
      status,
      startDate,
      expires,
      applicableSpecialties,
      applicableCategories,
      applicableDiseases,
      applicableServices,
      applicableServiceCategories,
      minOrderAmount,
      offerImage,
      isCustomCode,
    } = body;

    const user = req.user;
    const userRole = req.user.role; // Get user role from middleware (this is set in middleware)

    // Validate required fields
    if (!type || value == null || !startDate) {
      return Response.json(
        { message: "Required fields missing" },
        { status: 400 }
      );
    }

    let finalCode;
    let isCustom = false;

    // Handle coupon code generation or validation
    if (code && code.trim()) {
      // Custom code provided
      finalCode = code.toUpperCase().trim();
      isCustom = true;

      // Check for duplicate code
      const existingOffer = await CRMOfferModel.findOne({ code: finalCode });
      if (existingOffer) {
        return Response.json(
          { message: "Offer code already exists" },
          { status: 400 }
        );
      }
    } else {
      // Generate unique code
      let attempts = 0;
      do {
        finalCode = generateCouponCode();
        attempts++;
        if (attempts > 10) {
          return Response.json(
            { message: "Unable to generate unique code" },
            { status: 500 }
          );
        }
      } while (await CRMOfferModel.findOne({ code: finalCode }));
    }

    // Validate applicable fields based on user role
    let specialties = [];
    let categories = [];
    let diseases = [];
    let services = [];
    let serviceCategories = [];
    let orderAmount = null;

    if (userRole === 'vendor') {
      // Handle new services and service categories
      if (Array.isArray(applicableServices) && applicableServices.length > 0) {
        services = applicableServices;
      }
      
      if (Array.isArray(applicableServiceCategories) && applicableServiceCategories.length > 0) {
        serviceCategories = applicableServiceCategories;
      }

      // Keep legacy specialty validation for backward compatibility
      if (Array.isArray(applicableSpecialties) && applicableSpecialties.length > 0) {
        specialties = applicableSpecialties;
        if (!specialties.every((s) => validSpecialties.includes(s))) {
          return Response.json(
            {
              message: `Invalid specialties. Must be one of: ${validSpecialties.join(", ")}`,
            },
            { status: 400 }
          );
        }
      }

      // Keep legacy category validation for backward compatibility
      if (Array.isArray(applicableCategories) && applicableCategories.length > 0) {
        categories = applicableCategories;
        if (!categories.every((c) => validCategories.includes(c))) {
          return Response.json(
            {
              message: `Invalid categories. Must be one of: ${validCategories.join(", ")}`,
            },
            { status: 400 }
          );
        }
      }
    } else if (userRole === 'doctor') {
      // For doctors, validate diseases
      if (Array.isArray(applicableDiseases) && applicableDiseases.length > 0) {
        diseases = applicableDiseases;
      }
    } else if (userRole === 'supplier') {
      // For suppliers, validate minimum order amount
      if (minOrderAmount && minOrderAmount > 0) {
        orderAmount = minOrderAmount;
      }
    }

    // Handle image upload if provided
    let imageUrl = null;
    if (offerImage && isValidBase64Image(offerImage)) {
      const fileName = `crm-offer-${Date.now()}`;
      imageUrl = await uploadBase64(offerImage, fileName);
      
      if (!imageUrl) {
        return Response.json(
          { message: "Failed to upload image" },
          { status: 500 }
        );
      }
    }

    // Determine business type and ID for the offer
    // Staff members belong to vendor business type
    const businessType = userRole === 'staff' ? 'vendor' : userRole;
    let businessId = user.userId;
    if (userRole === 'staff' && user.vendorId) {
      businessId = user.vendorId;
    }

    // Fetch business owner's region to inherit
    let parentRegionId = null;
    try {
      const Model = businessType === 'vendor' 
        ? (await import("@repo/lib/models/Vendor/Vendor.model")).default
        : businessType === 'doctor'
          ? (await import("@repo/lib/models/Vendor/Docters.model")).default
          : (await import("@repo/lib/models/Vendor/Supplier.model")).default;
      
      const parent = await Model.findById(businessId).select('regionId');
      parentRegionId = parent?.regionId;
    } catch (err) {
      console.error("Error inheriting region for offer:", err);
    }

    // Create offer
    const newOffer = await CRMOfferModel.create({
      code: finalCode,
      type,
      value,
      status: status || "Scheduled",
      startDate,
      expires: expires || null,
      applicableSpecialties: specialties,
      applicableCategories: categories,
      applicableDiseases: diseases,
      applicableServices: services,
      applicableServiceCategories: serviceCategories,
      minOrderAmount: orderAmount,
      offerImage: imageUrl || null,
      isCustomCode: isCustom,
      businessType: businessType,
      businessId: businessId,
      regionId: parentRegionId,
    });

    return Response.json(
      { message: "Offer created successfully", offer: newOffer },
      { status: 201 }
    );
  },
  ['vendor', 'doctor', 'supplier'] // Allow all three roles
);

// Get All Offers
export const GET = authMiddlewareCrm(async (req) => {
  try {
    const user = req.user;

    console.log('req.user', req.user);

    console.log("user:", user);
    
    // Determine business type for filtering
    // Staff members belong to vendor business type
    const businessType = user.role === 'staff' ? 'vendor' : user.role;
    
    // For staff, we need to get the vendor ID they belong to
    let businessId = user.userId;
    if (user.role === 'staff' && user.vendorId) {
      businessId = user.vendorId;
    }
    
    // Filter offers by business type and business ID
    const offers = await CRMOfferModel.find({ 
      businessType: businessType,
      businessId: businessId 
    });
    console.log('GET /api/crm/offers - Found offers:', offers.length);
    
    const currentDate = new Date();

    // Update status for each offer based on current date
    for (let offer of offers) {
      let newStatus = "Scheduled";
      if (offer.startDate <= currentDate) {
        if (!offer.expires || offer.expires >= currentDate) {
          newStatus = "Active";
        } else {
          newStatus = "Expired";
        }
      }
      if (offer.status !== newStatus) {
        offer.status = newStatus;
        await offer.save();
      }
    }

    // Ensure all arrays are properly initialized
    const sanitizedOffers = offers.map((offer) => ({
      ...offer.toObject(),
      applicableSpecialties: Array.isArray(offer.applicableSpecialties)
        ? offer.applicableSpecialties
        : [],
      applicableCategories: Array.isArray(offer.applicableCategories)
        ? offer.applicableCategories
        : [],
      applicableDiseases: Array.isArray(offer.applicableDiseases)
        ? offer.applicableDiseases
        : [],
      applicableServices: Array.isArray(offer.applicableServices)
        ? offer.applicableServices
        : [],
      applicableServiceCategories: Array.isArray(offer.applicableServiceCategories)
        ? offer.applicableServiceCategories
        : [],
    }));

    return Response.json(sanitizedOffers);
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      message: "Internal server error", 
      error: error.message 
    }, { status: 500 });
  }
}, ['vendor', 'doctor', 'supplier']);

// PUT - Update an existing offer
export const PUT = authMiddlewareCrm(
  async (req) => {
    try {
      const ownerId = req.user.userId;
      const userRole = req.user.role;
      const body = await req.json();
      const { id, ...updateData } = body;

      if (!id) {
        return Response.json({ message: "Offer ID is required" }, { status: 400 });
      }

      // Find the existing offer and verify ownership
      const offer = await CRMOfferModel.findOne({ _id: id, businessId: ownerId });
      if (!offer) {
        return Response.json({ message: "Offer not found or access denied" }, { status: 404 });
      }

      // Handle image upload if provided
      if (updateData.offerImage !== undefined) {
        if (updateData.offerImage && isValidBase64Image(updateData.offerImage)) {
          // Upload new image to VPS
          const fileName = `crm-offer-${Date.now()}`;
          const imageUrl = await uploadBase64(updateData.offerImage, fileName);
          
          if (!imageUrl) {
            return Response.json(
              { message: "Failed to upload image" },
              { status: 500 }
            );
          }
          
          // Delete old image from VPS if it exists
          if (offer.offerImage) {
            await deleteFile(offer.offerImage);
          }
          
          updateData.offerImage = imageUrl;
        } else {
          // If image is null/empty, remove it
          updateData.offerImage = null;
          
          // Delete old image from VPS if it exists
          if (offer.offerImage) {
            await deleteFile(offer.offerImage);
          }
        }
      }

      // Validate applicable fields based on user role
      if (userRole === 'vendor') {
        // Handle new services and service categories
        if (Array.isArray(updateData.applicableServices)) {
          updateData.applicableServices = updateData.applicableServices;
        }
        
        if (Array.isArray(updateData.applicableServiceCategories)) {
          updateData.applicableServiceCategories = updateData.applicableServiceCategories;
        }

        // Keep legacy specialty validation for backward compatibility
        if (Array.isArray(updateData.applicableSpecialties)) {
          const specialties = updateData.applicableSpecialties;
          if (specialties.length > 0 && !specialties.every((s) => validSpecialties.includes(s))) {
            return Response.json(
              {
                message: `Invalid specialties. Must be one of: ${validSpecialties.join(", ")}`,
              },
              { status: 400 }
            );
          }
          updateData.applicableSpecialties = specialties;
        }

        // Keep legacy category validation for backward compatibility
        if (Array.isArray(updateData.applicableCategories)) {
          const categories = updateData.applicableCategories;
          if (categories.length > 0 && !categories.every((c) => validCategories.includes(c))) {
            return Response.json(
              {
                message: `Invalid categories. Must be one of: ${validCategories.join(", ")}`,
              },
              { status: 400 }
            );
          }
          updateData.applicableCategories = categories;
        }
      } else if (userRole === 'doctor') {
        // For doctors, validate diseases
        if (Array.isArray(updateData.applicableDiseases)) {
          updateData.applicableDiseases = updateData.applicableDiseases;
        }
      } else if (userRole === 'supplier') {
        // For suppliers, validate minimum order amount
        if (updateData.minOrderAmount !== undefined) {
          updateData.minOrderAmount = updateData.minOrderAmount > 0 ? updateData.minOrderAmount : null;
        }
      }

      // Handle code update only if a new, non-empty code is provided.
      if (updateData.code && updateData.code.trim()) {
        const existingOffer = await CRMOfferModel.findOne({ 
          code: updateData.code.toUpperCase().trim(),
          _id: { $ne: id }
        });
        if (existingOffer) {
          return Response.json({ message: "Offer code already exists" }, { status: 400 });
        }
        updateData.code = updateData.code.toUpperCase().trim();
        updateData.isCustomCode = true;
      } else {
        // If code is not provided or empty in the body, remove it from the updateData
        delete updateData.code;
      }

      const updatedOffer = await CRMOfferModel.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );

      return Response.json({ 
        success: true,
        message: "Offer updated successfully",
        data: updatedOffer 
      }, { status: 200 });
    } catch (error) {
      console.error('Error updating offer:', error);
      return Response.json({ 
        success: false,
        message: "Failed to update offer", 
        error: error.message 
      }, { status: 500 });
    }
  },
  ['vendor', 'doctor', 'supplier', 'staff']
);

// DELETE - Delete an offer
export const DELETE = authMiddlewareCrm(
  async (req) => {
    try {
      const ownerId = req.user.userId;
      const url = new URL(req.url);
      const id = url.searchParams.get('id') || (await req.json()).id;

      if (!id) {
        return Response.json({ message: "Offer ID is required" }, { status: 400 });
      }

      const deletedOffer = await CRMOfferModel.findOneAndDelete({ _id: id, businessId: ownerId });

      if (!deletedOffer) {
        return Response.json({ message: "Offer not found or access denied" }, { status: 404 });
      }
      
      // Delete image from VPS if it exists
      if (deletedOffer.offerImage) {
        await deleteFile(deletedOffer.offerImage);
      }

      return Response.json({ 
        success: true,
        message: "Offer deleted successfully" 
      }, { status: 200 });
    } catch (error) {
      console.error('Error deleting offer:', error);
      return Response.json({ 
        success: false,
        message: "Failed to delete offer", 
        error: error.message 
      }, { status: 500 });
    }
  },
  ['vendor', 'doctor', 'supplier', 'staff']
);
