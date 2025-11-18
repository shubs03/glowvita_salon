import mongoose from 'mongoose';

const userWishlistItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: { type: String, required: true },
  productImage: { type: String }, // URL to the uploaded image (first image from productImages)
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
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const userWishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  items: [userWishlistItemSchema]
}, { timestamps: true });

const UserWishlistModel = mongoose.models.UserWishlist || mongoose.model('UserWishlist', userWishlistSchema);

export default UserWishlistModel;