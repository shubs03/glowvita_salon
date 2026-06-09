import mongoose from "mongoose";

const marketingAgentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  specialties: [{
    type: String,
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

marketingAgentSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const MarketingAgent = mongoose.models.MarketingAgent || mongoose.model("MarketingAgent", marketingAgentSchema);

export default MarketingAgent;
