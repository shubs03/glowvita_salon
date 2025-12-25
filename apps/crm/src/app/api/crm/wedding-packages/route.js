import _db from "@repo/lib/db";
import WeddingPackageModel from "@repo/lib/models/Vendor/WeddingPackage.model";
import VendorServicesModel from "@repo/lib/models/Vendor/VendorServices.model";
import { authMiddlewareCrm } from "../../../../middlewareCrm.js";
import { uploadBase64, deleteFile } from '@repo/lib/utils/upload';

await _db();

// POST: Create a new wedding package
export const POST = authMiddlewareCrm(async (req) => {
  const vendor = req.user;
  const vendorId = vendor.userId.toString();
  const body = await req.json();
  const { name, description, services, totalPrice, discountedPrice, duration, staffCount, assignedStaff, image } = body;

  // Validate required fields
  if (!name || !description || !services || !Array.isArray(services) || services.length === 0) {
    return Response.json(
      { message: "Name, description, and services array are required" },
      { status: 400 }
    );
  }

  if (!totalPrice || totalPrice <= 0) {
    return Response.json(
      { message: "Valid total price is required" },
      { status: 400 }
    );
  }

  if (!duration || duration <= 0) {
    return Response.json(
      { message: "Valid duration is required" },
      { status: 400 }
    );
  }

  try {
    // Handle image upload if provided
    let imageUrl = null;
    if (image) {
      const fileName = `wedding-package-${vendorId}-${Date.now()}`;
      imageUrl = await uploadBase64(image, fileName);
      
      if (!imageUrl) {
        console.warn('Failed to upload wedding package image:', name);
      }
    }

    // Create wedding package
    const weddingPackage = new WeddingPackageModel({
      name,
      description,
      vendorId,
      services,
      totalPrice,
      discountedPrice: discountedPrice || null,
      duration,
      staffCount: staffCount || 1,
      assignedStaff: assignedStaff || [],
      image: imageUrl || null,
    });

    const savedPackage = await weddingPackage.save();

    return Response.json(
      { message: "Wedding package created successfully", weddingPackage: savedPackage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating wedding package:", error);
    return Response.json(
      { message: "Failed to create wedding package", error: error.message },
      { status: 500 }
    );
  }
}, ["vendor"]);

// GET: Retrieve wedding packages for a vendor
export const GET = authMiddlewareCrm(async (req) => {
  const vendor = req.user;
  const vendorId = vendor.userId.toString();

  try {
    const weddingPackages = await WeddingPackageModel.find({ vendorId, isActive: true })
      .sort({ createdAt: -1 });

    // Populate service details for each package using the enhanced method
    const populatedPackages = await Promise.all(weddingPackages.map(async (pkg) => {
      // Use the built-in method to populate service details
      const populatedPackage = await pkg.populateServiceDetails();
      return populatedPackage;
    }));

    return Response.json({
      success: true,
      weddingPackages: populatedPackages,
      count: populatedPackages.length
    });
  } catch (error) {
    console.error("Error fetching wedding packages:", error);
    return Response.json(
      { message: "Failed to fetch wedding packages", error: error.message },
      { status: 500 }
    );
  }
}, ["vendor"]);

// PUT: Update a wedding package
export const PUT = authMiddlewareCrm(async (req) => {
  const vendor = req.user;
  const vendorId = vendor.userId.toString();
  const body = await req.json();
  const { packageId, ...updateData } = body;

  if (!packageId) {
    return Response.json(
      { message: "Package ID is required" },
      { status: 400 }
    );
  }

  try {
    // Check if package belongs to vendor
    const existingPackage = await WeddingPackageModel.findOne({ _id: packageId, vendorId });
    
    if (!existingPackage) {
      return Response.json(
        { message: "Wedding package not found or does not belong to vendor" },
        { status: 404 }
      );
    }

    // Handle image upload if provided
    let imageUrl = existingPackage.image;
    if (updateData.image !== undefined) {
      if (updateData.image) {
        // Upload new image
        const fileName = `wedding-package-${vendorId}-${Date.now()}`;
        imageUrl = await uploadBase64(updateData.image, fileName);
        
        if (!imageUrl) {
          console.warn('Failed to upload wedding package image:', updateData.name);
          imageUrl = existingPackage.image; // Keep the original value if upload failed
        }
        
        // Delete old image if it exists and is different
        if (existingPackage.image && existingPackage.image !== imageUrl) {
          await deleteFile(existingPackage.image);
        }
      } else {
        // If image is null/empty, delete the old image
        if (existingPackage.image) {
          await deleteFile(existingPackage.image);
        }
        imageUrl = null;
      }
    }

    // Update package
    const updatedPackage = await WeddingPackageModel.findByIdAndUpdate(
      packageId,
      {
        ...updateData,
        image: imageUrl,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    // Populate service details
    const populatedPackage = await updatedPackage.populateServiceDetails();

    return Response.json(
      { message: "Wedding package updated successfully", weddingPackage: populatedPackage },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating wedding package:", error);
    return Response.json(
      { message: "Failed to update wedding package", error: error.message },
      { status: 500 }
    );
  }
}, ["vendor"]);

// DELETE: Remove a wedding package
export const DELETE = authMiddlewareCrm(async (req) => {
  const vendor = req.user;
  const vendorId = vendor.userId.toString();
  const body = await req.json();
  const { packageId } = body;

  if (!packageId) {
    return Response.json(
      { message: "Package ID is required" },
      { status: 400 }
    );
  }

  try {
    // Check if package belongs to vendor
    const existingPackage = await WeddingPackageModel.findOne({ _id: packageId, vendorId });
    
    if (!existingPackage) {
      return Response.json(
        { message: "Wedding package not found or does not belong to vendor" },
        { status: 404 }
      );
    }

    // Delete image from VPS if it exists
    if (existingPackage.image) {
      await deleteFile(existingPackage.image);
    }

    // Delete package
    await WeddingPackageModel.findByIdAndUpdate(packageId, { 
      isActive: false, 
      updatedAt: Date.now() 
    });

    return Response.json(
      { message: "Wedding package deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting wedding package:", error);
    return Response.json(
      { message: "Failed to delete wedding package", error: error.message },
      { status: 500 }
    );
  }
}, ["vendor"]);