import mongoose from 'mongoose';

const paymentCollectionSchema = new mongoose.Schema({
  // Reference fields
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    index: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: false,
    default: null
  },

  // Service details
  serviceDetails: {
    type: [{
      serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
      },
      serviceName: {
        type: String,
        required: true
      },
      staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
      },
      staffName: {
        type: String,
        required: true
      },
      startTime: {
        type: String,
        required: true
      },
      endTime: {
        type: String,
        required: true
      },
      duration: {
        type: Number,
        required: true
      },
      amount: {
        type: Number,
        required: true
      }
    }],
    required: true
  },

  // Booking mode
  mode: {
    type: String,
    enum: ['online', 'offline'],
    required: true
  },

  // Financial details
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  
  // Coupon details
  couponCode: {
    type: String,
    default: null
  },
  offerType: {
    type: String,
    enum: ['vendor', 'admin', null],
    default: null
  },

  // Payment details
  paymentType: {
    type: String,
    enum: ['cash', 'card', 'upi', 'netbanking', 'online', 'wallet'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed'],
    default: 'pending'
  },
  amountPaid: {
    type: Number,
    required: true
  },
  remainingAmount: {
    type: Number,
    required: true
  },
  serviceTax: {
    type: Number,
    default: 0
  },
  platformFee: {
    type: Number,
    default: 0
  },
  paymentHistory: {
    type: [{
      amount: { type: Number, required: true },
      paymentMethod: { type: String, required: true },
      paymentDate: { type: Date, default: Date.now },
      notes: { type: String, default: '' },
      transactionId: { type: String, default: null }
    }],
    default: []
  },

  // Additional information
  notes: {
    type: String,
    default: ''
  },
  transactionId: {
    type: String,
    default: null
  },
  paymentDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
paymentCollectionSchema.index({ vendorId: 1, appointmentId: 1 });
paymentCollectionSchema.index({ vendorId: 1, clientId: 1 });
paymentCollectionSchema.index({ vendorId: 1, paymentDate: -1 });
paymentCollectionSchema.index({ paymentStatus: 1 });

// Pre-save middleware to update timestamps
paymentCollectionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const PaymentCollectionModel = mongoose.models.PaymentCollection || mongoose.model('PaymentCollection', paymentCollectionSchema);

export default PaymentCollectionModel;