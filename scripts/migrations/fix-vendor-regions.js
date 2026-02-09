/**
 * Migration Script: Fix Vendors and Suppliers with Missing RegionId
 * 
 * This script will:
 * 1. Find all vendors and suppliers without a regionId
 * 2. Attempt to assign regions based on their location coordinates
 * 3. Report vendors/suppliers that couldn't be fixed
 * 
 * Usage:
 *   node scripts/migrations/fix-vendor-regions.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from root
dotenv.config({ path: join(__dirname, '../../.env') });

// Import models and utilities
async function loadModels() {
  const path = '../../packages/lib/src';
  const VendorModel = (await import(`${path}/models/Vendor/Vendor.model.js`)).default;
  const SupplierModel = (await import(`${path}/models/Vendor/Supplier.model.js`)).default;
  const RegionModel = (await import(`${path}/models/admin/Region.model.js`)).default;
  const { assignRegion } = await import(`${path}/utils/assignRegion.js`);
  
  return { VendorModel, SupplierModel, RegionModel, assignRegion };
}

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    throw error;
  }
}

async function fixVendorRegions() {
  console.log('\n=========& Supplier RegionId Migration');
  console.log('========================================\n');

  try {
    // Connect to database
    await connectDB();

    // Load models
    const { VendorModel, SupplierModel, RegionModel, assignRegion } = await loadModels();

    // Check if regions exist
    const regionsCount = await RegionModel.countDocuments({ isActive: true });
    console.log(`Found ${regionsCount} active regions in database`);

    if (regionsCount === 0) {
      console.error('\n✗ ERROR: No active regions found!');
      console.error('Please create regions first before running this migration.');
      process.exit(1);
    }

    // List regions
    const regions = await RegionModel.find({ isActive: true }).select('name city state');
    console.log('\nActive Regions:');
    regions.forEach(region => {
      console.log(`  - ${region.name} (${region.city}, ${region.state})`);
    });

    // Find vendors without regionId
    const vendorsWithoutRegion = await VendorModel.find({
      $or: [
        { regionId: null },
        { regionId: { $exists: false } }
      ]
    }).select('_id businessName city state location regionId email phone');

    // Find suppliers without regionId
    const suppliersWithoutRegion = await SupplierModel.find({
      $or: [
        { regionId: null },
        { regionId: { $exists: false } }
      ]
    }).select('_id shopName city state location regionId email mobile');

    console.log(`\n\nFound ${vendorsWithoutRegion.length} vendors without regionId`);
    console.log(`Found ${suppliersWithoutRegion.length} suppliers without regionId\n`);

    const totalToFix = vendorsWithoutRegion.length + suppliersWithoutRegion.length;

    if (totalToFix === 0) {
      console.log('✓ All vendors and suppliers have regionId assigned. Nothing to fix!');
      await mongoose.disconnect();
      process.exit(0);
    }

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
      }
    };

    // Process vendors
    if (vendorsWithoutRegion.length > 0) {
      console.log('\n--- Processing Vendors ---\n');
      for (const vendor of vendorsWithoutRegion) {
        process.stdout.write(`Processing: ${vendor.businessName} (${vendor._id})... `);

        try {
          if (!vendor.location || !vendor.location.lat || !vendor.location.lng) {
            console.log('✗ FAILED - Missing coordinates');
            results.vendors.failed.push({
              id: vendor._id,
              name: vendor.businessName,
              reason: 'Missing location coordinates',
              city: vendor.city,
              state: vendor.state,
              email: vendor.email
            });
            continue;
          }

          const assignedRegionId = await assignRegion(
            vendor.city,
            vendor.state,
            vendor.location
          );

          if (assignedRegionId) {
            vendor.regionId = assignedRegionId;
            await vendor.save();
            results.vendors.fixed++;
            
            // Get region name
            const region = await RegionModel.findById(assignedRegionId).select('name');
            console.log(`✓ FIXED - Assigned to ${region.name}`);
          } else {
            console.log('✗ FAILED - No matching region');
            results.vendors.failed.push({
              id: vendor._id,
              name: vendor.businessName,
              reason: 'Location does not fall within any active region',
              location: vendor.location,
              city: vendor.city,
              state: vendor.state,
              email: vendor.email
            });
          }
        } catch (error) {
          console.log(`✗ ERROR - ${error.message}`);
          results.vendors.failed.push({
            id: vendor._id,
            name: vendor.businessName,
            reason: error.message,
            error: error.toString()
          });
        }
      }
    }

    // Process suppliers
    if (suppliersWithoutRegion.length > 0) {
      console.log('\n--- Processing Suppliers ---\n');
      for (const supplier of suppliersWithoutRegion) {
        process.stdout.write(`Processing: ${supplier.shopName} (${supplier._id})... `);

        try {
          if (!supplier.location || !supplier.location.lat || !supplier.location.lng) {
            console.log('✗ FAILED - Missing coordinates');
            results.suppliers.failed.push({
              id: supplier._id,
              name: supplier.shopName,
              reason: 'Missing location coordinates',
              city: supplier.city,
              state: supplier.state,
              email: supplier.email
            });
            continue;
          }

          const assignedRegionId = await assignRegion(
            supplier.city,
            supplier.state,
            supplier.location
          );

          if (assignedRegionId) {
            supplier.regionId = assignedRegionId;
            await supplier.save();
            results.suppliers.fixed++;
            
            // Get region name
            const region = await RegionModel.findById(assignedRegionId).select('name');
            console.log(`✓ FIXED - Assigned to ${region.name}`);
          } else {
            console.log('✗ FAILED - No matching region');
            results.suppliers.failed.push({
              id: supplier._id,
              name: supplier.shopName,
              reason: 'Location does not fall within any active region',
              location: supplier.location,
              city: supplier.city,
              state: supplier.state,
              email: supplier.email
            });
          }
        } catch (error) {
          console.log(`✗ ERROR - ${error.message}`);
          results.suppliers.failed.push({
            id: supplier._id,
            name: supplier.shopName,
            reason: error.message,
            error: error.toString()
          });
        }
      }
    }

    // Print summary
    console.log('\n========================================');
    console.log('Migration Summary');
    console.log('========================================');
    console.log(`\nVENDORS:`);
    console.log(`  Total processed: ${results.vendors.total}`);
    console.log(`  ✓ Successfully fixed: ${results.vendors.fixed}`);
    console.log(`  ✗ Failed: ${results.vendors.failed.length}`);
    
    console.log(`\nSUPPLIERS:`);
    console.log(`  Total processed: ${results.suppliers.total}`);
    console.log(`  ✓ Successfully fixed: ${results.suppliers.fixed}`);
    console.log(`  ✗ Failed: ${results.suppliers.failed.length}`);

    const totalFailed = results.vendors.failed.length + results.suppliers.failed.length;

    if (totalFailed > 0) {
      console.log('\n\nEntities that could not be fixed:');
      console.log('========================================');
      
      if (results.vendors.failed.length > 0) {
        console.log('\n--- VENDORS ---');
        results.vendors.failed.forEach(v => {
          console.log(`\nVendor: ${v.name} (${v.id})`);
          console.log(`  City: ${v.city}, State: ${v.state}`);
          console.log(`  Email: ${v.email}`);
          console.log(`  Reason: ${v.reason}`);
          if (v.location) {
            console.log(`  Coordinates: ${v.location.lat}, ${v.location.lng}`);
          }
        });
      }

      if (results.suppliers.failed.length > 0) {
        console.log('\n--- SUPPLIERS ---');
        results.suppliers.failed.forEach(v => {
          console.log(`\nSupplier: ${v.name} (${v.id})`);
          console.log(`  City: ${v.city}, State: ${v.state}`);
          console.log(`  Email: ${v.email}`);
          console.log(`  Reason: ${v.reason}`);
          if (v.location) {
            console.log(`  Coordinates: ${v.location.lat}, ${v.location.lng}`);
          }
        });
      }

      console.log('\n\nAction Required:');
      console.log('========================================');
      console.log('For vendors/suppliers that could not be auto-assigned:');
      console.log('1. Check if their location falls outside all defined regions');
      console.log('2. Either create a new region for their location');
      console.log('3. Or manually assign them to the nearest region');
      console.log('4. Update their location coordinates if they are incorrect');
    }

    console.log('\n========================================\n');

    // Disconnect
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');

    process.exit(totalFailed)
    process.exit(results.failed.length > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the migration
fixVendorRegions();
