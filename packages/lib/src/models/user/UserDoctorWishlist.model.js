import mongoose from 'mongoose';

const userDoctorWishlistItemSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  doctorName: { type: String, required: true },
  doctorImage: { type: String }, // URL to the uploaded image
  specialty: { type: String, required: true },
  experience: { type: Number, required: true },
  rating: { type: Number, required: true },
  consultationFee: { type: Number, required: true },
  clinicName: { type: String },
  city: { type: String },
  state: { type: String },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const userDoctorWishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  items: [userDoctorWishlistItemSchema]
}, { timestamps: true });

const UserDoctorWishlistModel = mongoose.models.UserDoctorWishlist || mongoose.model('UserDoctorWishlist', userDoctorWishlistSchema);

export default UserDoctorWishlistModel;