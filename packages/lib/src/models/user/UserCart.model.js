import mongoose from 'mongoose';

const userCartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: { type: String, required: true },
  productImage: { type: String },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  supplierName: {
    type: String,
  },
}, { _id: false });

const userCartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  items: [userCartItemSchema]
}, { timestamps: true });

const UserCartModel = mongoose.models.UserCart || mongoose.model('UserCart', userCartSchema);

export default UserCartModel;