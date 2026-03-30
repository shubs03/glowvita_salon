import mongoose from 'mongoose';

const userSalonWishlistItemSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    salonName: { type: String, required: true },
    salonImage: { type: String }, // URL to the profile image or first gallery image
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    category: { type: String },
    city: { type: String },
    state: { type: String },
    addedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const userSalonWishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    items: [userSalonWishlistItemSchema]
}, { timestamps: true });

const UserSalonWishlistModel = mongoose.models.UserSalonWishlist || mongoose.model('UserSalonWishlist', userSalonWishlistSchema);

export default UserSalonWishlistModel;
