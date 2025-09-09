import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
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
      required: true,
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
      type: String,
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
clientSchema.index({ vendorId: 1, email: 1 }, { unique: true });
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

// Pre-save middleware (empty now as we removed searchText)
clientSchema.pre("save", function (next) {
  next();
});

// Instance methods
clientSchema.methods.updateVisitStats = function(amount = 0) {
  this.totalBookings += 1;
  this.totalSpent += amount;
  this.lastVisit = new Date();
  if (this.status === 'New') {
    this.status = 'Active';
  }
  return this.save();
};

// Static methods
clientSchema.statics.findByVendor = function(vendorId, options = {}) {
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

clientSchema.statics.getTopClients = function(vendorId, limit = 10) {
  return this.find({ vendorId, status: 'Active' })
    .sort({ totalSpent: -1, totalBookings: -1 })
    .limit(limit);
};

const ClientModel = mongoose.models.Client || mongoose.model("Client", clientSchema);

export default ClientModel;