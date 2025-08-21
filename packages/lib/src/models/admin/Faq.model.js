import mongoose from 'mongoose';

const FaqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  categoryDescription: {
    type: String,
    trim: true
  },
  visible: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.models.Faq || mongoose.model('Faq', FaqSchema);
