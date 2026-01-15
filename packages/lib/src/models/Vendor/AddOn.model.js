import mongoose from "mongoose";

const addOnSchema = new mongoose.Schema(
    {
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
            index: true,
        },
        services: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "VendorServices",
            index: true,
        }],
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        duration: {
            type: Number, // in minutes
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

// Index for optimized vendor-specific queries
addOnSchema.index({ vendor: 1, status: 1 });

// Force model re-registration to pick up schema changes in dev
if (mongoose.models.AddOn) {
    delete mongoose.models.AddOn;
}

const AddOnModel = mongoose.model("AddOn", addOnSchema);

export default AddOnModel;
