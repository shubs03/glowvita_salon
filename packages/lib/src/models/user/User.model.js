import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  emailAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  mobileNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  location: {
    type: {
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      }
    },
    required: false,
  },
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  refferalCode: {
    type: String,
    trim: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  wallet: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  // Password reset fields
  resetPasswordToken: {
    type: String,
    required: false,
  },
  resetPasswordExpires: {
    type: Date,
    required: false,
  },
});

// Create indexes
userSchema.index({ emailAddress: 1 }, { unique: true });
userSchema.index({ mobileNo: 1 }, { unique: true });

// Pre-save middleware to update timestamps
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

export default UserModel;