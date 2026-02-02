
import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  serviceImage: {
    type: String, // URL to the uploaded image
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ["approved", "disapproved"],
    default: "approved",
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

serviceSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const ServiceModel = mongoose.models.Service || mongoose.model("Service", serviceSchema);

export default ServiceModel;
