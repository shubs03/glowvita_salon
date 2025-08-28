import mongoose from 'mongoose';

const socialMediaTemplateSchema = new mongoose.Schema({
  // Required fields
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  availableFor: {
    type: String,
    required: [true, 'Available For is required'],
    enum: {
      values: ['admin', 'vendor', 'doctor', 'supplier'],
      message: 'Available For must be one of: admin, vendor, doctor, supplier'
    },
    default: 'admin'
  },
  
  // Optional fields with defaults
  description: {
    type: String,
    default: '',
    trim: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  
  // System fields
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Remove version and convert _id to id
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  versionKey: false
});

// Indexes
socialMediaTemplateSchema.index({ title: 'text', category: 'text' });

// Define the model name
const modelName = 'SocialMediaTemplate';

// Create and export the model
const SocialMediaTemplate = mongoose.models?.[modelName] || 
  mongoose.model(modelName, socialMediaTemplateSchema);

// Export the schema and model name as named exports
export { socialMediaTemplateSchema as schema, modelName };

export default SocialMediaTemplate;
