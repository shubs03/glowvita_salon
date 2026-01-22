
      
import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  image: { type: String }, // URL to the uploaded image
}, { _id: false });

const ClientOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true,
  },
  regionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Region',
    required: true,
    index: true,
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAmount: {
    type: Number,
    default: 0,
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  gstAmount: {
    type: Number,
    default: 0,
  },
  platformFeeAmount: {
    type: Number,
    default: 0,
  },
  shippingAddress: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentId: {
    type: String, // Razorpay payment ID
  },
  razorpayOrderId: {
    type: String, // Razorpay order ID
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  trackingNumber: {
    type: String,
  },
  cancellationReason: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

ClientOrderSchema.pre('save', async function (next) {
  try {
    // 1. Inherit regionId from Vendor if missing
    if (!this.regionId && this.vendorId) {
      const Vendor = mongoose.models.Vendor || (await import('../Vendor/Vendor.model.js')).default;
      const vendor = await Vendor.findById(this.vendorId).select('regionId');
      if (vendor && vendor.regionId) {
        this.regionId = vendor.regionId;
      }
    }

    this.updatedAt = new Date();
    next();
  } catch (error) {
    console.error("Error in ClientOrder pre-save middleware:", error);
    next(error);
  }
});

const ClientOrderModel = mongoose.models.ClientOrder || mongoose.model('ClientOrder', ClientOrderSchema);

export default ClientOrderModel;

      