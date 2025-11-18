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
      productPlatformFee: {
        type: Number,
        required: true,
        min: 0,
        default: 10,
      },
      productPlatformFeeType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true,
        default: 'percentage',
      },
      productPlatformFeeEnabled: {
        type: Boolean,
        required: true,
        default: true,
      },
      productGST: {
        type: Number,
        required: true,
        min: 0,
        default: 18,
      },
      productGSTType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true,
        default: 'percentage',
      },
      productGSTEnabled: {
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
      productPlatformFee: 0,
      productGST: 0,
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

    // Calculate product platform fee if enabled
    if (this.productPlatformFeeEnabled) {
      breakdown.productPlatformFee =
        this.productPlatformFeeType === 'percentage'
          ? (amount * this.productPlatformFee) / 100
          : this.productPlatformFee;
    }

    // Calculate product GST if enabled
    if (this.productGSTEnabled) {
      const amountAfterProductPlatformFee = amount + breakdown.productPlatformFee;
      breakdown.productGST =
        this.productGSTType === 'percentage'
          ? (amountAfterProductPlatformFee * this.productGST) / 100
          : this.productGST;
    }

    breakdown.total = breakdown.subtotal + breakdown.platformFee + breakdown.gst + breakdown.productPlatformFee + breakdown.productGST;
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
        serviceTaxEnabled: true,
        productPlatformFee: 10,
        productPlatformFeeType: 'percentage',
        productPlatformFeeEnabled: true,
        productGST: 18,
        productGSTType: 'percentage',
        productGSTEnabled: true
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
        serviceTaxEnabled: true,
        productPlatformFee: 10,
        productPlatformFeeType: 'percentage',
        productPlatformFeeEnabled: true,
        productGST: 18,
        productGSTType: 'percentage',
        productGSTEnabled: true
      };
      
      const breakdown = {
        subtotal: amount,
        platformFee: 0,
        gst: 0, // This is the serviceTax
        productPlatformFee: 0,
        productGST: 0,
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

      // Calculate product platform fee if enabled
      if (taxSettings.productPlatformFeeEnabled) {
        breakdown.productPlatformFee =
          taxSettings.productPlatformFeeType === 'percentage'
            ? (amount * taxSettings.productPlatformFee) / 100
            : taxSettings.productPlatformFee;
      }

      // Calculate product GST if enabled
      if (taxSettings.productGSTEnabled) {
        const amountAfterProductPlatformFee = amount + breakdown.productPlatformFee;
        breakdown.productGST =
          taxSettings.productGSTType === 'percentage'
            ? (amountAfterProductPlatformFee * taxSettings.productGST) / 100
            : taxSettings.productGST;
      }

      breakdown.total = breakdown.subtotal + breakdown.platformFee + breakdown.gst + breakdown.productPlatformFee + breakdown.productGST;
      return breakdown;
    }
  };
}

export default TaxFeeSettings;