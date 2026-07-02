import { NextResponse } from "next/server";
import _db from '../../../../../../../packages/lib/src/db.js';
import SmsPackage from '../../../../../../../packages/lib/src/models/Marketing/SmsPackage.model.js';
import SmsTransaction from '../../../../../../../packages/lib/src/models/Marketing/SmsPurchaseHistory.model.js';
import VendorModel from '../../../../../../../packages/lib/src/models/Vendor/Vendor.model.js';
import SupplierModel from '../../../../../../../packages/lib/src/models/Vendor/Supplier.model.js';
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

    const { packageId, paymentId, paymentOrderId } = body;

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







    // Create purchase history record


    // Create purchase history with the new schema structure
    const purchaseHistoryData = {
      userId: userType === 'supplier' ? validatedSupplierId : validatedVendorId,
      userType,
      regionId: req.user.regionId || (req.user.regions && req.user.regions.length > 0 ? req.user.regions[0] : undefined),
      packageId: smsPackage._id,
      packageName: smsPackage.name,
      smsCount: smsPackage.smsCount,
      price: smsPackage.price,
      purchaseDate,
      expiryDate,
      status: 'active',
      paymentMethod: paymentId ? `Online (Razorpay: ${paymentId})` : 'Online'
    };

    // If regionId couldn't be extracted from the token, fetch it from the database first
    // to prevent Mongoose validation errors since it's a required field
    if (!purchaseHistoryData.regionId) {
      if (userType === 'supplier') {
        const supplier = await SupplierModel.findById(validatedSupplierId).select('regionId');
        if (supplier && supplier.regionId) purchaseHistoryData.regionId = supplier.regionId;
      } else {
        const vendor = await VendorModel.findById(validatedVendorId).select('regionId');
        if (vendor && vendor.regionId) purchaseHistoryData.regionId = vendor.regionId;
      }
    }

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

      purchaseHistory.regionId = supplier.regionId;
      await purchaseHistory.save();
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

      purchaseHistory.regionId = vendor.regionId;
      await purchaseHistory.save();
    }

    const newBalance = userType === 'supplier' ?
      (await SupplierModel.findById(validatedSupplierId)).smsBalance :
      (await VendorModel.findById(validatedVendorId)).smsBalance;

    // For consistency, use the active package SMS count as the "current balance" in the response
    let currentBalanceInResponse = 0;
    if (userType === 'supplier') {
      const supplier = await SupplierModel.findById(validatedSupplierId);
      const activePackages = await SmsTransaction.find({
        userId: validatedSupplierId,
        userType: 'supplier',
        status: 'active',
        expiryDate: { $gte: new Date() }
      }).sort({ purchaseDate: -1 });

      if (activePackages.length > 0) {
        currentBalanceInResponse = activePackages[0].smsCount;
      }
    } else {
      const vendor = await VendorModel.findById(validatedVendorId);
      const activePackages = await SmsTransaction.find({
        userId: validatedVendorId,
        userType: 'vendor',
        status: 'active',
        expiryDate: { $gte: new Date() }
      }).sort({ purchaseDate: -1 });

      if (activePackages.length > 0) {
        currentBalanceInResponse = activePackages[0].smsCount;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'SMS package purchased successfully',
      data: {
        purchaseHistory,
        newBalance: currentBalanceInResponse
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

      // For suppliers, get all packages but only show the most recent active one plus expired ones
      const allPurchases = await SmsTransaction.find({
        userId: validatedSupplierId,
        userType: 'supplier'
      })
        .sort({ purchaseDate: -1 });

      // Separate active and expired packages
      const activePackages = allPurchases.filter(p =>
        p.status === 'active' && p.expiryDate >= new Date()
      );

      const expiredPackages = allPurchases.filter(p =>
        p.status === 'expired' || p.status === 'used' || p.expiryDate < new Date()
      );

      // Show all active packages plus expired ones
      let displayPurchases = [...activePackages, ...expiredPackages];

      // Apply pagination to the filtered results
      total = displayPurchases.length;
      purchases = displayPurchases.slice((page - 1) * limit, page * limit);

    } else {

      // For vendors, apply the same logic as suppliers - only show one active package plus expired ones
      const allVendorPurchases = await SmsTransaction.find({
        userId: validatedVendorId,
        userType: 'vendor'
      })
        .sort({ purchaseDate: -1 });

      // Separate active and expired packages for vendors
      const activeVendorPackages = allVendorPurchases.filter(p =>
        p.status === 'active' && p.expiryDate >= new Date()
      );

      const expiredVendorPackages = allVendorPurchases.filter(p =>
        p.status === 'expired' || p.status === 'used' || p.expiryDate < new Date()
      );

      // Show all active packages plus expired ones
      let displayVendorPurchases = [...activeVendorPackages, ...expiredVendorPackages];

      // Apply pagination to the filtered results
      total = displayVendorPurchases.length;
      purchases = displayVendorPurchases.slice((page - 1) * limit, page * limit);

    }


    // Get user's current SMS balance based on user type
    let currentBalance = 0;
    let activePackageInfo = null;
    if (userType === 'supplier') {
      const supplier = await SupplierModel.findById(validatedSupplierId);

      // Get the active package information
      const activePackages = await SmsTransaction.find({
        userId: validatedSupplierId,
        userType: 'supplier',
        status: 'active',
        expiryDate: { $gte: new Date() }
      }).sort({ purchaseDate: -1 });

      if (activePackages.length > 0) {
        // Use the most recent active package
        const activePackage = activePackages[0];
        activePackageInfo = {
          packageName: activePackage.packageName,
          packageSmsCount: activePackage.smsCount, // Original SMS count in the package
          remainingSmsCount: supplier ? supplier.smsBalance : 0, // Current remaining balance
          expiryDate: activePackage.expiryDate,
          purchaseDate: activePackage.purchaseDate
        };

        // Use the active package SMS count as the "current balance" for suppliers
        currentBalance = activePackage.smsCount;
      }
    } else {
      const vendor = await VendorModel.findById(validatedVendorId);

      // Get the active SMS package information for vendors (same logic as suppliers)
      const activeVendorPackages = await SmsTransaction.find({
        userId: validatedVendorId,
        userType: 'vendor',
        status: 'active',
        expiryDate: { $gte: new Date() }
      }).sort({ purchaseDate: -1 });

      if (activeVendorPackages.length > 0) {
        // Use the most recent active package
        const activePackage = activeVendorPackages[0];
        activePackageInfo = {
          packageName: activePackage.packageName,
          packageSmsCount: activePackage.smsCount, // Original SMS count in the package
          remainingSmsCount: vendor ? vendor.smsBalance : 0, // Current remaining balance
          expiryDate: activePackage.expiryDate,
          purchaseDate: activePackage.purchaseDate
        };

        // Use the active package SMS count as the "current balance" for vendors (same as suppliers)
        currentBalance = activePackage.smsCount;
      } else {
        currentBalance = 0;
      }
    }


    return NextResponse.json({
      success: true,
      data: {
        purchases,
        currentBalance,
        activePackageInfo,
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
