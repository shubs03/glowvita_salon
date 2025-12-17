import { NextResponse } from 'next/server';
import _db from '@repo/lib/db.js';
import ShippingConfigModel from '@repo/lib/models/Vendor/Shipping.model.js';

// Initialize database connection
await _db();

// GET: Retrieve vendor shipping configuration by vendor ID
// This endpoint doesn't require authentication and returns vendor-specific shipping config
export const GET = async (req, { params }) => {
  try {
    const { id: vendorId } = params;
    
    // Validate vendor ID
    if (!vendorId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Vendor ID is required" 
        },
        { status: 400 }
      );
    }
    
    // Find the shipping configuration for this specific vendor
    let config = await ShippingConfigModel.findOne({ vendorId });
    
    // If no config exists for this vendor, return default values
    if (!config) {
      config = {
        chargeType: 'fixed',
        amount: 0,
        isEnabled: false
      };
    }
    
    return NextResponse.json({
      success: true,
      data: config
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error in GET /api/vendor/[id]/shipping:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error fetching vendor shipping config', 
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
};