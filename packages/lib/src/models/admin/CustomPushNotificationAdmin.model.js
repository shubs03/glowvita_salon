import mongoose from "mongoose";

const adminNotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  types: [{
    type: String,
    enum: ['SMS', 'Email', 'Notification'],
  }],
  targetType: {
    type: String,
    required: true,
    enum: ['all_users', 'all_vendors', 'all_staff', 'all_admins', 'specific_users', 'specific_vendors'],
  },
  specificIds: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['Sent', 'Scheduled'],
    default: 'Sent',
  },
  date: {
    type: Date,
    default: Date.now,
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

const CustomPushNotificationAdminModel =
  mongoose.models.adminCustomPushNotification ||
  mongoose.model("adminCustomPushNotification", adminNotificationSchema);

export default CustomPushNotificationAdminModel;
