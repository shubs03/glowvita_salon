import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region",
      required: true,
      index: true,
    },
    // Link to User model for logged-in users who book appointments
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: false, // Email is optional
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    birthdayDate: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Other',
    },
    country: {
      type: String,
      trim: true,
      default: '',
    },
    occupation: {
      type: String,
      trim: true,
      default: '',
    },
    profilePicture: {
      type: String, // URL to the uploaded image
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    lastVisit: {
      type: Date,
      default: Date.now,
      index: true,
    },
    totalBookings: {
      type: Number,
      default: 0,
      index: true,
    },
    totalSpent: {
      type: Number,
      default: 0,
      index: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'New'],
      default: 'New',
      index: true,
    },
    preferences: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
    read: "secondaryPreferred",
  }
);

// COMPOUND INDEXES for common query patterns
clientSchema.index({ vendorId: 1, status: 1 });
clientSchema.index({ vendorId: 1, email: 1 }, { unique: true, sparse: true });
clientSchema.index({ vendorId: 1, phone: 1 }, { unique: true });
clientSchema.index({ vendorId: 1, totalSpent: -1 });
clientSchema.index({ vendorId: 1, totalBookings: -1 });
clientSchema.index({ vendorId: 1, lastVisit: -1 });

// Full-text search index
clientSchema.index({
  fullName: "text",
  email: "text",
  phone: "text",
  occupation: "text",
});

// Pre-save middleware to automate regionId inheritance
clientSchema.pre("save", async function (next) {
  try {
    // 1. Inherit regionId from Vendor or Supplier if missing
    if (!this.regionId && this.vendorId) {
      // Try Vendor first
      const Vendor = mongoose.models.Vendor || (await import('./Vendor.model.js')).default;
      let profile = await Vendor.findById(this.vendorId).select('regionId');

      // If not found in Vendor, try Supplier
      if (!profile) {
        const Supplier = mongoose.models.Supplier || (await import('./Supplier.model.js')).default;
        profile = await Supplier.findById(this.vendorId).select('regionId');
      }

      if (profile && profile.regionId) {
        this.regionId = profile.regionId;
      }
    }
    next();
  } catch (error) {
    console.error("Error in Client pre-save middleware:", error);
    next(error);
  }
});

// Instance methods
clientSchema.methods.updateVisitStats = function (amount = 0) {
  this.totalBookings += 1;
  this.totalSpent += amount;
  this.lastVisit = new Date();
  if (this.status === 'New') {
    this.status = 'Active';
  }
  return this.save();
};

// Static methods
clientSchema.statics.findByVendor = function (vendorId, options = {}) {
  const query = { vendorId };

  if (options.status) query.status = options.status;
  if (options.searchTerm) {
    query.$or = [
      { fullName: { $regex: options.searchTerm, $options: 'i' } },
      { email: { $regex: options.searchTerm, $options: 'i' } },
      { phone: { $regex: options.searchTerm, $options: 'i' } },
    ];
  }

  return this.find(query)
    .sort(options.sort || { lastVisit: -1 })
    .limit(options.limit || 100);
};

clientSchema.statics.getTopClients = function (vendorId, limit = 10) {
  return this.find({ vendorId, status: 'Active' })
    .sort({ totalSpent: -1, totalBookings: -1 })
    .limit(limit);
};

const ClientModel = mongoose.models.Client || mongoose.model("Client", clientSchema);

export default ClientModel;