import mongoose from "mongoose";

const adminPaymentSettingsSchema = new mongoose.Schema(
  {
    // Only one document should exist - treated as a singleton
    // UPI Details
    upiId: {
      type: String,
      trim: true,
      default: null,
    },
    upiQrCodeUrl: {
      type: String,
      trim: true,
      default: null, // URL to the uploaded QR code image
    },
    upiHolderName: {
      type: String,
      trim: true,
      default: null,
    },

    // Bank Details
    bankName: {
      type: String,
      trim: true,
      default: null,
    },
    accountNumber: {
      type: String,
      trim: true,
      default: null,
    },
    confirmAccountNumber: {
      type: String,
      trim: true,
      default: null,
    },
    ifscCode: {
      type: String,
      trim: true,
      default: null,
    },
    accountHolder: {
      type: String,
      trim: true,
      default: null,
    },
    branchName: {
      type: String,
      trim: true,
      default: null,
    },

    // Display notes to vendor
    paymentInstructions: {
      type: String,
      trim: true,
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
  },
  { timestamps: true }
);

const AdminPaymentSettingsModel =
  mongoose.models.AdminPaymentSettings ||
  mongoose.model("AdminPaymentSettings", adminPaymentSettingsSchema);

export default AdminPaymentSettingsModel;
