import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  businessName: {
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
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ["unisex", "men", "women"],
    required: true,
  },
  shippingCharge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ShippingConfig",
  },
  subCategories: [
    {
      type: String,
      enum: ["shop", "shop-at-home", "onsite"],
      required: true,
    },
  ],
  status: {
    type: String,
    enum: ["Approved", "Pending", "Rejected"],
    default: "Pending",
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "Password must be at least 8 characters"],
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/[^\s$.?#].[^\s]*$/, "Please enter a valid URL"],
    default: null,
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
  services: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      default: null,
    },
  ],
  subscription: {
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true
    },
    status: {
      type: String,
      enum: ["Active", "Expired", "Pending"],
      default: "Pending",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true
    },
    history: {
      type: [{
        plan: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SubscriptionPlan",
          required: true
        },
        startDate: {
          type: Date,
          required: true
        },
        endDate: {
          type: Date,
          required: true
        },
        status: {
          type: String,
          enum: ["Active", "Expired"],
          required: true
        }
      }],
      default: [],
    }
  },
  gallery: [
    {
      type: String, // Base64 encoded image strings or URLs
      default: null,
    },
  ],
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
    otherDocs: [
      {
        type: String,
        default: null,
      },
    ],
  },
  referralCode: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // Allows multiple documents to have a null value for this field
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

vendorSchema.index({ status: 1 });

const VendorModel =
  mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);

export default VendorModel;
