
import mongoose from "mongoose";

const adminUserSchema = new mongoose.Schema({
  fullName:{
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
  address: {
    type: String,
    required: true,
    trim: true,
  },
  designation: {
    type: String,
    required: true,
    trim: true,
  },
  profileImage: {
    type: String, // URL to the uploaded image
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  roleName: {
    type: String,
    required: true,
    trim: true,
  },
  permissions: [
    {
      type: String,
      trim: true,
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLoginAt: {
    type: Date,
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


const AdminUserModel =
  mongoose.models.AdminUser || mongoose.model("AdminUser", adminUserSchema);

export default AdminUserModel;
