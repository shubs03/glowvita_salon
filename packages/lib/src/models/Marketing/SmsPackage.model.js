import mongoose from "mongoose";

const smsPackageSchema = new mongoose.Schema({
  name: { 
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
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  validityDays: { 
    type: Number, 
    required: true,
    min: 1
  },
  isPopular: { 
    type: Boolean, 
    default: false 
  },
  features: [{ 
    type: String,
    trim: true 
  }],
  status: {
    type: String,
    enum: ["active", "inactive"],
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

smsPackageSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const SmsPackage = mongoose.models.SmsPackage || mongoose.model("SmsPackage", smsPackageSchema);

export default SmsPackage;
