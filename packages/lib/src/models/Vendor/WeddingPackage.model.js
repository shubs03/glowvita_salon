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
      // Customization options (from Enhanced)
      isCustomized: {
        type: Boolean,
        default: false,
      },
      customizations: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
      }
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
  staffCount: {
    type: Number, // Number of staff members required
    default: 1,
    min: 1,
  },
  assignedStaff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],
  // Customization options (from Enhanced)
  allowCustomization: {
    type: Boolean,
    default: true,
  },
  maxCustomizations: {
    type: Number,
    default: 10, // Maximum number of services that can be added
  },
  // Deposit settings (from Enhanced)
  depositRequired: {
    type: Boolean,
    default: false,
  },
  depositPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  depositAmount: {
    type: Number,
    min: 0,
    default: 0,
  },
  // Cancellation policy (from Enhanced)
  cancellationPolicy: {
    type: String,
    default: "Standard 24-hour notice required for cancellations",
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
  rejectionReason: {
    type: String,
    trim: true,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Metadata for tracking (from Enhanced)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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

// Add method to calculate package price with customizations
weddingPackageSchema.methods.calculateCustomizedPrice = function(customizedServices = null) {
  const servicesToCalculate = customizedServices || this.services;
  
  const totalPrice = servicesToCalculate.reduce((total, pkgService) => {
    const quantity = pkgService.quantity || 1;
    let servicePrice = pkgService.servicePrice || 0;
    
    // Use discounted price if available
    if (pkgService.serviceDiscountedPrice !== null && pkgService.serviceDiscountedPrice !== undefined) {
      servicePrice = pkgService.serviceDiscountedPrice;
    }
    
    return total + (servicePrice * quantity);
  }, 0);
  
  return totalPrice;
};

// Add method to calculate package duration with all services
weddingPackageSchema.methods.calculateCustomizedDuration = function(customizedServices = null) {
  const servicesToCalculate = customizedServices || this.services;
  
  const totalDuration = servicesToCalculate.reduce((total, pkgService) => {
    const quantity = pkgService.quantity || 1;
    const serviceDuration = pkgService.serviceDuration || 60;
    const prepTime = pkgService.prepTime || 0;
    const setupCleanupTime = pkgService.setupCleanupTime || 0;
    
    return total + ((serviceDuration + prepTime + setupCleanupTime) * quantity);
  }, 0);
  
  return totalDuration;
};

// Add method to validate customization constraints
weddingPackageSchema.methods.validateCustomization = function(customizedServices) {
  if (!this.allowCustomization) {
    throw new Error("Customization is not allowed for this package");
  }
  
  if (customizedServices.length > this.maxCustomizations) {
    throw new Error(`Maximum ${this.maxCustomizations} services allowed in this package`);
  }
  
  // Check if all services belong to the same vendor or are properly multi-vendor
  const vendorIds = [...new Set(customizedServices.map(s => s.vendorId?.toString()).filter(Boolean))];
  if (vendorIds.length > 1) {
    // For multi-vendor packages, ensure all services have vendorId specified
    const servicesWithoutVendor = customizedServices.filter(s => !s.vendorId);
    if (servicesWithoutVendor.length > 0) {
      throw new Error("All services in multi-vendor packages must specify a vendorId");
    }
  }
  
  return true;
};

// Add method to apply customizations to the package
weddingPackageSchema.methods.applyCustomizations = function(customizedServices) {
  // Validate customizations
  this.validateCustomization(customizedServices);
  
  // Update services
  this.services = customizedServices.map(service => ({
    ...service,
    isCustomized: true
  }));
  
  // Recalculate totals
  this.totalPrice = this.calculateCustomizedPrice(customizedServices);
  this.duration = this.calculateCustomizedDuration(customizedServices);
  
  // Apply discount if applicable
  if (this.discountedPrice !== null && this.discountedPrice !== undefined && this.totalPrice < this.originalTotalPrice) {
    this.discountedPrice = this.totalPrice;
  }
  
  return this;
};

// Add method to get deposit amount
weddingPackageSchema.methods.getDepositAmount = function() {
  if (this.depositAmount > 0) {
    return this.depositAmount;
  }
  
  if (this.depositPercentage > 0) {
    const price = this.discountedPrice !== null && this.discountedPrice !== undefined 
      ? this.discountedPrice 
      : this.totalPrice;
    return price * (this.depositPercentage / 100);
  }
  
  return 0;
};

// Add method to calculate package price with discount (backward compatibility)
weddingPackageSchema.methods.calculateDiscountedPrice = function () {
  if (this.discountedPrice !== null && this.discountedPrice !== undefined) {
    return this.discountedPrice;
  }
  return this.totalPrice;
};

// Add method to get total service count
weddingPackageSchema.methods.getServiceCount = function () {
  return this.services.reduce((total, service) => total + (service.quantity || 1), 0);
};

// Add method to populate service details with enhanced information
weddingPackageSchema.methods.populateServiceDetails = async function () {
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
      
      // Extract category name properly
      let categoryName = 'General';
      if (serviceDetails) {
        if (typeof serviceDetails.category === 'string') {
          categoryName = serviceDetails.category;
        } else if (serviceDetails.category && serviceDetails.category.name) {
          categoryName = serviceDetails.category.name;
        } else if (serviceDetails.categoryName) {
          categoryName = serviceDetails.categoryName;
        }
      }

      return {
        ...baseServiceData,
        serviceId: baseServiceData.serviceId || baseServiceData._id,
        serviceName: serviceDetails ? serviceDetails.name : (pkgService.serviceName || baseServiceData.serviceName || ''),
        serviceDescription: serviceDetails ? serviceDetails.description : (baseServiceData.serviceDescription || ''),
        serviceDuration: serviceDetails ? serviceDetails.duration : (baseServiceData.serviceDuration || 60),
        servicePrice: serviceDetails ? serviceDetails.price : (baseServiceData.servicePrice || 0),
        serviceDiscountedPrice: serviceDetails ? serviceDetails.discountedPrice : (baseServiceData.serviceDiscountedPrice || null),
        serviceCategory: categoryName,
        serviceImage: serviceDetails ? serviceDetails.image : (baseServiceData.serviceImage || null),
        serviceHomeService: serviceDetails ? serviceDetails.homeService : (baseServiceData.serviceHomeService || { available: false, charges: null }),
        serviceWeddingService: serviceDetails ? serviceDetails.weddingService : (baseServiceData.serviceWeddingService || { available: false, charges: null }),
        serviceIsAddon: serviceDetails ? (serviceDetails.isAddon || (categoryName && categoryName.toLowerCase().includes('addon'))) : (baseServiceData.serviceIsAddon || false),
        servicePrepTime: serviceDetails ? (serviceDetails.prepTime || 0) : (baseServiceData.servicePrepTime || 0),
        serviceSetupCleanupTime: serviceDetails ? (serviceDetails.setupCleanupTime || 0) : (baseServiceData.serviceSetupCleanupTime || 0)
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
        serviceIsAddon: baseServiceData.serviceIsAddon || false,
        servicePrepTime: baseServiceData.servicePrepTime || 0,
        serviceSetupCleanupTime: baseServiceData.serviceSetupCleanupTime || 0
      };
    }
  }));

  // Ensure we return a properly structured object
  const basePackage = this.toObject ? this.toObject() : this;
  const result = {
    ...basePackage,
    id: basePackage._id || basePackage.id,
    services: populatedServices,
    // Calculate dynamic prices and duration
    calculatedTotalPrice: this.calculateCustomizedPrice(populatedServices),
    calculatedDuration: this.calculateCustomizedDuration(populatedServices)
  };

  return result;
};

const WeddingPackageModel =
  mongoose.models.WeddingPackage || mongoose.model("WeddingPackage", weddingPackageSchema);

export default WeddingPackageModel;