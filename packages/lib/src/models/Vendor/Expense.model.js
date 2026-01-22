import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region",
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
ExpenseSchema.pre("save", async function (next) {
  try {
    // 1. Inherit regionId from Vendor if missing
    if (!this.regionId && this.vendorId) {
      const Vendor = mongoose.models.Vendor || (await import("./Vendor.model.js")).default;
      const vendor = await Vendor.findById(this.vendorId).select("regionId");
      if (vendor && vendor.regionId) {
        this.regionId = vendor.regionId;
      }
    }
    next();
  } catch (error) {
    console.error("Error in Expense pre-save middleware:", error);
    next(error);
  }
});

// Index for efficient querying
ExpenseSchema.index({ vendorId: 1, date: -1 });
ExpenseSchema.index({ vendorId: 1, expenseType: 1 });

const ExpenseModel = mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);

export default ExpenseModel;
