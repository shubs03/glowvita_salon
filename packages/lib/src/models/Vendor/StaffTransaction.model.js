import mongoose from "mongoose";

const staffTransactionSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
        index: true
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staffs',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['CREDIT', 'DEBIT'],
        required: true, // CREDIT for earnings, DEBIT for payouts
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: false // Only for CREDIT transactions
    },
    billingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Billing',
        required: false
    },
    description: {
        type: String,
        required: false
    },
    paymentMethod: {
        type: String,
        // No enum restriction — CREDIT transactions (commissions) don't have a payment method
        // DEBIT transactions (payouts) can be: Cash, Bank Transfer, UPI, Other
        default: null,
        required: false
    },
    notes: {
        type: String,
        trim: true,
        required: false
    },
    transactionDate: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { timestamps: true });

// Index for ledger filtering
staffTransactionSchema.index({ staffId: 1, transactionDate: -1 });
staffTransactionSchema.index({ appointmentId: 1 });
staffTransactionSchema.index({ billingId: 1 });

const StaffTransactionsModel = mongoose.models.StaffTransactions || mongoose.model("StaffTransactions", staffTransactionSchema);

export default StaffTransactionsModel;
