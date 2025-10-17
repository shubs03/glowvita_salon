import { NextResponse } from "next/server";
import _db from '../../../../../../../packages/lib/src/db.js';
import SmsPackage from '../../../../../../../packages/lib/src/models/Marketing/SmsPackage.model.js';
import SmsPurchaseHistory from '../../../../../../../packages/lib/src/models/Marketing/SmsPurchaseHistory.model.js';
import VendorModel from '../../../../../../../packages/lib/src/models/Vendor/Vendor.model.js';
import { authMiddlewareCrm } from '../../../../middlewareCrm.js';

// POST: Purchase an SMS package
export const POST = authMiddlewareCrm(async (req, ctx) => {
  try {
    console.log('Received POST /api/crm/sms-purchase request');
    console.log('Auth context:', ctx);
    
    // Connect to database
    const db = await _db();
    console.log('Database connection status:', db ? 'Connected' : 'Not connected');
    
    // Log request headers for debugging
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Extract vendorId with improved logic
    console.log('Raw user object:', req.user);
    
    // Try multiple ways to get the vendor ID with better error handling
    let vendorId = null;
    if (req.user) {
      // Try different possible fields in order of preference
      const possibleFields = ['vendorId', '_id', 'id', 'userId'];
      for (const field of possibleFields) {
        if (req.user[field]) {
          vendorId = req.user[field];
          console.log(`Found vendor ID in field '${field}':`, vendorId);
          break;
        }
      }
    }
    
    console.log('Final extracted Vendor ID:', vendorId);
    
    // Verify vendorId
    if (!vendorId) {
      console.error('No vendor ID found in user object');
      return NextResponse.json(
        { 
          success: false,
          message: 'Authentication required. Please log in again.' 
        },
        { status: 401 }
      );
    }
    
    // Validate MongoDB ObjectId format
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(vendorId)) {
      console.error('Invalid vendor ID format:', vendorId);
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid vendor ID format. Please contact support.' 
        },
        { status: 400 }
      );
    }
    
    const validatedVendorId = vendorId;
    
    // Get package ID from request body
    let body;
    try {
      body = await req.json();
      console.log('Request body:', body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid request format' 
        },
        { status: 400 }
      );
    }
    
    const { packageId } = body;
    
    if (!packageId) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Package ID is required' 
        },
        { status: 400 }
      );
    }
    
    // Validate packageId format
    if (!packageId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid package ID format' 
        },
        { status: 400 }
      );
    }
    
    console.log('Package ID to purchase:', packageId);
    
    // Find the SMS package
    console.log('Searching for SMS package with ID:', packageId);
    const smsPackage = await SmsPackage.findById(packageId);
    console.log('Found SMS package:', smsPackage);
    
    if (!smsPackage) {
      console.error('SMS package not found with ID:', packageId);
      return NextResponse.json(
        { 
          success: false,
          message: 'SMS package not found' 
        },
        { status: 404 }
      );
    }
    
    console.log('Found SMS package:', smsPackage);
    
    // Calculate expiry date (purchase date + validity days)
    const purchaseDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(purchaseDate.getDate() + smsPackage.validityDays);
    
    console.log('Purchase date:', purchaseDate);
    console.log('Expiry date:', expiryDate);
    
    // Create purchase history record
    console.log('Creating purchase history record with data:', {
      vendorId: validatedVendorId,
      packageId: smsPackage._id,
      packageName: smsPackage.name,
      smsCount: smsPackage.smsCount,
      price: smsPackage.price,
      purchaseDate,
      expiryDate,
      status: 'active'
    });
    
    const purchaseHistory = new SmsPurchaseHistory({
      vendorId: validatedVendorId,
      packageId: smsPackage._id,
      packageName: smsPackage.name,
      smsCount: smsPackage.smsCount,
      price: smsPackage.price,
      purchaseDate,
      expiryDate,
      status: 'active'
    });
    
    await purchaseHistory.save();
    console.log('Purchase history saved:', purchaseHistory);
    
    // Update vendor's SMS balance
    console.log('Searching for vendor with ID:', validatedVendorId);
    const vendor = await VendorModel.findById(validatedVendorId);
    console.log('Found vendor:', vendor);
    
    if (!vendor) {
      console.error('Vendor not found with ID:', validatedVendorId);
      return NextResponse.json(
        { 
          success: false,
          message: 'Vendor not found' 
        },
        { status: 404 }
      );
    }
    
    console.log('Current SMS balance:', vendor.smsBalance);
    
    // Add SMS count to vendor's balance
    console.log('Current vendor SMS balance:', vendor.smsBalance);
    vendor.smsBalance = (vendor.smsBalance || 0) + smsPackage.smsCount;
    console.log('New vendor SMS balance:', vendor.smsBalance);
    await vendor.save();
    
    console.log('Updated SMS balance:', vendor.smsBalance);
    
    return NextResponse.json({
      success: true,
      message: 'SMS package purchased successfully',
      data: {
        purchaseHistory,
        newBalance: vendor.smsBalance
      }
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error in POST /api/crm/sms-purchase:', error);
    console.error('Error stack:', error.stack);
    
    // More specific error messages based on error type
    let errorMessage = 'Error purchasing SMS package';
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + Object.values(error.errors).map(err => err.message).join(', ');
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid data format';
    } else if (error.code === 11000) {
      errorMessage = 'Duplicate entry error';
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: errorMessage, 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}, ['vendor']);

// GET: Retrieve purchase history for the vendor
export const GET = authMiddlewareCrm(async (req, ctx) => {
  try {
    console.log('Received GET /api/crm/sms-purchase request');
    console.log('Auth context:', ctx);
    
    // Connect to database
    const db = await _db();
    console.log('Database connection status:', db ? 'Connected' : 'Not connected');
    
    // Log request headers for debugging
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Extract vendorId with improved logic
    console.log('Raw user object:', req.user);
    
    // Try multiple ways to get the vendor ID with better error handling
    let vendorId = null;
    if (req.user) {
      // Try different possible fields in order of preference
      const possibleFields = ['vendorId', '_id', 'id', 'userId'];
      for (const field of possibleFields) {
        if (req.user[field]) {
          vendorId = req.user[field];
          console.log(`Found vendor ID in field '${field}':`, vendorId);
          break;
        }
      }
    }
    
    console.log('Final extracted Vendor ID:', vendorId);
    
    // Verify vendorId
    if (!vendorId) {
      console.error('No vendor ID found in user object');
      return NextResponse.json(
        { 
          success: false,
          message: 'Authentication required. Please log in again.' 
        },
        { status: 401 }
      );
    }
    
    // Validate MongoDB ObjectId format
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(vendorId)) {
      console.error('Invalid vendor ID format:', vendorId);
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid vendor ID format. Please contact support.' 
        },
        { status: 400 }
      );
    }
    
    const validatedVendorId = vendorId;
    
    // Get query parameters for pagination
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    
    console.log('Pagination params - Page:', page, 'Limit:', limit);
    
    // Find purchase history for this vendor
    console.log('Searching purchase history for vendor ID:', validatedVendorId);
    const total = await SmsPurchaseHistory.countDocuments({ vendorId: validatedVendorId });
    console.log('Total purchase history records found:', total);
    const purchases = await SmsPurchaseHistory.find({ vendorId: validatedVendorId })
      .sort({ purchaseDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    console.log('Purchase history records retrieved:', purchases.length);
    
    console.log(`Found ${purchases.length} purchases out of ${total} total`);
    
    // Get vendor's current SMS balance
    console.log('Retrieving vendor for balance check with ID:', validatedVendorId);
    const vendor = await VendorModel.findById(validatedVendorId);
    console.log('Vendor found for balance check:', vendor);
    const currentBalance = vendor ? vendor.smsBalance : 0;
    console.log('Current balance:', currentBalance);
    
    return NextResponse.json({
      success: true,
      data: {
        purchases,
        currentBalance,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error in GET /api/crm/sms-purchase:', error);
    console.error('Error stack:', error.stack);
    
    // More specific error messages based on error type
    let errorMessage = 'Error fetching purchase history';
    if (error.name === 'CastError') {
      errorMessage = 'Invalid data format';
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: errorMessage, 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}, ['vendor']);