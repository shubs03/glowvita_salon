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
      gst: 0, // This is the serviceTax
      total: amount,
    };

    // Calculate platform fee if enabled
    if (this.platformFeeEnabled) {
      breakdown.platformFee =
        this.platformFeeType === 'percentage'
          ? (amount * this.platformFee) / 100
          : this.platformFee;
    }

    // Calculate GST if enabled (applied after platform fee)
    if (this.serviceTaxEnabled) {
      const amountAfterPlatformFee = amount + breakdown.platformFee;
      breakdown.gst =
        this.serviceTaxType === 'percentage'
          ? (amountAfterPlatformFee * this.serviceTax) / 100
          : this.serviceTax;
    }

    breakdown.total = breakdown.subtotal + breakdown.platformFee + breakdown.gst;
    return breakdown;
  };

  // Create the model only on the server side
  TaxFeeSettings = mongoose.models.TaxFeeSettings || mongoose.model('TaxFeeSettings', taxFeeSchema);
} else {
  // Provide a fallback implementation for the browser
  TaxFeeSettings = {
    getLatestSettings: async () => {
      // In browser environment, warn that RTK Query should be used instead
      console.warn('Using fallback TaxFeeSettings in browser. Use useGetTaxFeeSettingsQuery hook instead.');
      
      // Return default values with fees enabled
      return {
        platformFee: 15,
        platformFeeType: 'percentage',
        platformFeeEnabled: true,
        serviceTax: 18,
        serviceTaxType: 'percentage',
        serviceTaxEnabled: true
      };
    },
    // Add a calculateFees method for the browser fallback that properly applies fees when enabled
    calculateFees: function(amount, settings = null) {
      // Use provided settings or default values that match the schema defaults
      const taxSettings = settings || {
        platformFee: 15,
        platformFeeType: 'percentage',
        platformFeeEnabled: true,
        serviceTax: 18,
        serviceTaxType: 'percentage',
        serviceTaxEnabled: true
      };
      
      const breakdown = {
        subtotal: amount,
        platformFee: 0,
        gst: 0, // This is the serviceTax
        total: amount,
      };

      // Calculate platform fee if enabled
      if (taxSettings.platformFeeEnabled) {
        breakdown.platformFee =
          taxSettings.platformFeeType === 'percentage'
            ? (amount * taxSettings.platformFee) / 100
            : taxSettings.platformFee;
      }

      // Calculate GST if enabled (applied after platform fee)
      if (taxSettings.serviceTaxEnabled) {
        const amountAfterPlatformFee = amount + breakdown.platformFee;
        breakdown.gst =
          taxSettings.serviceTaxType === 'percentage'
            ? (amountAfterPlatformFee * taxSettings.serviceTax) / 100
            : taxSettings.serviceTax;
      }

      breakdown.total = breakdown.subtotal + breakdown.platformFee + breakdown.gst;
      return breakdown;
    }
  };
}

export default TaxFeeSettings;