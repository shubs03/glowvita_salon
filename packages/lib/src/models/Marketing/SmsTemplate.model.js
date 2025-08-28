import mongoose from "mongoose";

const smsTemplateSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    unique: true
  },
  content: { 
    type: String, 
    required: true,
    trim: true
  },
  type: { 
    type: String, 
    required: true,
    enum: ['Promotional', 'Transactional', 'Service', 'Alert', 'Other'],
    default: 'Other'
  },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Draft'],
    default: 'Draft'
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  description: { 
    type: String, 
    trim: true
  },
  isPopular: { 
    type: Boolean, 
    default: false 
  },
  variables: [{
    name: String,
    description: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add text index for search
smsTemplateSchema.index({ 
  name: 'text', 
  content: 'text',
  type: 'text'
});

// Pre-save hooks
smsTemplateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Extract variables from content (e.g., {{variable}})
  if (this.isModified('content')) {
    const variableRegex = /\{\{(.*?)\}\}/g;
    let match;
    const variables = new Set();
    
    while ((match = variableRegex.exec(this.content)) !== null) {
      variables.add(match[1].trim());
    }
    
    this.variables = Array.from(variables).map(variable => ({
      name: variable,
      description: ''
    }));
  }
  
  next();
});

const SmsTemplate = mongoose.models.SmsTemplate || 
                   mongoose.model('SmsTemplate', smsTemplateSchema);

export default SmsTemplate;
