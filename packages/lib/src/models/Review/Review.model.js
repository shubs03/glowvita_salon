import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  entityType: {
    type: String,
    required: true,
    enum: ['product', 'service', 'salon'],
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    index: true
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
reviewSchema.index({ entityId: 1, entityType: 1 });
reviewSchema.index({ userId: 1, entityId: 1, entityType: 1 }, { unique: true });

// Pre-save hook to update `updatedAt` timestamp
reviewSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const ReviewModel = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default ReviewModel;