
import mongoose from 'mongoose';

const productQuestionSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required'],
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Vendor ID is required'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'User ID is required'],
  },
  userName: {
    type: String,
    required: [true, 'User name is required'],
    trim: true,
  },
  userEmail: {
    type: String,
    required: [true, 'User email is required'],
    trim: true,
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
  },
  answer: {
    type: String,
    default: null,
    trim: true,
  },
  isAnswered: {
    type: Boolean,
    default: false,
  },
  answeredAt: {
    type: Date,
    default: null,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  helpfulCount: {
    type: Number,
    default: 0,
  },
  notHelpfulCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for faster queries
productQuestionSchema.index({ productId: 1, isPublished: 1 });
productQuestionSchema.index({ vendorId: 1, isAnswered: 1 });

const ProductQuestion = mongoose.models?.ProductQuestion || mongoose.model('ProductQuestion', productQuestionSchema);

export default ProductQuestion;
