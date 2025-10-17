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
  status: {
    type: String,
    enum: ["Approved", "Pending", "Rejected"],
    default: "Pending",
  },
  subscription: {
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true
    },
    status: {
      type: String,
      enum: ["Active", "Expired"],
      default: "Active",
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

supplierSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const SupplierModel = mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema);

export default SupplierModel;