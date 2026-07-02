import { NextResponse } from "next/server";
import _db from '../../../../../../../packages/lib/src/db.js';
import SmsPackage from '../../../../../../../packages/lib/src/models/Marketing/SmsPackage.model.js';
import { authMiddlewareCrm } from '../../../../middlewareCrm.js';

// GET all SMS packages for CRM
export const GET = authMiddlewareCrm(async (req, ctx) => {
  try {


    // Connect to database inside the handler (following memory specification)
    const db = await _db();

    const packages = await SmsPackage.find({})
      .sort({ isPopular: -1, name: 1 })
      .select('-__v');

    // Transform packages to ensure they have the required fields
    const formattedPackages = packages.map(pkg => ({
      _id: pkg._id,
      name: pkg.name,
      smsCount: pkg.smsCount,
      price: pkg.price,
      description: pkg.description,
      validityDays: pkg.validityDays,
      isPopular: pkg.isPopular || false,
      features: pkg.features || [],
      status: pkg.status,
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: formattedPackages
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error in GET /api/crm/sms-packages:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching SMS packages',
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