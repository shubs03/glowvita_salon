import { NextResponse } from 'next/server';
import _db from '../../../../../../../packages/lib/src/db.js';
import ShippingConfigModel from '../../../../../../../packages/lib/src/models/Vendor/Shipping.model.js';
import { authMiddlewareVendor } from '../../../../middlewareCrm.js';
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
export const GET = authMiddlewareVendor(async (req, ctx) => {
  try {
    console.log('Received GET /api/crm/shipping request');
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    
    // Check database connection
    const db = await _db();
    console.log('Database connection status:', db ? 'Connected' : 'Not connected');
    
    // Try to find existing config
    let config = await ShippingConfigModel.findOne();
    console.log('Found config:', config);
    
    // If no config exists, create a default one
    if (!config) {
      console.log('No config found, creating default...');
      config = await ShippingConfigModel.create({ 
        chargeType: 'fixed', 
        amount: 0, 
        isEnabled: false 
      });
      console.log('Created default config:', config);
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
}, ['superadmin', 'admin']);

// PUT: Update shipping configuration
export const PUT = authMiddlewareVendor(async (req, ctx) => {
  try {
    console.log('Received PUT /api/crm/shipping request');
    const body = await req.json();
    console.log('Request body:', body);
    
    const validationError = validateShippingData(body);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    let config = await ShippingConfigModel.findOne();
    
    if (!config) {
      config = await ShippingConfigModel.create(body);
    } else {
      config.chargeType = body.chargeType;
      config.amount = body.amount;
      config.isEnabled = body.isEnabled;
      await config.save();
    }
    
    console.log('Updated config:', config);
    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.error('Error updating shipping config:', error);
    return NextResponse.json(
      { message: 'Error updating shipping config', error: error.message },
      { status: 500 }
    );
  }
}, ['superadmin']);
