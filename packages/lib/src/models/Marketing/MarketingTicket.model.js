import mongoose from "mongoose";

const marketingTicketSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
    index: true
  },
  salonName: {
    type: String,
    required: true,
    trim: true
  },
  contactName: {
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
    required: true,
    trim: true
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MarketingPackage",
    required: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MarketingAgent",
    default: null
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ["Pending", "Assigned", "In Progress", "Resolved", "Closed"],
    default: "Pending",
    index: true
  },
  adminNotes: {
    type: String,
    trim: true,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

marketingTicketSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const MarketingTicket = mongoose.models.MarketingTicket || mongoose.model("MarketingTicket", marketingTicketSchema);

export default MarketingTicket;
