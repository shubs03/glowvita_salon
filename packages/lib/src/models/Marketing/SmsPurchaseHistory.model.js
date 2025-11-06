import mongoose from "mongoose";

const smsTransactionSchema = new mongoose.Schema({
  userType: {
    type: String,
    required: true,
    enum: ["vendor", "supplier"]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
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

// Add virtual fields for vendorId and supplierId for easier access
smsTransactionSchema.virtual('vendorId').get(function() {
  return this.userType === 'vendor' ? this.userId : null;
});

smsTransactionSchema.virtual('supplierId').get(function() {
  return this.userType === 'supplier' ? this.userId : null;
});

// Add custom validation to ensure proper user ID based on userType
smsTransactionSchema.pre("validate", function(next) {
  // Clear any existing validation errors for vendorId and supplierId virtual fields
  if (this.errors) {
    delete this.errors.vendorId;
    delete this.errors.supplierId;
  }
  
  // Ensure userId is provided
  if (!this.userId) {
    return next(new Error("userId is required"));
  }
  
  next();
});

smsTransactionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient querying
smsTransactionSchema.index({ userId: 1, status: 1 });
smsTransactionSchema.index({ expiryDate: 1 });

// Compound indexes to prevent duplicate purchases
// For vendors: userId + packageId + purchaseDate (when userType is vendor)
smsTransactionSchema.index({ userId: 1, packageId: 1, purchaseDate: 1 }, { 
  unique: true,
  partialFilterExpression: { userType: "vendor" }
});

// For suppliers: userId + packageId + purchaseDate (when userType is supplier)
smsTransactionSchema.index({ userId: 1, packageId: 1, purchaseDate: 1 }, { 
  unique: true,
  partialFilterExpression: { userType: "supplier" }
});

// Delete any existing model to prevent caching issues
if (mongoose.models.SmsTransaction) {
  delete mongoose.models.SmsTransaction;
}

// Create new model with different name
const SmsTransaction = mongoose.model("SmsTransaction", smsTransactionSchema);

export default SmsTransaction;