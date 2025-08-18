
import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  specialization: {
    type: String,
    required: true,
    trim: true,
  },
  experience: {
    type: String,
    trim: true,
    default: null,
  },
  clinicName: {
    type: String,
    trim: true,
    default: null,
  },
  clinicAddress: {
    type: String,
    trim: true,
    default: null,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{6}$/, "Please enter a valid 6-digit pincode"],
  },
  consultationFee: {
    type: String,
    trim: true,
    default: null,
  },
  about: {
    type: String,
    trim: true,
    default: null,
  },
  qualification: {
    type: String,
    trim: true,
    default: null,
  },
  registrationYear: {
    type: String,
    trim: true,
    default: null,
  },
  registrationTimestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  registrationVia: {
    type: String,
    enum: ["Admin", "Agent"],
    required: true,
  },
  subscriptionStatus: {
    type: String,
    enum: ["Active", "Inactive", "Pending"],
    default: "Pending",
  },
  category: {
    type: String,
    enum: ["Dermatologist", "Homeopath", "Trichologist", "Aesthetic Dermatologist"],
    required: true,
  },
  status: {
    type: String,
    enum: ["Approved", "Pending", "Rejected"],
    default: "Pending",
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

const DoctorModel = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);

export default DoctorModel;
