import mongoose from 'mongoose';

const walletWithdrawalSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Withdrawal details
  withdrawalId: {
    type: String,
    unique: true,
    required: true,
    index: true,
    // Format: WD_timestamp_random
  },

  amount: {
    type: Number,
    required: true,
    min: 0
  },

  withdrawalFee: {
    type: Number,
    default: 0,
    min: 0
  },

  netAmount: {
    type: Number,
    required: true,
    min: 0
    // netAmount = amount - withdrawalFee
  },

  // Bank details (encrypted in production)
  bankDetails: {
    accountNumber: {
      type: String,
      trim: true,
      default: null
    },
    ifsc: {
      type: String,
      trim: true,
      uppercase: true,
      default: null
    },
    accountHolderName: {
      type: String,
      required: true,
      trim: true
    },
    bankName: {
      type: String,
      trim: true,
      default: ''
    },
    upiId: {
      type: String,
      trim: true,
      default: null
    }
  },

  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'rejected_by_system', 'cancelled'],
    required: true,
    default: 'pending',
    index: true
  },

  // Timestamps
  requestedAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  processedAt: {
    type: Date,
    default: null
  },

  completedAt: {
    type: Date,
    default: null
  },

  // Failure/Rejection details
  failureReason: {
    type: String,
    default: null
  },

  rejectionReason: {
    type: String,
    default: null
  },

  // Payment gateway details (Razorpay Payout)
  razorpayPayoutId: {
    type: String,
    sparse: true,
    index: true
  },

  razorpayTransferId: {
    type: String,
    default: null
    // UTR number from bank
  },

  razorpayResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },

  // Related transaction
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WalletTransaction',
    default: null
  },

  // Fraud detection
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  riskFlags: {
    type: [String],
    default: []
  },

  autoProcessed: {
    type: Boolean,
    default: true
  },

  // Security tracking
  ipAddress: {
    type: String,
    default: null
  },

  userAgent: {
    type: String,
    default: null
  },

  deviceInfo: {
    type: String,
    default: null
  },

  // Retry tracking
  retryCount: {
    type: Number,
    default: 0
  },

  lastRetryAt: {
    type: Date,
    default: null
  },

  // Admin notes (for failed cases)
  adminNotes: {
    type: String,
    default: null
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
walletWithdrawalSchema.index({ userId: 1, requestedAt: -1 });
walletWithdrawalSchema.index({ userId: 1, status: 1, requestedAt: -1 });
walletWithdrawalSchema.index({ status: 1, requestedAt: -1 });

// Pre-save middleware to generate withdrawalId
walletWithdrawalSchema.pre('save', function (next) {
  if (!this.withdrawalId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.withdrawalId = `WD_${timestamp}_${random}`;
  }

  // Calculate netAmount
  if (this.isModified('amount') || this.isModified('withdrawalFee')) {
    this.netAmount = this.amount - (this.withdrawalFee || 0);
  }

  this.updatedAt = new Date();
  next();
});

const WalletWithdrawalModel = mongoose.models.WalletWithdrawal ||
  mongoose.model('WalletWithdrawal', walletWithdrawalSchema);

export default WalletWithdrawalModel;
