import _db from "@repo/lib/db";
import EnhancedWeddingPackageModel from "@repo/lib/models/Vendor/EnhancedWeddingPackage.model";
import VendorServicesModel from "@repo/lib/models/Vendor/VendorServices.model";
import { authMiddlewareWeb } from "@repo/lib/middlewares/auth";

/**
 * API route for enhanced wedding package management with customization support
 */

export const OPTIONS = async () => {
  const response = new Response(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

// GET: Retrieve enhanced wedding packages for a vendor with populated service details
export const GET = async (request) => {
  try {
    await _db();
    
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const packageId = searchParams.get('packageId');
    const isActive = searchParams.get('isActive');
    
    // Validate required parameters
    if (!vendorId) {
      return new Response(JSON.stringify({ error: 'Vendor ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    let query = { vendorId };
    
    if (packageId) {
      query._id = packageId;
    }
    
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }
    
    const weddingPackages = await EnhancedWeddingPackageModel.find(query)
      .sort({ createdAt: -1 });
    
    // Populate service details for each package
    const populatedPackages = await Promise.all(weddingPackages.map(async (pkg) => {
      return await pkg.populateEnhancedServiceDetails();
    }));
    
    return new Response(JSON.stringify({
      success: true,
      weddingPackages: populatedPackages,
      count: populatedPackages.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error fetching enhanced wedding packages:", error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch wedding packages',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST: Create a new enhanced wedding package
export const POST = async (request) => {
  try {
    await _db();
    
    const body = await request.json();
    const {
      name,
      description,
      vendorId,
      services = [],
      totalPrice,
      discountedPrice = null,
      duration,
      image = null,
      allowCustomization = true,
      maxCustomizations = 10,
      depositRequired = false,
      depositPercentage = 0,
      depositAmount = 0,
      cancellationPolicy = "Standard 24-hour notice required for cancellations"
    } = body;
    
    // Validate required parameters
    if (!name || !description || !vendorId || !services.length || totalPrice === undefined) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate services
    for (const service of services) {
      if (!service.serviceId || !service.serviceName) {
        return new Response(JSON.stringify({ error: 'Each service must have serviceId and serviceName' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Create enhanced wedding package
    const weddingPackage = new EnhancedWeddingPackageModel({
      name,
      description,
      vendorId,
      services,
      totalPrice,
      discountedPrice,
      duration,
      image,
      allowCustomization,
      maxCustomizations,
      depositRequired,
      depositPercentage,
      depositAmount,
      cancellationPolicy
    });
    
    const savedPackage = await weddingPackage.save();
    
    // Populate service details
    const populatedPackage = await savedPackage.populateEnhancedServiceDetails();
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Enhanced wedding package created successfully", 
      weddingPackage: populatedPackage 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error creating enhanced wedding package:", error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create wedding package',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PUT: Update an enhanced wedding package
export const PUT = async (request) => {
  try {
    await _db();
    
    const body = await request.json();
    const {
      packageId,
      ...updateData
    } = body;
    
    if (!packageId) {
      return new Response(JSON.stringify({ error: 'Package ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update the package
    const updatedPackage = await EnhancedWeddingPackageModel.findByIdAndUpdate(
      packageId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedPackage) {
      return new Response(JSON.stringify({ error: 'Wedding package not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Populate service details
    const populatedPackage = await updatedPackage.populateEnhancedServiceDetails();
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Enhanced wedding package updated successfully", 
      weddingPackage: populatedPackage 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error updating enhanced wedding package:", error);
    return new Response(JSON.stringify({ 
      error: 'Failed to update wedding package',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE: Delete an enhanced wedding package
export const DELETE = async (request) => {
  try {
    await _db();
    
    const { searchParams } = new URL(request.url);
    const packageId = searchParams.get('packageId');
    
    if (!packageId) {
      return new Response(JSON.stringify({ error: 'Package ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const deletedPackage = await EnhancedWeddingPackageModel.findByIdAndDelete(packageId);
    
    if (!deletedPackage) {
      return new Response(JSON.stringify({ error: 'Wedding package not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Enhanced wedding package deleted successfully" 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error deleting enhanced wedding package:", error);
    return new Response(JSON.stringify({ 
      error: 'Failed to delete wedding package',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST: Apply customizations to a wedding package
export const POST_CUSTOMIZE = async (request) => {
  try {
    await _db();
    
    const body = await request.json();
    const {
      packageId,
      customizedServices
    } = body;
    
    if (!packageId || !customizedServices) {
      return new Response(JSON.stringify({ error: 'Package ID and customized services are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Find the package
    const weddingPackage = await EnhancedWeddingPackageModel.findById(packageId);
    
    if (!weddingPackage) {
      return new Response(JSON.stringify({ error: 'Wedding package not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Apply customizations
    const customizedPackage = weddingPackage.applyCustomizations(customizedServices);
    await customizedPackage.save();
    
    // Populate service details
    const populatedPackage = await customizedPackage.populateEnhancedServiceDetails();
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Customizations applied successfully", 
      weddingPackage: populatedPackage 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error applying customizations to wedding package:", error);
    return new Response(JSON.stringify({ 
      error: 'Failed to apply customizations',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};