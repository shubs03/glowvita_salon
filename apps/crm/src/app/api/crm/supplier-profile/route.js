import { NextResponse } from 'next/server';
import _db from '../../../../../../../packages/lib/src/db.js';
import SupplierModel from '../../../../../../../packages/lib/src/models/Vendor/Supplier.model.js';
import SmsTransaction from '../../../../../../../packages/lib/src/models/Marketing/SmsPurchaseHistory.model.js';
import { authMiddlewareCrm } from '@/middlewareCrm.js';
import { uploadBase64, deleteFile } from '@repo/lib/utils/upload';

await _db();

// GET the current supplier's profile
export const GET = authMiddlewareCrm(async (req) => {
  try {
    const supplierId = req.user.userId || req.user._id;
    
    console.log("Fetching supplier profile for ID:", supplierId);
    console.log("User from token:", req.user);

    if (!supplierId) {
        return NextResponse.json({ message: "Supplier ID is required" }, { status: 400 });
    }

    const supplier = await SupplierModel.findById(supplierId).select('firstName lastName shopName description email mobile country state city pincode address supplierType businessRegistrationNo profileImage status referralCode licenseFiles subscription smsBalance');
    
    console.log("Supplier data from DB:", supplier);

    if (!supplier) {
        return NextResponse.json({ message: "Supplier not found" }, { status: 404 });
    }

    // Get the active SMS package information
    let activePackageSmsCount = 0;
    const activePackages = await SmsTransaction.find({ 
      userId: supplierId,
      userType: 'supplier',
      status: 'active',
      expiryDate: { $gte: new Date() }
    }).sort({ purchaseDate: -1 });
    
    if (activePackages.length > 0) {
      // Use the most recent active package
      activePackageSmsCount = activePackages[0].smsCount;
    }

    // Add the active package SMS count to the response (this represents the current balance)
    const supplierResponse = supplier.toObject();
    supplierResponse.currentSmsBalance = activePackageSmsCount;  // SMS count from active package

    return NextResponse.json(supplierResponse, { status: 200 });
  } catch (error) {
    console.error("Error fetching supplier profile:", error);
    return NextResponse.json({ message: "Failed to fetch supplier profile" }, { status: 500 });
  }
}, ['supplier']);

// PUT - Update supplier profile
export const PUT = authMiddlewareCrm(async (req) => {
  try {
    const supplierId = req.user.userId || req.user._id;
    const body = await req.json();

    console.log('Updating supplier profile for ID:', supplierId);
    console.log('Update data:', body);

    // Find the supplier
    const supplier = await SupplierModel.findById(supplierId);
    if (!supplier) {
      console.log('Supplier not found with ID:', supplierId);
      return NextResponse.json({ 
        success: false,
        message: "Supplier not found" 
      }, { status: 404 });
    }

    // Debug: Log supplier ID
    console.log('Supplier ID:', supplierId);

    // Remove _id from body if present to prevent accidental updates
    delete body._id;
    delete body.id; // Also remove id if present

    // Handle profile image upload if provided
    if (body.profileImage !== undefined) {
      if (body.profileImage) {
        // Upload new image to VPS
        const fileName = `supplier-${supplierId}-profile`;
        const imageUrl = await uploadBase64(body.profileImage, fileName);
        
        if (!imageUrl) {
          return NextResponse.json(
            { success: false, message: "Failed to upload profile image" },
            { status: 500 }
          );
        }
        
        // Delete old image from VPS if it exists
        if (supplier.profileImage) {
          await deleteFile(supplier.profileImage);
        }
        
        body.profileImage = imageUrl;
      } else {
        // If image is null/empty, remove it
        body.profileImage = null;
        
        // Delete old image from VPS if it exists
        if (supplier.profileImage) {
          await deleteFile(supplier.profileImage);
        }
      }
    }

    // Handle license files upload if provided
    if (body.licenseFiles !== undefined) {
      if (Array.isArray(body.licenseFiles)) {
        const uploadedFiles = [];
        for (let i = 0; i < body.licenseFiles.length; i++) {
          const file = body.licenseFiles[i];
          if (file) {
            // Upload new file to VPS
            const fileName = `supplier-${supplierId}-license-${i}`;
            const fileUrl = await uploadBase64(file, fileName);
            
            if (fileUrl) {
              uploadedFiles.push(fileUrl);
            }
          }
        }
        body.licenseFiles = uploadedFiles;
      } else {
        body.licenseFiles = [];
      }
    }

    // Update allowed fields only
    const allowedFields = [
      'firstName', 'lastName', 'shopName', 'description', 'email', 'mobile',
      'country', 'state', 'city', 'pincode', 'address', 'supplierType',
      'businessRegistrationNo', 'profileImage', 'licenseFiles', 'referralCode'
    ];

    console.log('Updating fields:', allowedFields);

    // Update fields
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        console.log(`Updating field ${field} with value:`, body[field]);
        supplier[field] = body[field];
      }
    });

    // Handle subscription updates carefully
    if (body.subscription !== undefined) {
      // Only update subscription if it contains meaningful data
      if (body.subscription && 
          (body.subscription.plan || body.subscription.endDate || 
           body.subscription.startDate || (body.subscription.history && body.subscription.history.length > 0))) {
        
        // Validate that required fields are present if any subscription data is provided
        if (body.subscription.plan && body.subscription.endDate) {
          supplier.subscription = body.subscription;
        }
        // If partial data is provided, we'll let the model's pre-save hook handle assigning a default subscription
      }
      // If subscription is explicitly set to null or empty object, let the model's pre-save hook assign a default
    }
    // If subscription is not mentioned in the update, preserve existing (do nothing)

    // Set updatedAt timestamp
    supplier.updatedAt = new Date();

    console.log('Saving supplier with data:', supplier.toObject());

    const updatedSupplier = await supplier.save();
    
    // Return updated supplier without sensitive fields
    const supplierResponse = updatedSupplier.toObject();
    delete supplierResponse.password;
    delete supplierResponse.__v;

    console.log('Supplier updated successfully:', supplierResponse);

    return NextResponse.json({ 
      success: true,
      message: "Supplier profile updated successfully",
      data: supplierResponse
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating supplier profile:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json({ 
        success: false,
        message: `Supplier with this ${field} already exists` 
      }, { status: 409 });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ 
        success: false,
        message: "Validation error", 
        errors: errors
      }, { status: 400 });
    }
    
    // Handle custom validation errors
    if (error.name === 'Error') {
      return NextResponse.json({ 
        success: false,
        message: "Validation error", 
        errors: [error.message]
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false,
      message: "Failed to update supplier profile", 
      error: error.message 
    }, { status: 500 });
  }
}, ['supplier']);