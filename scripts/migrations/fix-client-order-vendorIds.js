/**
 * Migration Script: Fix Client Orders with Incorrect VendorId
 * 
 * This script will:
 * 1. Find all client orders
 * 2. Check the product owner for each order's items
 * 3. Update vendorId to match the actual product owner (supplier or vendor)
 * 
 * Usage:
 *   node scripts/migrations/fix-client-order-vendorIds.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from root
dotenv.config({ path: join(__dirname, '../../.env') });

// Import models
async function loadModels() {
  const path = '../../packages/lib/src';
  const ClientOrderModel = (await import(`${path}/models/user/ClientOrder.model.js`)).default;
  const ProductModel = (await import(`${path}/models/Vendor/Product.model.js`)).default;
  
  return { ClientOrderModel, ProductModel };
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

async function fixClientOrderVendorIds() {
  console.log('\n========================================');
  console.log('Fix Client Order VendorId Migration');
  console.log('========================================\n');

  try {
    // Connect to database
    await connectDB();

    // Load models
    const { ClientOrderModel, ProductModel } = await loadModels();

    // Find all client orders
    const allOrders = await ClientOrderModel.find({}).lean();
    
    console.log(`Found ${allOrders.length} client orders to check\n`);

    if (allOrders.length === 0) {
      console.log('✓ No orders found. Nothing to fix!');
      await mongoose.disconnect();
      process.exit(0);
    }

    const results = {
      total: allOrders.length,
      fixed: 0,
      noChange: 0,
      failed: []
    };

    // Process each order
    for (const order of allOrders) {
      try {
        process.stdout.write(`Processing order ${order._id}... `);

        // Get the first product to determine the actual owner
        if (!order.items || order.items.length === 0) {
          console.log('✗ SKIPPED - No items');
          results.noChange++;
          continue;
        }

        const firstProductId = order.items[0].productId;
        const product = await ProductModel.findById(firstProductId).select('vendorId origin').lean();

        if (!product) {
          console.log('✗ FAILED - Product not found');
          results.failed.push({
            orderId: order._id,
            reason: 'Product not found',
            productId: firstProductId
          });
          continue;
        }

        const actualOwnerId = product.vendorId;
        const currentVendorId = order.vendorId;

        // Check if vendorId needs updating
        if (actualOwnerId.toString() === currentVendorId.toString()) {
          console.log('✓ OK - VendorId already correct');
          results.noChange++;
        } else {
          // Update the vendorId
          await ClientOrderModel.findByIdAndUpdate(
            order._id,
            { vendorId: actualOwnerId },
            { new: true }
          );

          console.log(`✓ FIXED - Updated from ${currentVendorId} to ${actualOwnerId} (${product.origin})`);
          results.fixed++;
        }

      } catch (error) {
        console.log(`✗ ERROR - ${error.message}`);
        results.failed.push({
          orderId: order._id,
          reason: error.message,
          error: error.toString()
        });
      }
    }

    // Print summary
    console.log('\n========================================');
    console.log('Migration Summary');
    console.log('========================================');
    console.log(`Total orders processed: ${results.total}`);
    console.log(`✓ Fixed (updated): ${results.fixed}`);
    console.log(`✓ No change needed: ${results.noChange}`);
    console.log(`✗ Failed: ${results.failed.length}`);

    if (results.failed.length > 0) {
      console.log('\n\nOrders that could not be fixed:');
      console.log('========================================');
      results.failed.forEach(f => {
        console.log(`\nOrder ID: ${f.orderId}`);
        console.log(`  Product ID: ${f.productId || 'N/A'}`);
        console.log(`  Reason: ${f.reason}`);
      });
    }

    console.log('\n========================================\n');

    // Disconnect
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');

    process.exit(results.failed.length > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the migration
fixClientOrderVendorIds();
