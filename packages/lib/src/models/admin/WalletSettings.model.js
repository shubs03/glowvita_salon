import mongoose from 'mongoose';

const walletSettingsSchema = new mongoose.Schema({
  // Withdrawal limits
  minWithdrawalAmount: {
    type: Number,
    default: 100,
    min: 0
  },
  
  maxWithdrawalAmount: {
    type: Number,
    default: 50000,
    min: 0
  },
  
  maxDailyWithdrawalAmount: {
    type: Number,
    default: 100000,
    min: 0
  },
  
  maxWithdrawalsPerDay: {
    type: Number,
    default: 3,
    min: 1
  },
  
  // Add money limits
  minAddMoneyAmount: {
    type: Number,
    default: 10,
    min: 0
  },
  
  maxAddMoneyAmount: {
    type: Number,
    default: 100000,
    min: 0
  },
  
  // Withdrawal fees
  withdrawalFeeType: {
    type: String,
    enum: ['fixed', 'percentage', 'none'],
    default: 'none'
  },
  
  withdrawalFeeValue: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Balance requirements
  minWalletBalanceForWithdrawal: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Cooldown period
  cooldownPeriodHours: {
    type: Number,
    default: 0, // 0 means no cooldown
    min: 0
  },
  
  // Feature flags
  instantWithdrawalEnabled: {
    type: Boolean,
    default: true
  },
  
  autoFraudDetectionEnabled: {
    type: Boolean,
    default: true
  },
  
  otpVerificationForLargeWithdrawals: {
    type: Boolean,
    default: false
  },
  
  largeWithdrawalThreshold: {
    type: Number,
    default: 10000,
    min: 0
  },
  
  // Fraud detection rules
  fraudDetectionRules: {
    maxAmountPerTransaction: {
      type: Number,
      default: 50000
    },
    suspiciousActivityThreshold: {
      type: Number,
      default: 70
    },
    requireVerificationAfterAmount: {
      type: Number,
      default: 100000
    },
    newAccountRestrictionDays: {
      type: Number,
      default: 7
    },
    maxWithdrawalForNewAccount: {
      type: Number,
      default: 5000
    },
    rapidWithdrawalWindowMinutes: {
      type: Number,
      default: 60
    },
    maxRapidWithdrawals: {
      type: Number,
      default: 2
    }
  },
  
  // Payment gateway configuration
  razorpayPayoutEnabled: {
    type: Boolean,
    default: true
  },
  
  // Notifications
  notifyUserOnCredit: {
    type: Boolean,
    default: true
  },
  
  notifyUserOnDebit: {
    type: Boolean,
    default: true
  },
  
  notifyUserOnWithdrawalComplete: {
    type: Boolean,
    default: true
  },
  
  // Admin alerts
  alertAdminOnFailedWithdrawal: {
    type: Boolean,
    default: true
  },
  
  alertAdminOnHighRiskTransaction: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    default: null
  },
  
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  },
  
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

// Pre-save middleware
walletSettingsSchema.pre('save', function(next) {
  this.lastUpdatedAt = new Date();
  this.updatedAt = new Date();
  next();
});

// Ensure only one settings document exists
walletSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const WalletSettingsModel = mongoose.models.WalletSettings || 
  mongoose.model('WalletSettings', walletSettingsSchema);

export default WalletSettingsModel;
