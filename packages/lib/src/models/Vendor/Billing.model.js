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
billingSchema.statics.generateInvoiceNumber = async function(vendorId) {
  const crypto = require('crypto');
  
  // Get current date in YYYYMMDD format
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Extract first 4 characters of vendorId and convert to uppercase
  const vendorCode = vendorId.toString().slice(0, 4).toUpperCase();
  
  // Generate random sections (2-3 sections with mixed case letters and numbers)
  const generateRandomSection = (length) => {
    return crypto.randomBytes(length)
      .toString('base64')
      .replace(/\+/g, 'A')
      .replace(/\//g, 'B')
      .substring(0, length);
  };
  
  // Create 2-3 random sections
  const section1 = generateRandomSection(8);
  const section2 = generateRandomSection(8);
  
  // Randomly decide whether to include a third section (50% chance)
  const includeThirdSection = Math.random() > 0.5;
  const section3 = includeThirdSection ? `-${generateRandomSection(8)}` : '';
  
  // Construct the invoice number
  return `#INV-${dateStr}-${vendorCode}-${section1}-${section2}${section3}`;
};

// Instance method to update payment status
billingSchema.methods.updatePaymentStatus = function(status, paymentMethod = null) {
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
billingSchema.methods.addNote = function(note) {
  if (!this.notes) {
    this.notes = note;
  } else {
    this.notes += `\n${new Date().toISOString()}: ${note}`;
  }
  return this.save();
};

// Static method to get billing summary for a vendor
billingSchema.statics.getVendorSummary = async function(vendorId, startDate, endDate) {
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