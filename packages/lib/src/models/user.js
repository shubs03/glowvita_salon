import mongoose, { Schema, models } from 'mongoose';

const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    select: false,
  },
  name: {
    type: String,
    required: [true, 'Please provide a name.'],
  },
  role: {
    type: String,
    enum: ['USER', 'VENDOR', 'ADMIN'],
    default: 'USER',
  },
}, { timestamps: true });


const User = models.User || mongoose.model('User', UserSchema);

export default User;
