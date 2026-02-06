import mongoose from "mongoose";

const vendorSettlementPaymentSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
        index: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    type: {
        type: String,
        enum: ["Payment to Vendor", "Payment to Admin"],
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    transactionId: {
        type: String,
        trim: true,
    },
    notes: {
        type: String,
        trim: true,
    },
    paymentDate: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
}, {
    timestamps: true,
});

vendorSettlementPaymentSchema.index({ vendorId: 1, paymentDate: -1 });

const VendorSettlementPaymentModel =
    mongoose.models.VendorSettlementPayment ||
    mongoose.model("VendorSettlementPayment", vendorSettlementPaymentSchema);

export default VendorSettlementPaymentModel;
