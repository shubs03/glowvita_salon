
// crm/api/offers/route.js

import _db from "../../../../../../../packages/lib/src/db.js";
import CRMOfferModel from "../../../../../../../packages/lib/src/models/Vendor/CRMOffer.model.js";
import {
  authMiddlewareCrm,
  authMiddlewareCRM,
} from "../../../../middlewareCrm.js";

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
export const POST =
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
      offerImage,
      isCustomCode,
    } = body;

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

    // Validate applicableSpecialties - now supports multiple selections
    let specialties = [];
    if (
      Array.isArray(applicableSpecialties) &&
      applicableSpecialties.length > 0
    ) {
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

    // Validate applicableCategories - now supports multiple selections
    let categories = [];
    if (
      Array.isArray(applicableCategories) &&
      applicableCategories.length > 0
    ) {
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

    // Validate image if provided
    if (offerImage && !isValidBase64Image(offerImage)) {
      return Response.json(
        { message: "Invalid image format. Must be base64 encoded image." },
        { status: 400 }
      );
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
      offerImage: offerImage || null,
      isCustomCode: isCustom,
    });

    return Response.json(
      { message: "Offer created successfully", offer: newOffer },
      { status: 201 }
    );
  };

// Get All Offers
export const GET = async () => {
  const offers = await CRMOfferModel.find();
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

  // Ensure applicableSpecialties and applicableCategories are arrays
  const sanitizedOffers = offers.map((offer) => ({
    ...offer.toObject(),
    applicableSpecialties: Array.isArray(offer.applicableSpecialties)
      ? offer.applicableSpecialties
      : [],
    applicableCategories: Array.isArray(offer.applicableCategories)
      ? offer.applicableCategories
      : [],
  }));

  return Response.json(sanitizedOffers);
};

// Update Offer
export const PUT =
  async (req) => {
    const { id, ...body } = await req.json();

    // Validate applicableSpecialties - now supports multiple selections
    let specialties = [];
    if (
      Array.isArray(body.applicableSpecialties) &&
      body.applicableSpecialties.length > 0
    ) {
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

    // Validate applicableCategories - now supports multiple selections
    let categories = [];
    if (
      Array.isArray(body.applicableCategories) &&
      body.applicableCategories.length > 0
    ) {
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

    // Validate image if provided
    if (body.offerImage && !isValidBase64Image(body.offerImage)) {
      return Response.json(
        { message: "Invalid image format. Must be base64 encoded image." },
        { status: 400 }
      );
    }

    const updateData = {
      ...body,
      applicableSpecialties: specialties,
      applicableCategories: categories,
      updatedAt: Date.now(),
    };

    // Handle code update if provided
    if (body.code && body.code.trim()) {
      const existingOffer = await CRMOfferModel.findOne({
        code: body.code.toUpperCase().trim(),
        _id: { $ne: id },
      });
      if (existingOffer) {
        return Response.json(
          { message: "Offer code already exists" },
          { status: 400 }
        );
      }
      updateData.code = body.code.toUpperCase().trim();
      updateData.isCustomCode = true;
    }

    const updatedOffer = await CRMOfferModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedOffer) {
      return Response.json({ message: "Offer not found" }, { status: 404 });
    }

    return Response.json(updatedOffer);
  };

// Delete Offer
export const DELETE =
  async (req) => {
    const { id } = await req.json();

    const deletedOffer = await CRMOfferModel.findByIdAndDelete(id);
    if (!deletedOffer) {
      return Response.json({ message: "Offer not found" }, { status: 404 });
    }

    return Response.json({ message: "Offer deleted successfully" });
  };
