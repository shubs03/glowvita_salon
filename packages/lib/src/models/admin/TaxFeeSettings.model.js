import mongoose from 'mongoose';

// Check if we're running on the server side
const isServer = typeof window === 'undefined';

let TaxFeeSettings;

if (isServer && mongoose && mongoose.model) {
  // Define schema only on the server side
  const taxFeeSchema = new mongoose.Schema(
    {
      platformFee: {
        type: Number,
        required: true,
        min: 0,
        default: 15,
      },
      platformFeeType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true,
        default: 'percentage',
      },
      platformFeeEnabled: {
        type: Boolean,
        required: true,
        default: true,
      },
      serviceTax: {
        type: Number,
        required: true,
        min: 0,
        default: 18,
      },
      serviceTaxType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true,
        default: 'percentage',
      },
      serviceTaxEnabled: {
        type: Boolean,
        required: true,
        default: true,
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null,
      },
    },
    {
      timestamps: true,
      collection: 'tax_fee_settings',
    }
  );

  // Index for faster querying
  taxFeeSchema.index({ updatedAt: -1 });

  // Static method to get the latest settings
  taxFeeSchema.statics.getLatestSettings = async function () {
    return this.findOne().sort({ updatedAt: -1 });
  };

  // Instance method to calculate fees
  taxFeeSchema.methods.calculateFees = function (amount) {
    const breakdown = {
      subtotal: amount,
      platformFee: 0,
      serviceTax: 0,
      total: amount,
    };

    // Calculate platform fee if enabled
    if (this.platformFeeEnabled) {
      breakdown.platformFee =
        this.platformFeeType === 'percentage'
          ? (amount * this.platformFee) / 100
          : this.platformFee;
    }

    // Calculate service tax if enabled (applied after platform fee)
    if (this.serviceTaxEnabled) {
      const amountAfterPlatformFee = amount + breakdown.platformFee;
      breakdown.serviceTax =
        this.serviceTaxType === 'percentage'
          ? (amountAfterPlatformFee * this.serviceTax) / 100
          : this.serviceTax;
    }

    breakdown.total = breakdown.subtotal + breakdown.platformFee + breakdown.serviceTax;
    return breakdown;
  };

  // Create the model only on the server side
  TaxFeeSettings = mongoose.models.TaxFeeSettings || mongoose.model('TaxFeeSettings', taxFeeSchema);
} else {
  // Provide a fallback implementation for the browser
  TaxFeeSettings = {
    getLatestSettings: async () => ({
      platformFee: 0,
      platformFeeType: 'percentage',
      platformFeeEnabled: false,
      serviceTax: 0,
      serviceTaxType: 'percentage',
      serviceTaxEnabled: false
    })
  };
}

export default TaxFeeSettings;