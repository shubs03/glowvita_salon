import mongoose from "mongoose";

// Check if we're running on the server side
const isServer = typeof window === 'undefined';

let AdminOfferModel;

if (isServer && mongoose && mongoose.model) {
  const adminOfferSchema = new mongoose.Schema({
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Expired", "Scheduled"],
      default: "Scheduled",
    },
    startDate: {
      type: Date,
      required: true,
    },
    expires: {
      type: Date,
      default: null,
    },
    redeemed: {
      type: Number,
      default: 0,
      min: 0,
    },
    applicableSpecialties: {
      type: [String],
      enum: ['Hair Cut', 'Spa', 'Massage', 'Facial', 'Manicure', 'Pedicure', ''], // Allow empty string for backward compatibility
      default: [],
    },
    applicableCategories: {
      type: [String],
      enum: ['Men', 'Women', 'Unisex', ''], // Allow empty string for backward compatibility
      default: [],
    },
    // New field for offer image
    offerImage: {
      type: String, // Base64 encoded image string
      default: null,
    },
    // New field to track if code is custom or auto-generated
    isCustomCode: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  });

  // Add a method to calculate discount amount
  adminOfferSchema.methods.calculateDiscount = function(amount) {
    if (this.type === "percentage") {
      return (amount * this.value) / 100;
    } else {
      return Math.min(this.value, amount); // Ensure discount doesn't exceed the amount
    }
  };

  // Add a method to check if offer is applicable
  adminOfferSchema.methods.isApplicable = function() {
    // Check if offer is active
    if (this.status !== "Active") {
      return false;
    }
    
    // Check if offer has expired
    if (this.expires && new Date() > new Date(this.expires)) {
      return false;
    }
    
    // Check if offer has started
    if (new Date() < new Date(this.startDate)) {
      return false;
    }
    
    return true;
  };

  // Create the model only on the server side
  AdminOfferModel = mongoose.models.AdminOffer || mongoose.model("AdminOffer", adminOfferSchema);
} else {
  // Provide a fallback implementation for the browser
  AdminOfferModel = {
    findOne: async () => null,
    isApplicable: () => false
  };
}

export default AdminOfferModel;