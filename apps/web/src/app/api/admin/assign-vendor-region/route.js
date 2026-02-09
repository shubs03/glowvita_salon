import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
import RegionModel from '@repo/lib/models/admin/Region.model';

/**
 * PATCH endpoint to manually assign a vendor or supplier to a specific region
 * This is useful when automatic assignment fails
 * 
 * Body: { vendorId: string, regionId: string, type: 'Vendor' | 'Supplier' }
 */
export async function PATCH(req) {
  await _db();

  try {
    const body = await req.json();
    const { vendorId, regionId, type = 'Vendor' } = body;

    // Validate inputs
    if (!vendorId || !regionId) {
      return NextResponse.json({
        success: false,
        message: 'Both vendorId and regionId are required'
      }, { status: 400 });
    }

    if (!['Vendor', 'Supplier'].includes(type)) {
      return NextResponse.json({
        success: false,
        message: 'Type must be either "Vendor" or "Supplier"'
      }, { status: 400 });
    }

    // Check if entity exists
    const Model = type === 'Supplier' ? SupplierModel : VendorModel;
    const entity = await Model.findById(vendorId);
    
    if (!entity) {
      return NextResponse.json({
        success: false,
        message: `${type} not found`
      }, { status: 404 });
    }

    // Check if region exists and is active
    const region = await RegionModel.findById(regionId);
    if (!region) {
      return NextResponse.json({
        success: false,
        message: 'Region not found'
      }, { status: 404 });
    }

    if (!region.isActive) {
      return NextResponse.json({
        success: false,
        message: 'Cannot assign to inactive region'
      }, { status: 400 });
    }

    // Assign region
    entity.regionId = regionId;
    await entity.save();

    const entityName = type === 'Supplier' ? entity.shopName : entity.businessName;

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${entityName} to ${region.name}`,
      data: {
        entity: {
          id: entity._id,
          name: entityName,
          type: type,
          city: entity.city,
          state: entity.state
        },
        region: {
          id: region._id,
          name: region.name,
          city: region.city,
          state: region.state
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error assigning region:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    }, { status: 500 });
  }
}
