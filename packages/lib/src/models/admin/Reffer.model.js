
import mongoose from "mongoose";

// Schema for bonus details
const bonusSchema = new mongoose.Schema({
  bonusType: {
    type: String,
    enum: ['discount', 'amount'],
    default: 'amount',
  },
  bonusValue: {
    type: Number,
    required: true,
    min: 0,
  },
  creditTime: {
    type: String,
    required: true,
    trim: true,
  },
});

// Schema for referee bonus (optional)
const refereeBonusSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: false,
  },
  bonusType: {
    type: String,
    enum: ['discount', 'amount'],
    default: 'amount',
  },
  bonusValue: {
    type: Number,
    min: 0,
  },
  creditTime: {
    type: String,
    trim: true,
  },
});

const referralSettingsSchema = new mongoose.Schema({
  referrerBonus: bonusSchema,
  usageLimit: {
    type: String,
    enum: ['unlimited', 'manual'],
    required: true,
  },
  usageCount: {
    type: Number,
    default: null,
    min: 0,
  },
  refereeBonus: {
    type: refereeBonusSchema,
    default: () => ({ enabled: false }), // Default to disabled with no other fields
  },
  minOrders: {
    type: Number,
    min: 0,
    default: null,
  },
  minBookings: {
    type: Number,
    min: 0,
    default: null,
  },
  minPayoutCycle: {
    type: Number,
    min: 0,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Schema for individual referrals
const referralSchema = new mongoose.Schema({
  referralType: {
    type: String,
    enum: ['C2C', 'C2V', 'V2V'],
    required: true,
  },
  referralId: {
    type: String,
    unique: true,
    trim: true,
    required: true,
  },
  referrer: {
    type: String,
    required: true,
    trim: true,
  },
  referee: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Bonus Paid'],
    required: true,
  },
  bonus: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const ReferralModel = mongoose.models.Referral || mongoose.model("Referral", referralSchema);
const C2CSettingsModel = mongoose.models.C2CSettings || mongoose.model("C2CSettings", referralSettingsSchema);
const C2VSettingsModel = mongoose.models.C2VSettings || mongoose.model("C2VSettings", referralSettingsSchema);
const V2VSettingsModel = mongoose.models.V2VSettings || mongoose.model("V2VSettings", referralSettingsSchema);

export { ReferralModel, C2CSettingsModel, C2VSettingsModel, V2VSettingsModel };
