import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
import RegionModel from '@repo/lib/models/admin/Region.model';
import { assignRegion } from '@repo/lib/utils/assignRegion.js';

/**
 * Admin endpoint to fix vendors and suppliers with missing regionId
 * This will attempt to assign regions based on their location coordinates
 */
export async function POST(req) {
  await _db();

  try {
    // Find all vendors without regionId
    const vendorsWithoutRegion = await VendorModel.find({ 
      $or: [
        { regionId: null },
        { regionId: { $exists: false } }
      ]
    }).select('_id businessName city state location regionId');

    // Find all suppliers without regionId
    const suppliersWithoutRegion = await SupplierModel.find({ 
      $or: [
        { regionId: null },
        { regionId: { $exists: false } }
      ]
    }).select('_id shopName city state location regionId');

    console.log(`Found ${vendorsWithoutRegion.length} vendors without regionId`);
    console.log(`Found ${suppliersWithoutRegion.length} suppliers without regionId`);

    const results = {
      vendors: {
        total: vendorsWithoutRegion.length,
        fixed: 0,
        failed: []
      },
      suppliers: {
        total: suppliersWithoutRegion.length,
        fixed: 0,
        failed: []
      },
      noRegionsAvailable: false
    };

    // First, check if any regions exist
    const regionsCount = await RegionModel.countDocuments({ isActive: true });
    if (regionsCount === 0) {
      results.noRegionsAvailable = true;
      return NextResponse.json({
        success: false,
        message: 'No active regions found in the database. Please create regions first.',
        data: results
      }, { status: 400 });
    }

    // Process vendors
    for (const vendor of vendorsWithoutRegion) {
      try {
        if (vendor.location && vendor.location.lat && vendor.location.lng) {
          const assignedRegionId = await assignRegion(
            vendor.city,
            vendor.state,
            vendor.location
          );

          if (assignedRegionId) {
            vendor.regionId = assignedRegionId;
            await vendor.save();
            results.vendors.fixed++;
            console.log(`✓ Fixed regionId for vendor: ${vendor.businessName} (${vendor._id})`);
          } else {
            results.vendors.failed.push({
              id: vendor._id,
              name: vendor.businessName,
              reason: 'Location does not fall within any active region',
              location: vendor.location,
              city: vendor.city,
              state: vendor.state
            });
            console.log(`✗ No region found for vendor: ${vendor.businessName} at ${vendor.city}, ${vendor.state}`);
          }
        } else {
          results.vendors.failed.push({
            id: vendor._id,
            name: vendor.businessName,
            reason: 'Missing location coordinates',
            location: vendor.location
          });
          console.log(`✗ Vendor ${vendor.businessName} is missing location coordinates`);
        }
      } catch (error) {
        results.vendors.failed.push({
          id: vendor._id,
          name: vendor.businessName,
          reason: error.message,
          error: error.toString()
        });
        console.error(`Error processing vendor ${vendor._id}:`, error);
      }
    }

    // Process suppliers
    for (const supplier of suppliersWithoutRegion) {
      try {
        if (supplier.location && supplier.location.lat && supplier.location.lng) {
          const assignedRegionId = await assignRegion(
            supplier.city,
            supplier.state,
            supplier.location
          );

          if (assignedRegionId) {
            supplier.regionId = assignedRegionId;
            await supplier.save();
            results.suppliers.fixed++;
            console.log(`✓ Fixed regionId for supplier: ${supplier.shopName} (${supplier._id})`);
          } else {
            results.suppliers.failed.push({
              id: supplier._id,
              name: supplier.shopName,
              reason: 'Location does not fall within any active region',
              location: supplier.location,
              city: supplier.city,
              state: supplier.state
            });
            console.log(`✗ No region found for supplier: ${supplier.shopName} at ${supplier.city}, ${supplier.state}`);
          }
        } else {
          results.suppliers.failed.push({
            id: supplier._id,
            name: supplier.shopName,
            reason: 'Missing location coordinates',
            location: supplier.location
          });
          console.log(`✗ Supplier ${supplier.shopName} is missing location coordinates`);
        }
      } catch (error) {
        results.suppliers.failed.push({
          id: supplier._id,
          name: supplier.shopName,
          reason: error.message,
          error: error.toString()
        });
        console.error(`Error processing supplier ${supplier._id}:`, error);
      }
    }

    const totalFixed = results.vendors.fixed + results.suppliers.fixed;
    const totalCount = results.vendors.total + results.suppliers.total;

    return NextResponse.json({
      success: true,
      message: `Fixed ${totalFixed} out of ${totalCount} vendors/suppliers`,
      data: results
    }, { status: 200 });

  } catch (error) {
    console.error('Error fixing vendor/supplier regions:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    }, { status: 500 });
  }
}

/**
 * GET endpoint to check vendors and suppliers without regionId (read-only)
 */
export async function GET(req) {
  await _db();

  try {
    const vendorsWithoutRegion = await VendorModel.find({ 
      $or: [
        { regionId: null },
        { regionId: { $exists: false } }
      ]
    }).select('_id businessName city state location regionId email phone');

    const suppliersWithoutRegion = await SupplierModel.find({ 
      $or: [
        { regionId: null },
        { regionId: { $exists: false } }
      ]
    }).select('_id shopName city state location regionId email mobile');

    const regionsCount = await RegionModel.countDocuments({ isActive: true });
    const activeRegions = await RegionModel.find({ isActive: true }).select('name city state');

    return NextResponse.json({
      success: true,
      data: {
        vendors: {
          count: vendorsWithoutRegion.length,
          list: vendorsWithoutRegion
        },
        suppliers: {
          count: suppliersWithoutRegion.length,
          list: suppliersWithoutRegion
        },
        activeRegionsCount: regionsCount,
        activeRegions: activeRegions
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error checking vendor/supplier regions:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    }, { status: 500 });
  }
}
