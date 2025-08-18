import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{6}$/, "Please enter a valid 6-digit pincode"],
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/[^\s$.?#].[^\s]*$/, "Please enter a valid URL"],
    default: null,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: null,
  },
  profileImage: {
    type: String, // Base64 encoded image string
    default: null,
  },
  subscription: {
    plan: {
      type: String,
      enum: ["Basic", "Pro Monthly", "Pro Yearly"],
      default: "Basic",
    },
    status: {
      type: String,
      enum: ["Active", "Expired", "Pending"],
      default: "Pending",
    },
    expires: {
      type: Date,
      default: null,
    },
  },
  gallery: [{
    type: String, // Base64 encoded image strings or URLs
    default: null,
  }],
  bankDetails: {
    bankName: {
      type: String,
      trim: true,
      default: null,
    },
    accountNumber: {
      type: String,
      trim: true,
      default: null,
    },
    ifscCode: {
      type: String,
      trim: true,
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Please enter a valid IFSC code"],
      default: null,
    },
    accountHolder: {
      type: String,
      trim: true,
      default: null,
    },
  },
  documents: {
    aadharCard: {
      type: String, // File path or base64 string
      default: null,
    },
    udyogAadhar: {
      type: String,
      default: null,
    },
    udhayamCert: {
      type: String,
      default: null,
    },
    shopLicense: {
      type: String,
      default: null,
    },
    panCard: {
      type: String,
      default: null,
    },
    otherDocs: [{
      type: String,
      default: null,
    }],
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

const VendorModel = mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);

export default VendorModel;