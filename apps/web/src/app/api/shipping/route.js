import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
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

    // Get vendorId from query params
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId')?.trim();

    let config;

    // If vendorId is provided, prioritize finding config for that specific vendor
    if (vendorId && vendorId.match(/^[0-9a-fA-F]{24}$/)) {
      try {
        const queryVendorId = new mongoose.Types.ObjectId(vendorId);
        // Try to find by ObjectId OR String to be safe
        config = await ShippingConfigModel.findOne({ 
          $or: [
            { vendorId: queryVendorId },
            { vendorId: vendorId }
          ]
        }).lean();
        
        if (config) {
          console.log(`[PUBLIC SHIPPING API] Found config for vendor ${vendorId}`);
        } else {
          console.warn(`[PUBLIC SHIPPING API] No config found for vendor ${vendorId}, falling back`);
        }
      } catch (err) {
        console.error(`[PUBLIC SHIPPING API] Error casting vendorId ${vendorId}:`, err);
        // Fallback to searching as string if casting fails
        config = await ShippingConfigModel.findOne({ vendorId }).lean();
      }
    }

    // If no specific vendor config found, look for latest vendor-specific config
    if (!config) {
      config = await ShippingConfigModel.findOne({ vendorId: { $exists: true } })
        .sort({ updatedAt: -1 })
        .lean();
    }

    // If still no config found, fallback to any existing config
    if (!config) {
      config = await ShippingConfigModel.findOne({}).sort({ updatedAt: -1 }).lean();
    }

    // If absolutely no config exists in DB, create a default one
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
      vendorId: config.vendorId,
      requestedVendorId: vendorId
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