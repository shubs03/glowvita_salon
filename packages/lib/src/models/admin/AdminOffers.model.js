import mongoose from "mongoose";

const adminOfferSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["Active", "Expired", "Scheduled"],
    default: "Scheduled",
  },
  startDate: {
    type: Date,
    required: true,
  },
  expires: {
    type: Date,
    default: null,
  },
  redeemed: {
    type: Number,
    default: 0,
    min: 0,
  },
  applicableSpecialties: {
    type: [String],
    enum: ['Hair Cut', 'Spa', 'Massage', 'Facial', 'Manicure', 'Pedicure', ''], // Allow empty string for backward compatibility
    default: [],
  },
  applicableCategories: {
    type: [String],
    enum: ['Men', 'Women', 'Unisex', ''], // Allow empty string for backward compatibility
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const AdminOfferModel = mongoose.models.AdminOffer || mongoose.model("AdminOffer", adminOfferSchema);

export default AdminOfferModel;