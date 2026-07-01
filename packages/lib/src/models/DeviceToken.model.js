import mongoose from 'mongoose';

const DeviceTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    index: true
  },
  userType: {
    type: String,
    enum: ['client', 'vendor', 'doctor', 'supplier', 'admin', 'staff', null],
    default: null,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

DeviceTokenSchema.index({ userId: 1, userType: 1, isActive: 1 });

if (mongoose.models.DeviceToken) {
  delete mongoose.models.DeviceToken;
}

export default mongoose.model('DeviceToken', DeviceTokenSchema);
