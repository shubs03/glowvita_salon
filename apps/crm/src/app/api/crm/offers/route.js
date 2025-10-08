
// crm/api/offers/route.js

import _db from "../../../../../../../packages/lib/src/db.js";
import CRMOfferModel from '@repo/lib/models/vendor/CRMOffer.model';
import {
  authMiddlewareCrm,
  authMiddlewareCRM,
} from "../../../../middlewareCrm";

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

    // Validate image if provided
    if (offerImage && !isValidBase64Image(offerImage)) {
      return Response.json(
        { message: "Invalid image format. Must be base64 encoded image." },
        { status: 400 }
      );
    }

    // Determine business type and ID for the offer
    // Staff members belong to vendor business type
    const businessType = userRole === 'staff' ? 'vendor' : userRole;
    let businessId = user.userId;
    if (userRole === 'staff' && user.vendorId) {
      businessId = user.vendorId;
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
      offerImage: offerImage || null,
      isCustomCode: isCustom,
      businessType: businessType,
      businessId: businessId,
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

// Update Offer
export const PUT = authMiddlewareCrm(
  async (req) => {
    const { id, ...body } = await req.json();
    const user = req.user;
    const userRole = req.user.role; // Get user role from middleware

    // Determine business type and ID for filtering
    const businessType = userRole === 'staff' ? 'vendor' : userRole;
    let businessId = user.userId;
    if (userRole === 'staff' && user.vendorId) {
      businessId = user.vendorId;
    }

    // Check if the offer belongs to the current user's business
    const existingOffer = await CRMOfferModel.findOne({ 
      _id: id, 
      businessType: businessType,
      businessId: businessId
    });
    
    if (!existingOffer) {
      return Response.json({ message: "Offer not found or unauthorized" }, { status: 404 });
    }

    // Validate fields based on user role
    let specialties = [];
    let categories = [];
    let diseases = [];
    let services = [];
    let serviceCategories = [];
    let orderAmount = existingOffer.minOrderAmount;

    if (userRole === 'vendor') {
      // Handle new services and service categories
      if (Array.isArray(body.applicableServices)) {
        services = body.applicableServices;
      }
      
      if (Array.isArray(body.applicableServiceCategories)) {
        serviceCategories = body.applicableServiceCategories;
      }

      // Keep legacy specialty validation for backward compatibility
      if (Array.isArray(body.applicableSpecialties) && body.applicableSpecialties.length > 0) {
        specialties = body.applicableSpecialties;
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
      if (Array.isArray(body.applicableCategories) && body.applicableCategories.length > 0) {
        categories = body.applicableCategories;
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
      // For doctors, handle diseases
      if (Array.isArray(body.applicableDiseases)) {
        diseases = body.applicableDiseases;
      }
    } else if (userRole === 'supplier') {
      // For suppliers, handle minimum order amount
      if (body.minOrderAmount !== undefined) {
        orderAmount = body.minOrderAmount;
      }
    }

    // Validate image if provided
    if (body.offerImage && !isValidBase64Image(body.offerImage)) {
      return Response.json(
        { message: "Invalid image format. Must be base64 encoded image." },
        { status: 400 }
      );
    }

    // Exclude code and other sensitive fields from body spread
    const { code, isCustomCode, ...bodyWithoutCode } = body;

    const updateData = {
      ...bodyWithoutCode,
      applicableSpecialties: specialties,
      applicableCategories: categories,
      applicableDiseases: diseases,
      applicableServices: services,
      applicableServiceCategories: serviceCategories,
      minOrderAmount: orderAmount,
      updatedAt: Date.now(),
    };

    // Handle code update if provided and not empty
    if (code && code.trim()) {
      const existingOfferWithCode = await CRMOfferModel.findOne({
        code: code.toUpperCase().trim(),
        _id: { $ne: id },
      });
      if (existingOfferWithCode) {
        return Response.json(
          { message: "Offer code already exists" },
          { status: 400 }
        );
      }
      updateData.code = code.toUpperCase().trim();
      updateData.isCustomCode = true;
    }

    const updatedOffer = await CRMOfferModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return Response.json(updatedOffer);
  },
  ['vendor', 'doctor', 'supplier']
);

// Delete Offer
export const DELETE = authMiddlewareCrm(
  async (req) => {
    const { id } = await req.json();
    const user = req.user;
    const userRole = req.user.role;

    // Determine business type and ID for filtering
    const businessType = userRole === 'staff' ? 'vendor' : userRole;
    let businessId = user.userId;
    if (userRole === 'staff' && user.vendorId) {
      businessId = user.vendorId;
    }

    // Check if the offer belongs to the current user's business
    const deletedOffer = await CRMOfferModel.findOneAndDelete({ 
      _id: id, 
      businessType: businessType,
      businessId: businessId
    });
    
    if (!deletedOffer) {
      return Response.json({ message: "Offer not found or unauthorized" }, { status: 404 });
    }

    return Response.json({ message: "Offer deleted successfully" });
  },
  ['vendor', 'doctor', 'supplier']
);