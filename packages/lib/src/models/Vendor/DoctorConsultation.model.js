import mongoose from 'mongoose';

const doctorConsultationSchema = new mongoose.Schema({
  // Doctor Information
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    index: true
  },
  regionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Region',
    required: true,
    index: true
  },
  doctorName: {
    type: String,
    required: true,
    trim: true
  },
  doctorSpecialty: {
    type: String,
    required: true,
    trim: true
  },
  doctorImage: {
    type: String,
    trim: true
  },
  doctorRating: {
    type: Number,
    min: 0,
    max: 5
  },
  doctorReviewCount: {
    type: Number,
    default: 0
  },
  doctorClinic: {
    type: String,
    trim: true
  },
  doctorAddress: {
    type: String,
    trim: true
  },

  // Patient Information
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },

  // Consultation Type
  consultationType: {
    type: String,
    enum: ['physical', 'video'],
    required: true,
    default: 'physical',
    index: true
  },

  // Appointment Details
  appointmentDate: {
    type: Date,
    required: true,
    index: true
  },
  appointmentTime: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    default: 20, // in minutes
    required: true
  },
  consultationFee: {
    type: Number,
    required: true,
    min: 0
  },

  // Notification Preferences
  whatsappNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
  emailNotifications: {
    type: Boolean,
    default: false
  },

  // Status
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'],
    default: 'scheduled',
    index: true
  },
  cancellationReason: {
    type: String,
    trim: true
  },

  // Payment Information
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'upi', 'wallet'],
    trim: true
  },
  razorpayOrderId: {
    type: String,
    trim: true
  },
  razorpayPaymentId: {
    type: String,
    trim: true
  },
  razorpaySignature: {
    type: String,
    trim: true
  },

  // Additional Information
  notes: {
    type: String,
    trim: true
  },
  prescription: {
    type: String,
    trim: true
  },
  diagnosis: {
    type: String,
    trim: true
  },
  followUpDate: {
    type: Date
  },
  
  // Video Consultation Specific Fields
  videoCallLink: {
    type: String,
    trim: true
  },
  videoCallStartTime: {
    type: Date
  },
  videoCallEndTime: {
    type: Date
  },
  videoCallDuration: {
    type: Number, // in minutes
    default: 0
  },

  // Booking Source
  bookingSource: {
    type: String,
    enum: ['web', 'mobile', 'crm', 'admin'],
    default: 'web'
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
doctorConsultationSchema.index({ doctorId: 1, appointmentDate: 1, status: 1 });
doctorConsultationSchema.index({ patientId: 1, appointmentDate: -1 });
doctorConsultationSchema.index({ userId: 1, appointmentDate: -1 });
doctorConsultationSchema.index({ phoneNumber: 1, appointmentDate: -1 });
doctorConsultationSchema.index({ consultationType: 1, status: 1, appointmentDate: 1 });

// Pre-save middleware to update timestamps and inherit regionId
doctorConsultationSchema.pre('save', async function(next) {
  try {
    // 1. Inherit regionId from Doctor if missing
    if (!this.regionId && this.doctorId) {
      const Doctor = mongoose.models.Doctor || (await import('./Docters.model.js')).default;
      const doctor = await Doctor.findById(this.doctorId).select('regionId');
      if (doctor && doctor.regionId) {
        this.regionId = doctor.regionId;
      }
    }

    this.updatedAt = new Date();
    
    if (this.isModified('status')) {
      if (this.status === 'completed') {
        this.completedAt = new Date();
      } else if (this.status === 'cancelled') {
        this.cancelledAt = new Date();
      }
    }
    
    next();
  } catch (error) {
    console.error("Error in DoctorConsultation pre-save middleware:", error);
    next(error);
  }
});

// Static method to get consultations by doctor
doctorConsultationSchema.statics.getConsultationsByDoctor = async function(doctorId, options = {}) {
  const {
    startDate,
    endDate,
    status,
    consultationType,
    page = 1,
    limit = 50
  } = options;

  const query = { doctorId };

  if (startDate || endDate) {
    query.appointmentDate = {};
    if (startDate) query.appointmentDate.$gte = new Date(startDate);
    if (endDate) query.appointmentDate.$lte = new Date(endDate);
  }

  if (status) {
    query.status = Array.isArray(status) ? { $in: status } : status;
  }

  if (consultationType) {
    query.consultationType = consultationType;
  }

  const skip = (page - 1) * limit;

  const consultations = await this.find(query)
    .sort({ appointmentDate: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await this.countDocuments(query);

  return {
    consultations,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

// Static method to get consultations by patient
doctorConsultationSchema.statics.getConsultationsByPatient = async function(patientId, options = {}) {
  const {
    startDate,
    endDate,
    status,
    page = 1,
    limit = 50
  } = options;

  const query = { patientId };

  if (startDate || endDate) {
    query.appointmentDate = {};
    if (startDate) query.appointmentDate.$gte = new Date(startDate);
    if (endDate) query.appointmentDate.$lte = new Date(endDate);
  }

  if (status) {
    query.status = Array.isArray(status) ? { $in: status } : status;
  }

  const skip = (page - 1) * limit;

  const consultations = await this.find(query)
    .sort({ appointmentDate: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('doctorId', 'name specialties email phone')
    .lean();

  const total = await this.countDocuments(query);

  return {
    consultations,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

// Static method to check for slot availability
doctorConsultationSchema.statics.isSlotAvailable = async function(doctorId, appointmentDate, appointmentTime) {
  const existingConsultation = await this.findOne({
    doctorId,
    appointmentDate: new Date(appointmentDate),
    appointmentTime,
    status: { $nin: ['cancelled', 'no-show'] }
  });

  return !existingConsultation;
};

// Instance method to cancel consultation
doctorConsultationSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  return this.save();
};

// Instance method to complete consultation
doctorConsultationSchema.methods.complete = function(data = {}) {
  this.status = 'completed';
  this.completedAt = new Date();
  
  if (data.prescription) this.prescription = data.prescription;
  if (data.diagnosis) this.diagnosis = data.diagnosis;
  if (data.followUpDate) this.followUpDate = data.followUpDate;
  if (data.notes) this.notes = data.notes;
  
  return this.save();
};

const DoctorConsultation = mongoose.models.DoctorConsultation || mongoose.model('DoctorConsultation', doctorConsultationSchema);

export default DoctorConsultation;
