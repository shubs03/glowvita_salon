import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
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
  birthdayDate: {
    type: Date,
    required: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  occupation: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  profileImage: {
    type: String, // URL to the uploaded image
    trim: true,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive", "New"],
    default: "New",
  },
  totalConsultations: {
    type: Number,
    default: 0,
  },
  lastConsultation: {
    type: Date,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
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

const PatientModel = mongoose.models.Patient || mongoose.model("Patient", patientSchema);

export default PatientModel;