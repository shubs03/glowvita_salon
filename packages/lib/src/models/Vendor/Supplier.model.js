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
  profileImage: { type: String }, // Add profileImage field
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
  subscription: {
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: false // Made this not required by default
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
      required: false // Made this not required by default
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

// Pre-validate middleware to handle subscription validation properly
supplierSchema.pre("validate", function(next) {
  // If subscription object exists but is empty or incomplete, remove it to avoid validation issues
  if (this.subscription) {
    const hasValidSubscription = this.subscription.plan && this.subscription.endDate;
    
    // If subscription exists but doesn't have required fields, remove it
    if (!hasValidSubscription) {
      this.subscription = undefined;
    }
  }
  next();
});

// Pre-save middleware to ensure suppliers always have a valid subscription
supplierSchema.pre("save", async function(next) {
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
  
  this.updatedAt = new Date();
  next();
});

const SupplierModel = mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema);

export default SupplierModel;