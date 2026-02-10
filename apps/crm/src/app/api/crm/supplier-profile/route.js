import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
import SmsTransaction from '@repo/lib/models/Marketing/SmsPurchaseHistory.model';
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

    const supplier = await SupplierModel.findById(supplierId).select('firstName lastName shopName description email mobile country state city pincode address supplierType businessRegistrationNo profileImage gallery documents bankDetails status referralCode licenseFiles subscription smsBalance taxes');

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

    // Return in the same format as vendor profile API
    return NextResponse.json({
      success: true,
      data: supplierResponse
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching supplier profile:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch supplier profile",
      error: error.message
    }, { status: 500 });
  }
}, ['supplier']);

// Utility function to process base64 image and upload it
// Also deletes the old image if a new one is uploaded
const processBase64Image = async (base64String, fileName, oldImageUrl = null) => {
  if (!base64String) return null;

  // Check if it's already a URL (not base64)
  if (base64String.startsWith('http')) {
    return base64String; // Already uploaded, return as is
  }

  // Upload the base64 image and return the URL
  const imageUrl = await uploadBase64(base64String, fileName);

  // If upload was successful and there's an old image, delete the old one
  if (imageUrl && oldImageUrl && oldImageUrl.startsWith('http')) {
    try {
      // Attempt to delete the old file
      // We don't await this as we don't want to fail the whole operation if deletion fails
      deleteFile(oldImageUrl).catch(err => {
        console.warn('Failed to delete old image:', err);
      });
    } catch (err) {
      console.warn('Error deleting old image:', err);
    }
  }

  return imageUrl;
};

// PUT - Update supplier profile
export const PUT = authMiddlewareCrm(async (req) => {
  try {
    const supplierId = req.user.userId || req.user._id;
    const body = await req.json();

    console.log('Updating supplier profile for ID:', supplierId);

    // Find the supplier with populated subscription data
    const supplier = await SupplierModel.findById(supplierId).populate('subscription.plan');
    if (!supplier) {
      return NextResponse.json({
        success: false,
        message: "Supplier not found"
      }, { status: 404 });
    }

    // Remove _id from body if present to prevent accidental updates
    delete body._id;
    delete body.id;

    // Update allowed fields only
    const allowedFields = [
      'firstName', 'lastName', 'shopName', 'description', 'email', 'mobile',
      'country', 'state', 'city', 'pincode', 'address', 'supplierType',
      'businessRegistrationNo', 'profileImage', 'gallery', 'documents', 'bankDetails', 'licenseFiles', 'referralCode', 'taxes'
    ];

    // Keep existing subscription data unless specifically provided in the update
    if (body.subscription) {
      Object.keys(body.subscription).forEach(key => {
        if (['plan', 'status', 'startDate', 'endDate', 'history'].includes(key)) {
          supplier.subscription[key] = body.subscription[key];
        }
      });
    }

    // Update fields
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Handle profile image upload
        if (field === 'profileImage') {
          if (body[field] && !body[field].startsWith('http')) {
            const imageUrl = await processBase64Image(body[field], `supplier-${supplierId}-profile`, supplier.profileImage);
            if (imageUrl) {
              supplier.profileImage = imageUrl;
            }
          } else {
            supplier.profileImage = body[field];
          }
        }
        // Handle gallery images upload
        else if (field === 'gallery' && Array.isArray(body[field])) {
          const finalGallery = [];
          const currentGallery = supplier.gallery || [];

          for (let i = 0; i < body[field].length; i++) {
            const item = body[field][i];
            if (item && !item.startsWith('http')) {
              // It's a base64 image
              const oldImageUrl = currentGallery[i] || null;
              const imageUrl = await processBase64Image(item, `supplier-${supplierId}-gallery-${i}`, oldImageUrl);
              if (imageUrl) {
                finalGallery.push(imageUrl);
              }
            } else if (item && item.startsWith('http')) {
              // It's an existing URL
              finalGallery.push(item);
            }
          }

          // Cleanup: Delete images that are no longer in the gallery
          for (const oldImage of currentGallery) {
            if (!finalGallery.includes(oldImage)) {
              await deleteFile(oldImage).catch(err => console.error("Error deleting old gallery image:", err));
            }
          }
          supplier.gallery = finalGallery;
          supplier.markModified('gallery');
        }
        // Handle bankDetails
        else if (field === 'bankDetails' && typeof body[field] === 'object') {
          if (!supplier.bankDetails) supplier.bankDetails = {};
          Object.keys(body[field]).forEach(key => {
            if (['bankName', 'accountNumber', 'ifscCode', 'accountHolder', 'upiId'].includes(key)) {
              supplier.bankDetails[key] = body[field][key];
            }
          });
          supplier.markModified('bankDetails');
        }
        // Handle documents
        else if (field === 'documents' && typeof body[field] === 'object') {
          if (!supplier.documents) supplier.documents = {};
          const docTypes = ["aadharCard", "udyogAadhar", "udhayamCert", "shopLicense", "panCard"];

          for (const docType of docTypes) {
            if (body[field][docType] !== undefined) {
              if (body[field][docType] && !body[field][docType].startsWith('http')) {
                const oldDocUrl = supplier.documents[docType];
                const docUrl = await processBase64Image(body[field][docType], `supplier-${supplierId}-doc-${docType}`, oldDocUrl);
                if (docUrl) {
                  supplier.documents[docType] = docUrl;
                  supplier.documents[`${docType}Status`] = "pending";
                  supplier.documents[`${docType}RejectionReason`] = null;
                  supplier.documents[`${docType}AdminRejectionReason`] = null;
                }
              } else {
                supplier.documents[docType] = body[field][docType];
              }
            }
          }
          supplier.markModified('documents');
        }
        // Handle taxes
        else if (field === 'taxes' && typeof body[field] === 'object') {
          if (!supplier.taxes) supplier.taxes = {};
          Object.keys(body[field]).forEach(key => {
            if (['taxValue', 'taxType'].includes(key)) {
              supplier.taxes[key] = body[field][key];
            }
          });
          supplier.markModified('taxes');
        }
        else if (field !== 'profileImage' && field !== 'gallery' && field !== 'documents' && field !== 'bankDetails' && field !== 'taxes') {
          // Handle other fields
          supplier[field] = body[field];
        }
      }
    }

    // Set updatedAt timestamp
    supplier.updatedAt = new Date();

    // Handle subscription validation issues gracefully (similar to vendor API)
    if (!supplier.subscription || !supplier.subscription.plan || !supplier.subscription.endDate) {
      console.log('Supplier has incomplete subscription data, using validateBeforeSave: false');
      try {
        const updatedSupplier = await supplier.save({ validateBeforeSave: false });
        const supplierResponse = updatedSupplier.toObject();
        delete supplierResponse.password;
        delete supplierResponse.__v;
        return NextResponse.json({
          success: true,
          message: "Supplier profile updated successfully",
          data: supplierResponse
        }, { status: 200 });
      } catch (saveError) {
        console.error('Error saving supplier without validation:', saveError);
        return NextResponse.json({
          success: false,
          message: "Failed to update supplier profile",
          error: saveError.message
        }, { status: 500 });
      }
    }

    try {
      const updatedSupplier = await supplier.save();
      const supplierResponse = updatedSupplier.toObject();
      delete supplierResponse.password;
      delete supplierResponse.__v;

      return NextResponse.json({
        success: true,
        message: "Supplier profile updated successfully",
        data: supplierResponse
      }, { status: 200 });
    } catch (saveError) {
      console.error('Mongoose validation error:', saveError);
      if (saveError.name === 'ValidationError') {
        if (saveError.errors?.['subscription.plan'] || saveError.errors?.['subscription.endDate']) {
          return NextResponse.json({
            success: false,
            message: "Supplier subscription data is incomplete.",
            error: "Missing required subscription fields"
          }, { status: 400 });
        }
      }
      throw saveError;
    }
  } catch (error) {
    console.error('Error updating supplier profile:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json({
        success: false,
        message: `Supplier with this ${field} already exists`
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      message: "Failed to update supplier profile",
      error: error.message
    }, { status: 500 });
  }
}, ['supplier']);