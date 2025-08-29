import mongoose from "mongoose";

const superDataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'specialization',
      'faqCategory',
      'designation',
      'smsType',
      'socialPlatform',
      'bank',
      'documentType',
      'country',
      'state',
      'city',
      'doctorType',
      'disease'
    ],
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperData',
    default: null,
  },
  // Additional fields for location hierarchy if needed, although parentId can handle it
  countryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperData',
    default: null,
  },
  stateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperData',
    default: null,
  },
   doctorType: { // For 'specialization' type
    type: String,
    enum: ['Physician', 'Surgeon'],
    required: function() { return this.type === 'specialization'; }
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

superDataSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const SuperDataModel = mongoose.models.SuperData || mongoose.model("SuperData", superDataSchema);

export default SuperDataModel;