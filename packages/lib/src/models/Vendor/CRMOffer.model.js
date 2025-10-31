// crm/models/CRMOffer.model.js

import mongoose from "mongoose";

// Check if we're running on the server side
const isServer = typeof window === 'undefined';

let CRMOfferModel;

if (isServer && mongoose && mongoose.model) {
  const crmOfferSchema = new mongoose.Schema({
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
    // New fields for services and service categories
    applicableServices: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'VendorServices.services',
      default: [],
    },
    applicableServiceCategories: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Category',
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
    // Fields for doctor-specific offers
    applicableDiseases: {
      type: [String],
      default: [],
    },
    // Fields for supplier-specific offers
    minOrderAmount: {
      type: Number,
      min: 0,
      default: null,
    },
    // Field to track which business (vendor/doctor/supplier) owns this offer
    businessType: {
      type: String,
      enum: ['vendor', 'doctor', 'supplier'],
      required: true,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'businessType' // Dynamic reference to Vendor/Doctor/Supplier model based on businessType
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
  crmOfferSchema.methods.calculateDiscount = function(amount) {
    if (this.type === "percentage") {
      return (amount * this.value) / 100;
    } else {
      return Math.min(this.value, amount); // Ensure discount doesn't exceed the amount
    }
  };

  // Add a method to check if offer is applicable
  crmOfferSchema.methods.isApplicable = function(services, categories) {
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
    
    // Check if offer is applicable to any of the services
    if (this.applicableServices && this.applicableServices.length > 0) {
      const serviceIds = services.map(service => service._id?.toString() || service.toString());
      if (this.applicableServices.some(offerService => 
        serviceIds.includes(offerService.toString()))) {
        return true;
      }
    }
    
    // Check if offer is applicable to any of the service categories
    if (this.applicableServiceCategories && this.applicableServiceCategories.length > 0) {
      const categoryIds = categories.map(category => category._id?.toString() || category.toString());
      if (this.applicableServiceCategories.some(offerCategory => 
        categoryIds.includes(offerCategory.toString()))) {
        return true;
      }
    }
    
    // Check if offer is applicable to any specialties
    if (this.applicableSpecialties && this.applicableSpecialties.length > 0) {
      // This would need to be implemented based on how specialties are handled
      // For now, we'll return true if no other conditions are specified
      if (this.applicableServices.length === 0 && this.applicableServiceCategories.length === 0) {
        return true;
      }
    }
    
    // Check if offer is applicable to any categories (Men, Women, Unisex)
    if (this.applicableCategories && this.applicableCategories.length > 0) {
      // This would need to be implemented based on how categories are handled
      // For now, we'll return true if no other conditions are specified
      if (this.applicableServices.length === 0 && 
          this.applicableServiceCategories.length === 0 && 
          this.applicableSpecialties.length === 0) {
        return true;
      }
    }
    
    return false;
  };

  // Create the model only on the server side
  CRMOfferModel = mongoose.models.CRMOffer || mongoose.model("CRMOffer", crmOfferSchema);
} else {
  // Provide a fallback implementation for the browser
  CRMOfferModel = {
    findOne: async () => null,
    isApplicable: () => false
  };
}

export default CRMOfferModel;