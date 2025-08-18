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
  specialization: {
    type: String,
    required: true,
    // enum: ["Dermatologist", "Cosmetologist", "Trichologist", "Aesthetic Physician", "Plastic Surgeon"],
    trim: true,
  },
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