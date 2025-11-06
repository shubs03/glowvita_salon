import { NextResponse } from "next/server";
import _db from '../../../../../../../packages/lib/src/db.js';
import SmsPackage from '../../../../../../../packages/lib/src/models/Marketing/SmsPackage.model.js';
import { authMiddlewareCrm } from '../../../../middlewareCrm.js';

// GET all SMS packages for CRM
export const GET = authMiddlewareCrm(async (req, ctx) => {
  try {
    console.log('Received GET /api/crm/sms-packages request');
    console.log('Auth context:', ctx);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    
    // Connect to database inside the handler (following memory specification)
    const db = await _db();
    console.log('Database connection status:', db ? 'Connected' : 'Not connected');
    
    console.log('Fetching SMS packages...');
    const packages = await SmsPackage.find({})
      .sort({ isPopular: -1, name: 1 })
      .select('-__v');
    
    console.log(`Found ${packages.length} packages in database`);
    console.log('Packages data:', JSON.stringify(packages, null, 2));
    
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