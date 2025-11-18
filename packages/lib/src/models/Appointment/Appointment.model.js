import mongoose from 'mongoose';
import ServiceModel from '../admin/Service.model.js';
import StaffModel from '../Vendor/Staff.model.js';

// Ensure the Service and Staff models are registered
const Service = mongoose.models.Service || ServiceModel;
const Staff = mongoose.models.Staff || StaffModel;

// Schema for individual service items in a multi-service appointment
const serviceItemSchema = new mongoose.Schema({
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    serviceName: {
        type: String,
        required: true
    },
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: false // Allow null for "Any Professional"
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
});

const appointmentSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    },
    // For backward compatibility, keep the main staff/service fields
    // For multi-service appointments, these will represent the primary service
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: false // Changed to false to allow null values for "Any Professional"
    },
    staffName: {
        type: String,
        required: true
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    serviceName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    clientName: {
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
    },
    discount: {
        type: Number
    },
    totalAmount: {
        type: Number,
        required: true
    },
    // Payment-related fields
    platformFee: {
        type: Number,
        default: 0
    },
    serviceTax: {
        type: Number,
        default: 0
    },
    taxRate: {
        type: Number,
        default: 0
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        required: true
    },
    // Fields to track payment progress
    amountPaid: {
        type: Number,
        default: 0
    },
    amountRemaining: {
        type: Number,
        default: function() {
            return this.finalAmount || this.totalAmount || 0;
        }
    },
    paymentMethod: {
        type: String,
        enum: ['Pay at Salon', 'Pay Online', 'Pay Later'],
        default: 'Pay at Salon'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    // History of payment transactions for this appointment
    paymentHistory: {
        type: [{
            amount: { type: Number, required: true },
            paymentMethod: { type: String, required: true },
            paymentDate: { type: Date, default: Date.now },
            notes: { type: String, default: '' },
            transactionId: { type: String, default: null },
            paymentCollectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentCollection', default: null }
        }],
        default: []
    },
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String
    },
    razorpaySignature: {
        type: String
    },
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
        default: 'scheduled'
    },
    notes: {
        type: String
    },
    // New field for multi-service appointments
    serviceItems: {
        type: [serviceItemSchema],
        default: []
    },
    // Flag to indicate if this is a multi-service appointment
    isMultiService: {
        type: Boolean,
        default: false
    },
    // Booking mode: 'online' for web bookings, 'offline' for CRM bookings
    mode: {
        type: String,
        enum: ['online', 'offline'],
        required: true,
        default: 'offline'
    }
}, {
    timestamps: true
});

// Create compound index for preventing double booking
appointmentSchema.index({ vendorId: 1, staff: 1, date: 1, startTime: 1, endTime: 1 ,service: 1,client: 1,clientName: 1, staffName: 1,serviceName: 1, duration: 1, amount: 1, discount: 1, totalAmount: 1, status: 1, notes: 1});

// Ensure the model is only defined once
const AppointmentModel = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

export default AppointmentModel;