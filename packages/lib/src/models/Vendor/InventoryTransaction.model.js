
import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product is required'],
        index: true,
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier', // Or Vendor, handled dynamically in queries often but good to have ref
        required: [true, 'Vendor/Supplier is required'],
        index: true,
    },
    productCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductCategory',
        required: [true, 'Product Category is required'],
    },
    type: {
        type: String,
        enum: ['IN', 'OUT', 'ADJUSTMENT'],
        required: [true, 'Transaction type is required'],
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity must be positive'], // Store absolute value, type determines sign logic
    },
    previousStock: {
        type: Number,
        required: true,
    },
    newStock: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        trim: true,
        required: [true, 'Reason is required'],
    },
    reference: {
        type: String, // e.g., Invoice Number, Order ID
        trim: true,
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // The user who performed the action
    },
    date: {
        type: Date,
        default: Date.now,
        index: true,
    }
}, {
    timestamps: true,
});

// Index for efficient querying of a product's history
inventoryTransactionSchema.index({ productId: 1, date: -1 });
// Index for filtering by vendor and date range
inventoryTransactionSchema.index({ vendorId: 1, date: -1 });

const InventoryTransactionModel = mongoose.models.InventoryTransaction || mongoose.model('InventoryTransaction', inventoryTransactionSchema, 'inventory_transactions');

export default InventoryTransactionModel;
