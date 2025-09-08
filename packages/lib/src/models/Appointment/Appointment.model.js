import mongoose from 'mongoose';
import ServiceModel from '../admin/Service.model';

// Ensure the Service model is registered
const Service = mongoose.models.Service || ServiceModel;

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
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
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
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
        default: 'scheduled'
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Create compound index for preventing double booking
appointmentSchema.index({ vendorId: 1, staff: 1, date: 1, startTime: 1, endTime: 1 ,service: 1,client: 1,clientName: 1, staffName: 1,serviceName: 1, duration: 1, amount: 1, discount: 1, totalAmount: 1, status: 1, notes: 1});

// Ensure the model is only defined once
const AppointmentModel = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

export default AppointmentModel;
