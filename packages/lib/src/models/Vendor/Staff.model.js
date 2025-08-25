
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const bankDetailsSchema = new mongoose.Schema({
    accountHolderName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    bankName: { type: String, trim: true },
    ifscCode: { type: String, trim: true },
    upiId: { type: String, trim: true }
}, { _id: false });

const staffSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  mobileNo: {
    type: String,
    required: true,
    trim: true,
  },
  emailAddress: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  photo: {
    type: String, // URL or Base64 string
    default: null,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  salary: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
    default: null,
  },
  endDate: {
    type: Date,
    default: null,
  },
  yearOfExperience: {
    type: Number,
    default: 0,
  },
  clientsServed: {
    type: Number,
    default: 0,
  },
  commission: {
    type: Boolean,
    default: false,
  },
  bankDetails: {
    type: bankDetailsSchema,
    default: () => ({})
  },
  password: {
    type: String,
    required: true,
    select: true, // Select password to check it
  },
  role: {
    type: String,
    required: true,
    trim: true,
    default: 'staff',
  },
  permissions: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

// Ensure email is unique per vendor
staffSchema.index({ vendorId: 1, emailAddress: 1 }, { unique: true });

const StaffModel = mongoose.models.Staff || mongoose.model("Staff", staffSchema);

export default StaffModel;
