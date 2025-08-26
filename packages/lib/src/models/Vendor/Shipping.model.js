import mongoose from 'mongoose';

const shippingSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  chargeType: {
    type: String,
    enum: ['fixed', 'percentage'],
    required: [true, 'Charge type is required'],
    default: 'fixed',
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  isEnabled: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to ensure amount is valid based on charge type
shippingSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  if (this.chargeType === 'percentage' && this.amount > 100) {
    this.amount = 100; // Cap percentage at 100%
  }
  next();
});

// Method to calculate shipping cost
shippingSchema.methods.calculateShipping = function (orderTotal) {
  if (!this.isEnabled) return 0;
  return this.chargeType === 'percentage'
    ? (this.amount / 100) * orderTotal
    : this.amount;
};

// Static method to create or retrieve a single document
shippingSchema.statics.getOrCreateConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({
      chargeType: 'fixed',
      amount: 0,
      isEnabled: false,
    });
  }
  return config;
};

const ShippingConfigModel = mongoose.models.ShippingConfig || mongoose.model('ShippingConfig', shippingSchema, 'shipping_config');

export default ShippingConfigModel;