import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

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

    const supplier = await SupplierModel.findById(supplierId).select('firstName lastName shopName description email mobile country state city pincode address supplierType businessRegistrationNo profileImage status referralCode licenseFiles subscription');
    
    console.log("Supplier data from DB:", supplier);

    if (!supplier) {
        return NextResponse.json({ message: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json(supplier, { status: 200 });
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

    // Find the supplier
    const supplier = await SupplierModel.findById(supplierId);
    if (!supplier) {
      return NextResponse.json({ 
        success: false,
        message: "Supplier not found" 
      }, { status: 404 });
    }

    // Debug: Log supplier ID
    console.log('Supplier ID:', supplierId);

    // Remove _id from body if present to prevent accidental updates
    delete body._id;

    // Update allowed fields only
    const allowedFields = [
      'firstName', 'lastName', 'shopName', 'description', 'email', 'mobile',
      'state', 'city', 'pincode', 'address', 'supplierType',
      'businessRegistrationNo', 'profileImage', 'licenseFiles'
    ];

    // Update fields
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        supplier[field] = body[field];
      }
    });

    // Set updatedAt timestamp
    supplier.updatedAt = new Date();

    const updatedSupplier = await supplier.save();
    
    // Return updated supplier without sensitive fields
    const supplierResponse = updatedSupplier.toObject();
    delete supplierResponse.password;
    delete supplierResponse.__v;

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
    
    return NextResponse.json({ 
      success: false,
      message: "Failed to update supplier profile", 
      error: error.message 
    }, { status: 500 });
  }
}, ['supplier']);