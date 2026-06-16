import mongoose from "mongoose";

const marketingPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
  platforms: [{
    type: String,
    enum: ["Instagram", "Facebook", "YouTube", "Twitter/X", "LinkedIn", "WhatsApp"],
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
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

marketingPackageSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const MarketingPackage = mongoose.models.MarketingPackage || mongoose.model("MarketingPackage", marketingPackageSchema);

export default MarketingPackage;
