import _db from "../../../../../../../packages/lib/src/db.js";
import OfferModel from "../../../../../../../packages/lib/src/models/admin/AdminOffers.model.js";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

// Predefined options for validation
const validSpecialties = ['Hair Cut', 'Spa', 'Massage', 'Facial', 'Manicure', 'Pedicure'];
const validCategories = ['Men', 'Women', 'Unisex'];

await _db();

// Create Offer
export const POST = authMiddlewareAdmin(
  async (req) => {
    const body = await req.json();
    const { code, type, value, status, startDate, expires, applicableSpecialties, applicableCategories } = body;

    // Validate required fields
    if (!code || !type || value == null || !startDate) {
      return Response.json(
        { message: "Required fields missing" },
        { status: 400 }
      );
    }

    // Check for duplicate code
    const existingOffer = await OfferModel.findOne({ code: code.toUpperCase() });
    if (existingOffer) {
      return Response.json({ message: "Offer code already exists" }, { status: 400 });
    }

    // Validate applicableSpecialties
    const specialties = applicableSpecialties === 'all' ? [] : Array.isArray(applicableSpecialties) ? applicableSpecialties : [];
    if (specialties.length > 0 && !specialties.every(s => validSpecialties.includes(s))) {
      return Response.json(
        { message: `Invalid specialties. Must be one of: ${validSpecialties.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate applicableCategories
    const categories = applicableCategories === 'all' ? [] : Array.isArray(applicableCategories) ? applicableCategories : [];
    if (categories.length > 0 && !categories.every(c => validCategories.includes(c))) {
      return Response.json(
        { message: `Invalid categories. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Create offer
    const newOffer = await OfferModel.create({
      code: code.toUpperCase(),
      type,
      value,
      status: status || "Scheduled",
      startDate,
      expires: expires || null,
      applicableSpecialties: specialties,
      applicableCategories: categories,
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
    const offers = await OfferModel.find();
    const currentDate = new Date("2025-08-14");

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
    const sanitizedOffers = offers.map(offer => ({
      ...offer.toObject(),
      applicableSpecialties: Array.isArray(offer.applicableSpecialties) ? offer.applicableSpecialties : [],
      applicableCategories: Array.isArray(offer.applicableCategories) ? offer.applicableCategories : [],
    }));

    return Response.json(sanitizedOffers);
  },
  ["superadmin", "admin"]
);

// Update Offer
export const PUT = authMiddlewareAdmin(
  async (req) => {
    const { id, ...body } = await req.json();

    // Validate applicableSpecialties
    const specialties = body.applicableSpecialties === 'all' ? [] : Array.isArray(body.applicableSpecialties) ? body.applicableSpecialties : [];
    if (specialties.length > 0 && !specialties.every(s => validSpecialties.includes(s))) {
      return Response.json(
        { message: `Invalid specialties. Must be one of: ${validSpecialties.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate applicableCategories
    const categories = body.applicableCategories === 'all' ? [] : Array.isArray(body.applicableCategories) ? body.applicableCategories : [];
    if (categories.length > 0 && !categories.every(c => validCategories.includes(c))) {
      return Response.json(
        { message: `Invalid categories. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    const updateData = {
      ...body,
      applicableSpecialties: specialties,
      applicableCategories: categories,
      updatedAt: Date.now(),
    };

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