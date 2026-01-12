import { useState, useEffect } from 'react';
import { Service } from '@/hooks/useBookingData';

export interface EnhancedWeddingPackageService {
  serviceId: string;
  serviceName: string;
  quantity: number;
  staffRequired: boolean;
  vendorId?: string;
  prepTime: number;
  setupCleanupTime: number;
  isCustomized: boolean;
  customizations: Record<string, any>;
  // Enhanced service details
  serviceDescription?: string;
  serviceDuration?: number;
  servicePrice?: number;
  serviceDiscountedPrice?: number | null;
  serviceCategory?: string;
  serviceImage?: string | null;
  serviceHomeService?: {
    available: boolean;
    charges: number | null;
  };
  serviceWeddingService?: {
    available: boolean;
    charges: number | null;
  };
  serviceIsAddon?: boolean;
  servicePrepTime?: number;
  serviceSetupCleanupTime?: number;
}

export interface EnhancedWeddingPackage {
  id: string;
  name: string;
  description: string;
  vendorId: string;
  services: EnhancedWeddingPackageService[];
  totalPrice: number;
  discountedPrice: number | null;
  duration: number;
  allowCustomization: boolean;
  maxCustomizations: number;
  depositRequired: boolean;
  depositPercentage: number;
  depositAmount: number;
  cancellationPolicy: string;
  image: string | null;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Calculated fields
  calculatedTotalPrice?: number;
  calculatedDuration?: number;
}

interface UseEnhancedWeddingPackagesProps {
  vendorId: string;
}

export const useEnhancedWeddingPackages = ({ vendorId }: UseEnhancedWeddingPackagesProps) => {
  const [packages, setPackages] = useState<EnhancedWeddingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch packages
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/wedding-packages/enhanced?vendorId=${vendorId}`);
      const data = await response.json();

      if (data.success) {
        setPackages(data.weddingPackages);
      } else {
        setError(data.error || 'Failed to fetch wedding packages');
      }
    } catch (err) {
      setError('Failed to fetch wedding packages');
      console.error('Error fetching wedding packages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new package
  const createPackage = async (packageData: Omit<EnhancedWeddingPackage, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/wedding-packages/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchPackages(); // Refresh the list
        return { success: true, package: data.weddingPackage };
      } else {
        return { success: false, error: data.error || 'Failed to create package' };
      }
    } catch (err) {
      console.error('Error creating wedding package:', err);
      return { success: false, error: 'Failed to create package' };
    }
  };

  // Update a package
  const updatePackage = async (packageId: string, updateData: Partial<EnhancedWeddingPackage>) => {
    try {
      const response = await fetch('/api/wedding-packages/enhanced', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId, ...updateData }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchPackages(); // Refresh the list
        return { success: true, package: data.weddingPackage };
      } else {
        return { success: false, error: data.error || 'Failed to update package' };
      }
    } catch (err) {
      console.error('Error updating wedding package:', err);
      return { success: false, error: 'Failed to update package' };
    }
  };

  // Delete a package
  const deletePackage = async (packageId: string) => {
    try {
      const response = await fetch(`/api/wedding-packages/enhanced?packageId=${packageId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchPackages(); // Refresh the list
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to delete package' };
      }
    } catch (err) {
      console.error('Error deleting wedding package:', err);
      return { success: false, error: 'Failed to delete package' };
    }
  };

  // Apply customizations to a package
  const applyCustomizations = async (packageId: string, customizedServices: EnhancedWeddingPackageService[]) => {
    try {
      const response = await fetch('/api/wedding-packages/enhanced/customize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId, customizedServices }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchPackages(); // Refresh the list
        return { success: true, package: data.weddingPackage };
      } else {
        return { success: false, error: data.error || 'Failed to apply customizations' };
      }
    } catch (err) {
      console.error('Error applying customizations:', err);
      return { success: false, error: 'Failed to apply customizations' };
    }
  };

  // Calculate total price based on selected services and quantities
  const calculateTotalPrice = (services: EnhancedWeddingPackageService[]) => {
    return services.reduce((total, service) => {
      const quantity = service.quantity || 1;
      let price = service.servicePrice || 0;

      // Use discounted price if available
      if (service.serviceDiscountedPrice !== null && service.serviceDiscountedPrice !== undefined) {
        price = service.serviceDiscountedPrice;
      }

      return total + (price * quantity);
    }, 0);
  };

  // Calculate total duration based on selected services and quantities
  const calculateTotalDuration = (services: EnhancedWeddingPackageService[]) => {
    return services.reduce((total, service) => {
      const quantity = service.quantity || 1;
      const duration = service.serviceDuration || 60;
      const prepTime = service.servicePrepTime || service.prepTime || 0;
      const setupCleanupTime = service.serviceSetupCleanupTime || service.setupCleanupTime || 0;

      return total + ((duration + prepTime + setupCleanupTime) * quantity);
    }, 0);
  };

  // Get deposit amount for a package
  const getDepositAmount = (pkg: EnhancedWeddingPackage) => {
    if (pkg.depositAmount > 0) {
      return pkg.depositAmount;
    }

    if (pkg.depositPercentage > 0) {
      const price = pkg.discountedPrice !== null && pkg.discountedPrice !== undefined
        ? pkg.discountedPrice
        : pkg.totalPrice;
      return price * (pkg.depositPercentage / 100);
    }

    return 0;
  };

  // Validate customization constraints
  const validateCustomization = (pkg: EnhancedWeddingPackage, customizedServices: EnhancedWeddingPackageService[]) => {
    if (!pkg.allowCustomization) {
      return { valid: false, error: "Customization is not allowed for this package" };
    }

    if (customizedServices.length > pkg.maxCustomizations) {
      return { valid: false, error: `Maximum ${pkg.maxCustomizations} services allowed in this package` };
    }

    // Check if all services belong to the same vendor or are properly multi-vendor
    const vendorIds = customizedServices
      .map(s => s.vendorId)
      .filter((id, index, self) => id && self.indexOf(id) === index);
    if (vendorIds.length > 1) {
      // For multi-vendor packages, ensure all services have vendorId specified
      const servicesWithoutVendor = customizedServices.filter(s => !s.vendorId);
      if (servicesWithoutVendor.length > 0) {
        return { valid: false, error: "All services in multi-vendor packages must specify a vendorId" };
      }
    }

    return { valid: true };
  };

  // Initialize with fetch
  useEffect(() => {
    if (vendorId) {
      fetchPackages();
    }
  }, [vendorId]);

  return {
    packages,
    loading,
    error,
    fetchPackages,
    createPackage,
    updatePackage,
    deletePackage,
    applyCustomizations,
    calculateTotalPrice,
    calculateTotalDuration,
    getDepositAmount,
    validateCustomization
  };
};