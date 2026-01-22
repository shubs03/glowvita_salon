import mongoose from "mongoose";

const staffPayoutSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
        index: true
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    payoutDate: {
        type: Date,
        default: () => Date.now(),
        index: true
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'UPI', 'Other'],
        default: 'Cash'
    },
    notes: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: () => Date.now()
    }
}, { timestamps: true });

const StaffPayoutModel = mongoose.models.StaffPayout || mongoose.model("StaffPayout", staffPayoutSchema);

export default StaffPayoutModel;
