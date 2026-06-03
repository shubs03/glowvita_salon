import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  recipientRole: {
    type: String,
    required: true,
    enum: ['client', 'vendor', 'doctor', 'supplier', 'admin', 'staff'],
    index: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['appointment', 'order', 'subscription', 'system', 'test', 'offer', 'welcome', 'referral', 'broadcast'],
    default: 'system'
  },
  data: {
    type: Map,
    of: String,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for fetching unread count and sorting by date
NotificationSchema.index({ recipient: 1, recipientRole: 1, isRead: 1, createdAt: -1 });

// Force delete model to ensure schema updates during development hot-reloading
if (mongoose.models.Notification) {
  delete mongoose.models.Notification;
}

export default mongoose.model('Notification', NotificationSchema);
