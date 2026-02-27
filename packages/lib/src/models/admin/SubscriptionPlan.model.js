import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  durationType: {
    type: String,
    enum: ['days', 'weeks', 'months', 'years'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountedPrice: {
    type: Number,
    min: 0
  },
  isAvailableForPurchase: {
    type: Boolean,
    default: true
  },
  planType: {
    type: String,
    enum: ['trial', 'regular'],
    required: true,
    default: 'regular'
  },
  userTypes: [{
    type: String,
    enum: ['vendor', 'supplier', 'doctor'],
    required: true
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  features: [{
    type: String,
    trim: true
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  regionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Region',
    default: null // null means Global
  },
  disabledRegions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Region'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

export default mongoose.models.SubscriptionPlan || mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
