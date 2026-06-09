import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userType',
    required: true,
    index: true
  },

  userType: {
    type: String,
    required: true,
    enum: ['User', 'Vendor', 'Supplier', 'Doctor'],
    default: 'User',
    index: true
  },
  
  regionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Region',
    required: false,
    index: true
  },
  
  // Transaction details
  transactionId: {
    type: String,
    unique: true,
    required: true,
    index: true,
    // Format: WTX_timestamp_random
  },
  
  transactionType: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
    index: true
  },
  
  amount: {
    type: Number,
    required: true,
    // Note: Positive values for credits, negative values for debits
  },
  
  // Balance tracking
  balanceBefore: {
    type: Number,
    required: true,
    default: 0
  },
  
  balanceAfter: {
    type: Number,
    required: true,
    default: 0
  },
  
  // Transaction source
  source: {
    type: String,
    enum: [
      'add_money',
      'referral_bonus',
      'refund',
      'withdrawal',
      'booking_payment',
      'product_payment',
      'cashback',
      'promotional_credit',
      'admin_credit',
      'admin_debit'
    ],
    required: true,
    index: true
  },
  
  // Payment gateway details (for add money)
  paymentGatewayOrderId: {
    type: String,
    sparse: true,
    index: true
  },
  
  paymentGatewayPaymentId: {
    type: String,
    sparse: true,
    index: true
  },
  
  // For withdrawal transactions
  paymentGatewayTransferId: {
    type: String,
    sparse: true,
    index: true
  },
  
  // Transaction status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    required: true,
    default: 'pending',
    index: true
  },
  
  // Description and metadata
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
    // Can store: referralId, bookingId, orderId, etc.
  },
  
  // Security and tracking
  ipAddress: {
    type: String,
    default: null
  },
  
  userAgent: {
    type: String,
    default: null
  },
  
  // Related references
  relatedTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WalletTransaction',
    default: null
  },
  
  withdrawalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WalletWithdrawal',
    default: null
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
walletTransactionSchema.index({ userId: 1, createdAt: -1 });
walletTransactionSchema.index({ userId: 1, transactionType: 1, createdAt: -1 });
walletTransactionSchema.index({ userId: 1, source: 1, createdAt: -1 });
walletTransactionSchema.index({ userId: 1, status: 1, createdAt: -1 });
walletTransactionSchema.index({ regionId: 1, createdAt: -1 });
walletTransactionSchema.index({ regionId: 1, transactionType: 1, createdAt: -1 });

// Pre-validate middleware to generate transactionId
walletTransactionSchema.pre('validate', function(next) {
  if (!this.transactionId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.transactionId = `WTX_${timestamp}_${random}`;
  }
  this.updatedAt = new Date();
  next();
});

const WalletTransactionModel = mongoose.models.WalletTransaction || 
  mongoose.model('WalletTransaction', walletTransactionSchema);

export default WalletTransactionModel;
