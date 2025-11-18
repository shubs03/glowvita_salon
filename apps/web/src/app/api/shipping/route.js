import { NextResponse } from 'next/server';
import _db from '@repo/lib/db.js';
import ShippingConfigModel from '@repo/lib/models/Vendor/Shipping.model.js';

// Initialize database connection
await _db();

// GET: Retrieve public shipping configuration
// This endpoint doesn't require authentication and returns default shipping config
export const GET = async (req) => {
  try {
    // Check database connection
    const db = await _db();
    
    // Find the most recently updated config (prioritizing configs with vendorId)
    // Sort by updatedAt descending to get the latest config
    let config = await ShippingConfigModel.findOne({ vendorId: { $exists: true } })
      .sort({ updatedAt: -1 });
    
    // If no vendor-specific config exists, try to find any config
    if (!config) {
      config = await ShippingConfigModel.findOne({}).sort({ updatedAt: -1 });
    }
    
    // If still no config exists, create a default one
    if (!config) {
      config = await ShippingConfigModel.create({ 
        chargeType: 'fixed', 
        amount: 0, 
        isEnabled: false 
      });
    }
    
    // Log the config being returned
    console.log('[PUBLIC SHIPPING API] Returning config:', {
      _id: config._id,
      amount: config.amount,
      chargeType: config.chargeType,
      isEnabled: config.isEnabled,
      vendorId: config.vendorId
    });
    
    return NextResponse.json({
      success: true,
      data: config
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error in GET /api/shipping:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error fetching shipping config', 
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