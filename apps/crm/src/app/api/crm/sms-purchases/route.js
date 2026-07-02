import { NextResponse } from "next/server";
import _db from '@repo/lib/db';
import SmsPackage from '@repo/lib/models/Marketing/SmsPackage.model';
import SmsTransaction from '@repo/lib/models/Marketing/SmsPurchaseHistory.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
import { authMiddlewareCrm } from '../../../../middlewareCrm.js';

// POST: Purchase an SMS package
export const POST = authMiddlewareCrm(async (req, ctx) => {
  try {


    // Connect to database
    const db = await _db();

    // Log request headers for debugging

    // Extract vendorId with improved logic

    // Try multiple ways to get the vendor ID with better error handling
    let vendorId = null;
    let supplierId = null;
    let userType = null;

    if (req.user) {
      // Determine user type
      if (req.user.userType) {
        userType = req.user.userType;
      } else if (req.user.role === 'supplier') {
        userType = 'supplier';
      } else {
        userType = 'vendor';
      }

      // Extract ID based on user type
      if (userType === 'supplier') {
        const possibleFields = ['supplierId', '_id', 'id', 'userId'];
        for (const field of possibleFields) {
          if (req.user[field]) {
            supplierId = req.user[field];
            break;
          }
        }
      } else {
        const possibleFields = ['vendorId', '_id', 'id', 'userId'];
        for (const field of possibleFields) {
          if (req.user[field]) {
            vendorId = req.user[field];
            break;
          }
        }
      }
    }


    // Verify we have the appropriate ID
    if (userType === 'supplier' && !supplierId) {
      console.error('No supplier ID found in user object for supplier user');
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required. Please log in again.'
        },
        { status: 401 }
      );
    }

    if (userType === 'vendor' && !vendorId) {
      console.error('No vendor ID found in user object for vendor user');
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required. Please log in again.'
        },
        { status: 401 }
      );
    }

    const validatedVendorId = userType === 'vendor' ? vendorId : null;
    const validatedSupplierId = userType === 'supplier' ? supplierId : null;

    // Parse request body
    let body;
    try {
      body = await req.json();
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

    const { packageId, paymentMethod = 'Online' } = body;

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


    // Find the SMS package
    const smsPackage = await SmsPackage.findById(packageId);

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


    // Calculate expiry date (purchase date + validity days)
    const purchaseDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(purchaseDate.getDate() + smsPackage.validityDays);


    // Check if supplier already has an active SMS package
    if (userType === 'supplier') {
      const activePackage = await SmsTransaction.findOne({
        userId: validatedSupplierId,
        userType: 'supplier',
        status: 'active',
        expiryDate: { $gte: new Date() }
      });

      if (activePackage) {
        return NextResponse.json(
          {
            success: false,
            message: 'You already have an active SMS package.'
          },
          { status: 409 }
        );
      }
    }

    // Check if this purchase already exists to prevent duplicates (same package on same day)
    let existingPurchase = null;
    if (userType === 'supplier') {
      const startOfDay = new Date(purchaseDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(purchaseDate);
      endOfDay.setHours(23, 59, 59, 999);

      existingPurchase = await SmsTransaction.findOne({
        userId: validatedSupplierId,
        userType: 'supplier',
        packageId: smsPackage._id,
        purchaseDate: {
          $gte: startOfDay,
          $lt: endOfDay
        }
      });
    } else {
      const startOfDay = new Date(purchaseDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(purchaseDate);
      endOfDay.setHours(23, 59, 59, 999);

      existingPurchase = await SmsTransaction.findOne({
        userId: validatedVendorId,
        userType: 'vendor',
        packageId: smsPackage._id,
        purchaseDate: {
          $gte: startOfDay,
          $lt: endOfDay
        }
      });
    }

    if (existingPurchase) {
      return NextResponse.json(
        {
          success: false,
          message: 'You have already purchased this package today. Please try again tomorrow.'
        },
        { status: 409 }
      );
    }

    // Create purchase history record


    // Create purchase history with the new schema structure
    const purchaseHistoryData = {
      userId: userType === 'supplier' ? validatedSupplierId : validatedVendorId,
      userType,
      packageId: smsPackage._id,
      packageName: smsPackage.name,
      smsCount: smsPackage.smsCount,
      price: smsPackage.price,
      purchaseDate,
      expiryDate,
      paymentMethod,
      status: 'active'
    };

    const purchaseHistory = new SmsTransaction(purchaseHistoryData);

    await purchaseHistory.save();

    // Update user's SMS balance based on user type
    if (userType === 'supplier') {
      const supplier = await SupplierModel.findById(validatedSupplierId);

      if (!supplier) {
        console.error('Supplier not found with ID:', validatedSupplierId);
        return NextResponse.json(
          {
            success: false,
            message: 'Supplier not found'
          },
          { status: 404 }
        );
      }


      // Add SMS count to supplier's balance
      supplier.smsBalance = (supplier.smsBalance || 0) + smsPackage.smsCount;
      await supplier.save();

    } else {
      const vendor = await VendorModel.findById(validatedVendorId);

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


      // Add SMS count to vendor's balance
      vendor.smsBalance = (vendor.smsBalance || 0) + smsPackage.smsCount;
      await vendor.save();

    }

    const newBalance = userType === 'supplier' ?
      (await SupplierModel.findById(validatedSupplierId)).smsBalance :
      (await VendorModel.findById(validatedVendorId)).smsBalance;

    return NextResponse.json({
      success: true,
      message: 'SMS package purchased successfully',
      data: {
        purchaseHistory,
        newBalance
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
      errorMessage = 'You already have an active SMS package.';
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
}, ['vendor', 'supplier']);

// GET: Retrieve purchase history for the vendor
export const GET = authMiddlewareCrm(async (req, ctx) => {
  try {

    // Connect to database
    const db = await _db();

    // Log request headers for debugging

    // Extract vendorId with improved logic

    // Try multiple ways to get the vendor ID with better error handling
    let vendorId = null;
    let supplierId = null;
    let userType = null;

    if (req.user) {
      // Determine user type
      if (req.user.userType) {
        userType = req.user.userType;
      } else if (req.user.role === 'supplier') {
        userType = 'supplier';
      } else {
        userType = 'vendor';
      }

      // Extract ID based on user type
      if (userType === 'supplier') {
        const possibleFields = ['supplierId', '_id', 'id', 'userId'];
        for (const field of possibleFields) {
          if (req.user[field]) {
            supplierId = req.user[field];
            break;
          }
        }
      } else {
        const possibleFields = ['vendorId', '_id', 'id', 'userId'];
        for (const field of possibleFields) {
          if (req.user[field]) {
            vendorId = req.user[field];
            break;
          }
        }
      }
    }


    // Verify we have the appropriate ID
    if (userType === 'supplier' && !supplierId) {
      console.error('No supplier ID found in user object for supplier user');
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required. Please log in again.'
        },
        { status: 401 }
      );
    }

    if (userType === 'vendor' && !vendorId) {
      console.error('No vendor ID found in user object for vendor user');
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required. Please log in again.'
        },
        { status: 401 }
      );
    }

    const validatedVendorId = userType === 'vendor' ? vendorId : null;
    const validatedSupplierId = userType === 'supplier' ? supplierId : null;

    // Validate ObjectId format
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (userType === 'supplier' && supplierId && !objectIdRegex.test(supplierId)) {
      console.error('Invalid supplier ID format:', supplierId);
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid supplier ID format. Please contact support.'
        },
        { status: 400 }
      );
    }

    if (userType === 'vendor' && vendorId && !objectIdRegex.test(vendorId)) {
      console.error('Invalid vendor ID format:', vendorId);
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid vendor ID format. Please contact support.'
        },
        { status: 400 }
      );
    }

    // Get query parameters for pagination
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;


    // Find purchase history for this user based on user type
    let total, purchases;
    if (userType === 'supplier') {
      total = await SmsTransaction.countDocuments({
        userId: validatedSupplierId,
        userType: 'supplier'
      });
      purchases = await SmsTransaction.find({
        userId: validatedSupplierId,
        userType: 'supplier'
      })
        .sort({ purchaseDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    } else {
      total = await SmsTransaction.countDocuments({
        userId: validatedVendorId,
        userType: 'vendor'
      });
      purchases = await SmsTransaction.find({
        userId: validatedVendorId,
        userType: 'vendor'
      })
        .sort({ purchaseDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    }


    // Get user's current SMS balance based on user type
    let currentBalance = 0;
    if (userType === 'supplier') {
      const supplier = await SupplierModel.findById(validatedSupplierId);
      currentBalance = supplier ? supplier.smsBalance : 0;
    } else {
      const vendor = await VendorModel.findById(validatedVendorId);
      currentBalance = vendor ? vendor.smsBalance : 0;
    }


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
}, ['vendor', 'supplier']);