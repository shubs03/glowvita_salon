
import _db from "../../../../../../../packages/lib/src/db.js";
import OfferModel from "../../../../../../../packages/lib/src/models/admin/AdminOffers.model.js";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

// Predefined options for validation
const validCategories = ['Men', 'Women', 'Unisex'];

await _db();

// Helper function to generate random coupon code
const generateCouponCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Helper function to validate base64 image
const isValidBase64Image = (str) => {
  if (!str || typeof str !== 'string') return false;
  const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,/;
  return base64Regex.test(str);
};

// Create Offer
export const POST = authMiddlewareAdmin(
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
      isCustomCode 
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
      const existingOffer = await OfferModel.findOne({ code: finalCode });
      if (existingOffer) {
        return Response.json({ message: "Offer code already exists" }, { status: 400 });
      }
    } else {
      // Generate unique code
      let attempts = 0;
      do {
        finalCode = generateCouponCode();
        attempts++;
        if (attempts > 10) {
          return Response.json({ message: "Unable to generate unique code" }, { status: 500 });
        }
      } while (await OfferModel.findOne({ code: finalCode }));
    }

    // applicableSpecialties are now dynamic, no server-side validation against a static list.
    const specialties = Array.isArray(applicableSpecialties) ? applicableSpecialties : [];
    
    // Validate applicableCategories - now supports multiple selections
    let categories = [];
    if (Array.isArray(applicableCategories) && applicableCategories.length > 0) {
      categories = applicableCategories;
      if (!categories.every(c => validCategories.includes(c))) {
        return Response.json(
          { message: `Invalid categories. Must be one of: ${validCategories.join(', ')}` },
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
    const newOffer = await OfferModel.create({
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
  },
  ["superadmin"]
);

// Get All Offers
export const GET = authMiddlewareAdmin(
  async () => {
    const offers = await OfferModel.find().lean(); // Use .lean() for read-only operations
    const currentDate = new Date();

    const sanitizedOffers = offers.map(offer => {
      let newStatus = "Scheduled";
      if (offer.startDate <= currentDate) {
        if (!offer.expires || offer.expires >= currentDate) {
          newStatus = "Active";
        } else {
          newStatus = "Expired";
        }
      }

      return {
        ...offer,
        status: newStatus,
        applicableSpecialties: Array.isArray(offer.applicableSpecialties) ? offer.applicableSpecialties : [],
        applicableCategories: Array.isArray(offer.applicableCategories) ? offer.applicableCategories : [],
      };
    });

    return Response.json(sanitizedOffers);
  },
  ["superadmin", "admin"]
);

// Update Offer
export const PUT = authMiddlewareAdmin(
  async (req) => {
    const { id, ...body } = await req.json();

    // applicableSpecialties are now dynamic, no server-side validation against a static list.
    const specialties = Array.isArray(body.applicableSpecialties) ? body.applicableSpecialties : [];

    // Validate applicableCategories - now supports multiple selections
    let categories = [];
    if (Array.isArray(body.applicableCategories) && body.applicableCategories.length > 0) {
      categories = body.applicableCategories;
      if (!categories.every(c => validCategories.includes(c))) {
        return Response.json(
          { message: `Invalid categories. Must be one of: ${validCategories.join(', ')}` },
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

    // Handle code update only if a new, non-empty code is provided.
    // This prevents overwriting existing codes with empty strings.
    if (body.code && body.code.trim()) {
      const existingOffer = await OfferModel.findOne({ 
        code: body.code.toUpperCase().trim(),
        _id: { $ne: id }
      });
      if (existingOffer) {
        return Response.json({ message: "Offer code already exists" }, { status: 400 });
      }
      updateData.code = body.code.toUpperCase().trim();
      updateData.isCustomCode = true;
    } else {
        // If code is not provided or empty in the body, remove it from the updateData
        // to prevent it from overwriting the existing code in the database.
        delete updateData.code;
    }

    const updatedOffer = await OfferModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedOffer) {
      return Response.json({ message: "Offer not found" }, { status: 404 });
    }

    return Response.json(updatedOffer);
  },
  ["superadmin"]
);


// Delete Offer
export const DELETE = authMiddlewareAdmin(
  async (req) => {
    const { id } = await req.json();

    const deletedOffer = await OfferModel.findByIdAndDelete(id);
    if (!deletedOffer) {
      return Response.json({ message: "Offer not found" }, { status: 404 });
    }

    return Response.json({ message: "Offer deleted successfully" });
  },
  ["superadmin"]
);
