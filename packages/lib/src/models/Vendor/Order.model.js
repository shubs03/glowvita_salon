
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
  productName: { type: String, required: true },
  productImage: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  
  // For B2C: Customer buying from Vendor
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String },
  customerEmail: { type: String },

  // For B2B: Vendor buying from Supplier
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }, // The buyer
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }, // The seller

  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  
  shippingAddress: { type: String, required: true },
  shippingCharge: { type: Number, default: 0 },

  trackingNumber: { type: String },
  courier: { type: String },

  statusHistory: [{
    status: String,
    date: { type: Date, default: Date.now },
    notes: String,
  }],
}, { timestamps: true });

// Add initial status to history before saving
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    this.statusHistory.push({ status: 'Pending', notes: 'Order placed.' });
  }
  next();
});

const OrderModel = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default OrderModel;
