import { NextResponse } from 'next/server';
import _db from '../../../../../../../packages/lib/src/db.js';
import ShippingConfigModel from '@repo/lib/models/Vendor/Shipping.model';
import { authMiddlewareCrm } from '../../../../middlewareCrm';
await _db();

// Helper to validate shipping config data
const validateShippingData = (data) => {
  const { chargeType, amount, isEnabled } = data;
  if (!['fixed', 'percentage'].includes(chargeType)) {
    return 'Invalid charge type';
  }
  if (typeof amount !== 'number' || amount < 0) {
    return 'Invalid amount';
  }
  if (typeof isEnabled !== 'boolean') {
    return 'Invalid isEnabled value';
  }
  return null;
};

// GET: Retrieve shipping configuration
export const GET = authMiddlewareCrm(async (req, ctx) => {
  try {
    // Get vendorId from authenticated user
    const vendorId = req.user._id || req.user.userId;
    if (!vendorId) {
      return NextResponse.json(
        { success: false, message: 'Vendor ID not found in authentication' },
        { status: 401 }
      );
    }
    
    // Check database connection
    const db = await _db();
    
    // Try to find existing config for this vendor
    let config = await ShippingConfigModel.findOne({ vendorId });
    
    // If no config exists, create a default one for this vendor
    if (!config) {
      config = await ShippingConfigModel.create({ 
        vendorId,
        chargeType: 'fixed', 
        amount: 0, 
        isEnabled: false 
      });
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
    console.error('Error in GET /api/crm/shipping:', error);
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
}, ['vendor']);

// PUT: Update shipping configuration
export const PUT = authMiddlewareCrm(async (req, ctx) => {
  try {
    const body = await req.json();
    
    // Get vendorId from authenticated user
    const vendorId = req.user._id || req.user.userId;
    if (!vendorId) {
      return NextResponse.json(
        { success: false, message: 'Vendor ID not found in authentication' },
        { status: 401 }
      );
    }
    
    const validationError = validateShippingData(body);
    if (validationError) {
      return NextResponse.json({ 
        success: false,
        message: validationError 
      }, { status: 400 });
    }

    let config = await ShippingConfigModel.findOne({ vendorId });
    
    if (!config) {
      config = await ShippingConfigModel.create({
        vendorId,
        ...body
      });
    } else {
      config.chargeType = body.chargeType;
      config.amount = body.amount;
      config.isEnabled = body.isEnabled;
      await config.save();
    }

    return NextResponse.json({
      success: true,
      data: config,
      message: 'Shipping configuration updated successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating shipping config:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error updating shipping config', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    );
  }
}, ['vendor']);
