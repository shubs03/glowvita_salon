import mongoose from "mongoose";

// Define the schema for billing items (can be either services or products)
const billingItemSchema = new mongoose.Schema({
  // Common fields for both services and products
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'items.itemType' // Dynamic reference based on itemType
  },
  itemType: {
    type: String,
    required: true,
    enum: ['Service', 'Product'],
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category' // For services
    },
    categoryName: {
      type: String,
      trim: true
    }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  // Service-specific fields
  duration: {
    type: Number, // in minutes
    min: 0
  },
  // Add-ons for services
  addOns: [{
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'AddOn' },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, min: 0 }
  }],
  // Product-specific fields
  stock: {
    type: Number,
    min: 0
  },
  productImage: {
    type: String
  },
  // Discount fields
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  discountType: {
    type: String,
    enum: ['flat', 'percentage'],
    default: 'flat'
  },
  // Staff member assignment
  staffMember: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    name: {
      type: String,
      trim: true
    },
    staffCommissionRate: {
      type: Number,
      default: 0
    },
    staffCommissionAmount: {
      type: Number,
      default: 0
    }
  }
}, { _id: false });

// Define the main billing schema
const billingSchema = new mongoose.Schema({
  // Reference to vendor
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Vendor',
    index: true
  },

  // Invoice information
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Reference to client
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Client',
    index: true
  },

  clientInfo: {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    profilePicture: {
      type: String
    },
    address: {
      type: String,
      trim: true
    }
  },

  // Billing items (services and/or products)
  items: {
    type: [billingItemSchema],
    required: true
  },

  // Financial details
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  platformFee: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },

  // Payment information
  paymentMethod: {
    type: String,
    enum: ['Cash', 'QR Code', 'Debit Card', 'Credit Card', 'Net Banking', 'Other', 'Pending'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Partial', 'Cancelled'],
    default: 'Pending',
    index: true
  },

  // Type of billing (counter bill, online order, etc.)
  billingType: {
    type: String,
    enum: ['Counter Bill', 'Online Order', 'Package', 'Membership'],
    default: 'Counter Bill',
    index: true
  },

  // Additional notes
  notes: {
    type: String,
    trim: true
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: () => Date.now(),
    index: true
  },
  updatedAt: {
    type: Date,
    default: () => Date.now()
  }
});

// Indexes for better query performance
billingSchema.index({ vendorId: 1, createdAt: -1 });
billingSchema.index({ vendorId: 1, clientId: 1 });
billingSchema.index({ invoiceNumber: 1, vendorId: 1 });
billingSchema.index({ paymentStatus: 1, createdAt: -1 });

// Pre-save middleware to update the updatedAt timestamp
billingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to generate unique invoice numbers
billingSchema.statics.generateInvoiceNumber = async function (vendorId) {
  // Use dynamic import to avoid circular dependencies
  const { default: InvoiceModel } = await import('../Invoice/Invoice.model.js');
  return await InvoiceModel.generateInvoiceNumber(vendorId);
};

// Instance method to update payment status
billingSchema.methods.updatePaymentStatus = function (status, paymentMethod = null) {
  this.paymentStatus = status;
  if (paymentMethod) {
    this.paymentMethod = paymentMethod;
  }
  if (status === 'Completed') {
    this.balance = 0;
  }
  return this.save();
};

// Instance method to add a note
billingSchema.methods.addNote = function (note) {
  if (!this.notes) {
    this.notes = note;
  } else {
    this.notes += `\n${new Date().toISOString()}: ${note}`;
  }
  return this.save();
};

// Static method to get billing summary for a vendor
billingSchema.statics.getVendorSummary = async function (vendorId, startDate, endDate) {
  const match = { vendorId: new mongoose.Types.ObjectId(vendorId) };

  if (startDate && endDate) {
    match.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalInvoices: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
        totalPaid: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "Completed"] }, "$totalAmount", 0]
          }
        },
        totalPending: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "Pending"] }, "$totalAmount", 0]
          }
        }
      }
    }
  ]);
};

const BillingModel = mongoose.models.Billing || mongoose.model("Billing", billingSchema);

export default BillingModel;