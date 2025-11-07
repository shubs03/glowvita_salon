import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    expenseType: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMode: {
      type: String,
      required: true,
      trim: true,
    },
    invoice: {
      type: String, // URL or file path to the uploaded invoice
      default: null,
    },
    invoiceNo: {
      type: String,
      trim: true,
      default: null,
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Deleted'],
      default: 'Active',
    },
    createdBy: {
      type: String,
      default: 'Vendor',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
ExpenseSchema.index({ vendorId: 1, date: -1 });
ExpenseSchema.index({ vendorId: 1, expenseType: 1 });

const ExpenseModel = mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);

export default ExpenseModel;
