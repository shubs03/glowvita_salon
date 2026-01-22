import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  mobile: { type: String, required: true, trim: true },
  shopName: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  country: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  pincode: { type: String, required: true, trim: true },
  location: {
    lat: {
      type: Number,
      required: false,
    },
    lng: {
      type: Number,
      required: false,
    },
  },
  address: { type: String, required: true, trim: true },
  businessRegistrationNo: { type: String, trim: true },
  supplierType: { type: String, required: true },
  profileImage: { type: String }, // URL to the uploaded image
  licenseFiles: [{ type: String }], // Changed to array for multiple files
  password: { type: String, required: true, select: false },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  products: { type: Number, default: 0 },
  sales: { type: Number, default: 0 },
  smsBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ["Approved", "Pending", "Rejected"],
    default: "Pending",
  },
  regionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Region",
    required: true,
    index: true,
  },
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
  referralCode: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});



// Pre-save middleware to auto-update subscription status and ensure consistency
supplierSchema.pre("validate", async function (next) {
  // Auto-update subscription status based on endDate
  if (this.subscription && this.subscription.endDate) {
    const now = new Date();
    const endDate = new Date(this.subscription.endDate);

    // Auto-update status to Expired if endDate has passed
    if (endDate <= now && this.subscription.status !== 'Expired') {
      this.subscription.status = 'Expired';
    }
  }

  // Only assign default subscription if none exists or if it's invalid
  if (!this.subscription || !this.subscription.plan || !this.subscription.endDate) {
    try {
      // Import SubscriptionPlan model dynamically to avoid circular dependencies
      const SubscriptionPlan = (await import("@repo/lib/models/admin/SubscriptionPlan.model")).default;

      // Check if a trial plan already exists
      let trialPlan = await SubscriptionPlan.findOne({ name: 'Trial Plan' });

      // If no trial plan exists, create one
      if (!trialPlan) {
        trialPlan = await SubscriptionPlan.create({
          name: 'Trial Plan',
          description: 'Default trial plan for new suppliers',
          price: 0,
          duration: 30, // 30 days
          features: ['Basic features'],
          userType: 'supplier',
          status: 'active'
        });
      }

      // Set default subscription
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + trialPlan.duration);

      this.subscription = {
        plan: trialPlan._id,
        status: 'Active',
        startDate: new Date(),
        endDate: endDate,
        history: []
      };
    } catch (error) {
      console.error("Error assigning default subscription to supplier:", error);
      // Don't block supplier creation if subscription assignment fails
    }
  }

  // Auto-assign regionId based on location if missing or location changed
  if (!this.regionId || this.isModified("location")) {
    try {
      const { assignRegion } = await import("../../utils/assignRegion.js");
      const assignedRegionId = await assignRegion(this.city, this.state, this.location);
      if (assignedRegionId) {
        this.regionId = assignedRegionId;
      }
    } catch (error) {
      console.error("[SupplierModel] Error auto-assigning region:", error);
    }
  }

  this.updatedAt = new Date();
  next();
});

// Instance method to get normalized subscription data
supplierSchema.methods.getSubscriptionData = function () {
  if (!this.subscription) {
    return {
      status: 'Expired',
      isExpired: true,
      endDate: null,
      plan: null
    };
  }

  const now = new Date();
  const endDate = this.subscription.endDate ? new Date(this.subscription.endDate) : null;
  const isExpired = !endDate || endDate <= now || this.subscription.status?.toLowerCase() === 'expired';

  return {
    status: isExpired ? 'Expired' : this.subscription.status,
    isExpired,
    endDate: this.subscription.endDate,
    startDate: this.subscription.startDate,
    plan: this.subscription.plan
  };
};

// Static method for optimized subscription queries
supplierSchema.statics.findByIdWithSubscription = function (id) {
  return this.findById(id)
    .select('subscription status email shopName firstName lastName')
    .populate('subscription.plan', 'name duration price')
    .lean();
};

// Indexes for performance
supplierSchema.index({ 'subscription.status': 1, 'subscription.endDate': 1 });
// Email index removed as it is already defined in the schema with unique: true
supplierSchema.index({ status: 1 });

const SupplierModel = mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema);

export default SupplierModel;