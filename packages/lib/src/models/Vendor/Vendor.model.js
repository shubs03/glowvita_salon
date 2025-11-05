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
    // Add document status fields
    aadharCardStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    udyogAadharStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    udhayamCertStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    shopLicenseStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    panCardStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // Add rejection reason fields
    aadharCardRejectionReason: {
      type: String,
      default: null,
    },
    udyogAadharRejectionReason: {
      type: String,
      default: null,
    },
    udhayamCertRejectionReason: {
      type: String,
      default: null,
    },
    shopLicenseRejectionReason: {
      type: String,
      default: null,
    },
    panCardRejectionReason: {
      type: String,
      default: null,
    },
    // Add admin rejection reason fields (separate from vendor rejection reasons)
    aadharCardAdminRejectionReason: {
      type: String,
      default: null,
    },
    udyogAadharAdminRejectionReason: {
      type: String,
      default: null,
    },
    udhayamCertAdminRejectionReason: {
      type: String,
      default: null,
    },
    shopLicenseAdminRejectionReason: {
      type: String,
      default: null,
    },
    panCardAdminRejectionReason: {
      type: String,
      default: null,
    },
  },
  referralCode: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // Allows multiple documents to have a null value for this field
  },
  smsBalance: {
    type: Number,
    default: 0,
    min: 0
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

// Add validation to ensure rejection reasons are provided when status is rejected
vendorSchema.pre('validate', function(next) {
  const docs = this.documents;
  
  if (docs) {
    // Check Aadhar Card
    if (docs.aadharCardStatus === 'rejected' && !docs.aadharCardRejectionReason) {
      return next(new Error('Rejection reason is required for rejected Aadhar Card'));
    }
    
    // Check Udyog Aadhar
    if (docs.udyogAadharStatus === 'rejected' && !docs.udyogAadharRejectionReason) {
      return next(new Error('Rejection reason is required for rejected Udyog Aadhar'));
    }
    
    // Check Udhayam Certificate
    if (docs.udhayamCertStatus === 'rejected' && !docs.udhayamCertRejectionReason) {
      return next(new Error('Rejection reason is required for rejected Udhayam Certificate'));
    }
    
    // Check Shop License
    if (docs.shopLicenseStatus === 'rejected' && !docs.shopLicenseRejectionReason) {
      return next(new Error('Rejection reason is required for rejected Shop License'));
    }
    
    // Check PAN Card
    if (docs.panCardStatus === 'rejected' && !docs.panCardRejectionReason) {
      return next(new Error('Rejection reason is required for rejected PAN Card'));
    }
  }
  
  next();
});

vendorSchema.index({ status: 1 });

const VendorModel =
  mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);

export default VendorModel;
