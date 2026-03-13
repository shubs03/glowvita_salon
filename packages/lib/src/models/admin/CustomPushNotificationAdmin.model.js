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
    type: [String],
    required: true,
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
  regionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Region',
    default: null, // null means global (for super admin)
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

// Force delete model to ensure schema updates during development hot-reloading
if (mongoose.models.adminCustomPushNotification) {
  delete mongoose.models.adminCustomPushNotification;
}

const CustomPushNotificationAdminModel = mongoose.model("adminCustomPushNotification", adminNotificationSchema);

export default CustomPushNotificationAdminModel;
