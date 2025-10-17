import mongoose from "mongoose";

const smsPurchaseHistorySchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
    index: true
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SmsPackage",
    required: true
  },
  packageName: {
    type: String,
    required: true,
    trim: true
  },
  smsCount: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["active", "expired", "used"],
    default: "active"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

smsPurchaseHistorySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient querying
smsPurchaseHistorySchema.index({ vendorId: 1, status: 1 });
smsPurchaseHistorySchema.index({ expiryDate: 1 });

const SmsPurchaseHistory = mongoose.models.SmsPurchaseHistory || mongoose.model("SmsPurchaseHistory", smsPurchaseHistorySchema);

export default SmsPurchaseHistory;