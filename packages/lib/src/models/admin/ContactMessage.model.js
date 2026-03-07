import mongoose from 'mongoose';

const ContactMessageSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ['new', 'read', 'replied'],
            default: 'new',
        },
        salonName: {
            type: String,
            trim: true,
        },
        source: {
            type: String,
            default: 'website',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.ContactMessage ||
    mongoose.model('ContactMessage', ContactMessageSchema);
