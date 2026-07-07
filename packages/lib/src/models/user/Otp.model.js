import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  // The email or phone number this OTP was sent to
  identifier: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  // Distinguishes between email and phone OTPs
  type: {
    type: String,
    enum: ["email", "phone"],
    required: true,
  },
  // Stored as a bcrypt hash — never in plaintext
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  // Track failed attempts for brute-force protection (max 5)
  failedAttempts: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// TTL index: MongoDB automatically deletes documents when expiresAt is reached
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpModel = mongoose.models.Otp || mongoose.model("Otp", otpSchema);

export default OtpModel;
