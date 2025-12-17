import mongoose from "mongoose";

const weddingPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
    index: true,
  },
  services: [
    {
      serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
      },
      serviceName: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
      staffRequired: {
        type: Boolean,
        default: false,
      },
      // Multi-vendor support
      vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: false, // Optional for multi-vendor packages
      },
      // Service timing information
      prepTime: {
        type: Number, // in minutes
        default: 0,
      },
      setupCleanupTime: {
        type: Number, // in minutes
        default: 0,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  discountedPrice: {
    type: Number,
    min: 0,
    default: null,
  },
  duration: {
    type: Number, // Total duration in minutes
    required: true,
    min: 1,
  },
  image: {
    type: String,
    trim: true,
    default: null,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "disapproved"],
    default: "pending",
  },
  isActive: {
    type: Boolean,
    default: true,
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

// Pre-save hook to update `updatedAt` timestamp
weddingPackageSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Add method to calculate package price with discount
weddingPackageSchema.methods.calculateDiscountedPrice = function() {
  if (this.discountedPrice !== null && this.discountedPrice !== undefined) {
    return this.discountedPrice;
  }
  return this.totalPrice;
};

// Add method to get total service count
weddingPackageSchema.methods.getServiceCount = function() {
  return this.services.reduce((total, service) => total + (service.quantity || 1), 0);
};

// Add method to populate service details
weddingPackageSchema.methods.populateServiceDetails = async function() {
  const populatedServices = await Promise.all(this.services.map(async (pkgService) => {
    try {
      // Dynamically import VendorServicesModel to avoid circular dependency
      const { default: VendorServicesModel } = await import('./VendorServices.model.js');
        
      // Fetch service details from VendorServicesModel
      // Find the vendor services document and then find the specific service within it
      const vendorServicesDoc = await VendorServicesModel.findOne({ vendor: this.vendorId });
      let serviceDetails = null;
        
      if (vendorServicesDoc && vendorServicesDoc.services) {
        // Handle both string and ObjectId comparisons
        const serviceIdToFind = pkgService.serviceId || pkgService._id;
        if (serviceIdToFind) {
          serviceDetails = vendorServicesDoc.services.find(service => {
            const serviceId = service._id || service.id;
            if (!serviceId || !serviceIdToFind) return false;
            return serviceId.toString() === serviceIdToFind.toString();
          });
        }
      }
        
      // Ensure we have the correct service data structure
      const baseServiceData = pkgService.toObject ? pkgService.toObject() : pkgService;
        
      return {
        ...baseServiceData,
        serviceId: baseServiceData.serviceId || baseServiceData._id,
        serviceName: serviceDetails ? serviceDetails.name : (pkgService.serviceName || baseServiceData.serviceName || ''),
        serviceDescription: serviceDetails ? serviceDetails.description : (baseServiceData.serviceDescription || ''),
        serviceDuration: serviceDetails ? serviceDetails.duration : (baseServiceData.serviceDuration || 60),
        servicePrice: serviceDetails ? serviceDetails.price : (baseServiceData.servicePrice || 0),
        serviceDiscountedPrice: serviceDetails ? serviceDetails.discountedPrice : (baseServiceData.serviceDiscountedPrice || null),
        serviceCategory: serviceDetails ? (serviceDetails.categoryName || (serviceDetails.category && typeof serviceDetails.category === 'string' ? serviceDetails.category : 'General') || 'General') : (baseServiceData.serviceCategory || 'General'),
        serviceImage: serviceDetails ? serviceDetails.image : (baseServiceData.serviceImage || null),
        serviceHomeService: serviceDetails ? serviceDetails.homeService : (baseServiceData.serviceHomeService || { available: false, charges: null }),
        serviceWeddingService: serviceDetails ? serviceDetails.weddingService : (baseServiceData.serviceWeddingService || { available: false, charges: null }),
        serviceIsAddon: serviceDetails ? (serviceDetails.category && typeof serviceDetails.category === 'string' && serviceDetails.category.toLowerCase().includes('addon')) : (baseServiceData.serviceIsAddon || false)
      };
    } catch (error) {
      console.error('Error populating service details for package service:', error);
      // Return the original package service data if there's an error
      const baseServiceData = pkgService.toObject ? pkgService.toObject() : pkgService;
      return {
        ...baseServiceData,
        serviceId: baseServiceData.serviceId || baseServiceData._id,
        serviceName: baseServiceData.serviceName || '',
        serviceCategory: baseServiceData.serviceCategory || 'General',
        serviceHomeService: baseServiceData.serviceHomeService || { available: false, charges: null },
        serviceWeddingService: baseServiceData.serviceWeddingService || { available: false, charges: null },
        serviceIsAddon: baseServiceData.serviceIsAddon || false
      };
    }
  }));
    
  // Ensure we return a properly structured object
  const basePackage = this.toObject ? this.toObject() : this;
  const result = {
    ...basePackage,
    id: basePackage._id || basePackage.id,
    services: populatedServices
  };
    
  console.log('Model - Populated package result:', result);
  console.log('Model - Populated package services:', populatedServices);
  console.log('Model - Populated package services length:', populatedServices.length);
    
  return result;
};

const WeddingPackageModel =
  mongoose.models.WeddingPackage || mongoose.model("WeddingPackage", weddingPackageSchema);

export default WeddingPackageModel;