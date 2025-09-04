import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  type: [{ 
    type: String,
    required: true,
    enum: ['SMS', 'Email', 'Push', 'Social']
  }],
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SmsTemplate',
    default: null
  },
  content: { 
    type: String, 
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Paused', 'Completed', 'Cancelled'],
    default: 'Draft'
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  targetAudience: {
    type: String,
    required: true,
    default: 'All Customers'
  },
  scheduledDate: {
    type: Date,
    default: Date.now
  },
  budget: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  metrics: {
    messagesSent: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    opened: {
      type: Number,
      default: 0
    },
    clicked: {
      type: Number,
      default: 0
    },
    deliveryRate: {
      type: Number,
      default: 0
    },
    openRate: {
      type: Number,
      default: 0
    },
    clickRate: {
      type: Number,
      default: 0
    }
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

campaignSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Add indexes for better query performance
campaignSchema.index({ vendorId: 1, status: 1 });
campaignSchema.index({ createdAt: -1 });

const Campaign = mongoose.models.Campaign || mongoose.model("Campaign", campaignSchema);

export default Campaign;