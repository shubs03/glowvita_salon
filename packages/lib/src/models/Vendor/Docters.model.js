

import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  gender: {
    type: String,
    required: true,
    trim: true,
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  doctorType: { 
    type: String,
    required: true,
  },
  specialties: [{ 
    type: String,
    required: true,
    trim: true,
  }],
  diseases: [{
    type: String,
    trim: true,
  }],
  experience: {
    type: String,
    required: true,
    trim: true,
  },
  clinicName: {
    type: String,
    required: true,
    trim: true,
  },
  clinicAddress: {
    type: String,
    required: true,
    trim: true,
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
  },
  status: {
    type: String,
    enum: ["Approved", "Pending", "Rejected"],
    default: "Pending",
  },
  profileImage: {
    type: String,
    trim: true,
  },
  qualification: {
    type: String,
    trim: true,
  },
  registrationYear: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  physicalConsultationStartTime: {
    type: String,
    required: true,
    trim: true,
  },
  physicalConsultationEndTime: {
    type: String,
    required: true,
    trim: true,
  },
  faculty: {
    type: String,
    trim: true,
  },
  assistantName: {
    type: String,
    required: true,
    trim: true,
  },
  assistantContact: {
    type: String,
    required: true,
    trim: true,
  },
  doctorAvailability: {
    type: String,
    required: true,
    enum: ["Online", "Offline"],
    trim: true,
  },
  landline: {
    type: String,
    trim: true,
  },
  workingWithHospital: {
    type: Boolean,
    default: false,
  },
  videoConsultation: {
    type: Boolean,
    default: false,
  },
  referralCode: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
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

doctorSchema.virtual('specialization').get(function() {
    return this.specialties?.[0] || '';
});

const DoctorModel = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);

export default DoctorModel;
    
