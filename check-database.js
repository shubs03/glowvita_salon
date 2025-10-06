// Script to check what products and vendors exist in the database for admin approval
import mongoose from 'mongoose';
import ProductModel from './packages/lib/src/models/Vendor/Product.model.js';
import VendorModel from './packages/lib/src/models/Vendor/Vendor.model.js';
import _db from './packages/lib/src/db.js';

const checkDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await _db();
    
    // Check vendors first
    console.log('\n=== VENDORS ===');
    const allVendors = await VendorModel.find({}).select('businessName status');
    console.log('Total vendors:', allVendors.length);
    
    const approvedVendors = allVendors.filter(v => v.status === 'Approved');
    console.log('Approved vendors:', approvedVendors.length);
    if (approvedVendors.length > 0) {
      console.log('Approved vendor names:', approvedVendors.map(v => v.businessName));
    }
    
    // Check products with detailed status breakdown
    console.log('\n=== PRODUCTS ===');
    const allProducts = await ProductModel.find({})
      .populate('vendorId', 'businessName status')
      .select('productName status isActive stock vendorId');
    
    console.log('Total products:', allProducts.length);
    
    // Group by status
    const productsByStatus = {};
    allProducts.forEach(p => {
      if (!productsByStatus[p.status]) {
        productsByStatus[p.status] = [];
      }
      productsByStatus[p.status].push(p);
    });
    
    console.log('\nProducts by approval status:');
    Object.keys(productsByStatus).forEach(status => {
      console.log(`  ${status}: ${productsByStatus[status].length} products`);
      if (productsByStatus[status].length > 0) {
        console.log(`    Sample: ${productsByStatus[status].slice(0, 3).map(p => p.productName).join(', ')}`);
      }
    });
    
    // Check specifically for approved products
    const approvedProducts = allProducts.filter(p => p.status === 'approved');
    console.log(`\nApproved products: ${approvedProducts.length}`);
    
    if (approvedProducts.length > 0) {
      console.log('Approved product details:');
      approvedProducts.forEach(p => {
        const vendorStatus = p.vendorId?.status || 'Unknown';
        const vendorName = p.vendorId?.businessName || 'Unknown Vendor';
        console.log(`  - ${p.productName}`);
        console.log(`    Vendor: ${vendorName} (${vendorStatus})`);
        console.log(`    Active: ${p.isActive}, Stock: ${p.stock}`);
      });
      
      // Check how many would be shown on frontend
      const publicProducts = approvedProducts.filter(p => 
        p.isActive === true && 
        p.stock > 0 && 
        p.vendorId?.status === 'Approved'
      );
      
      console.log(`\n✅ Products that SHOULD appear on frontend: ${publicProducts.length}`);
      if (publicProducts.length > 0) {
        console.log('These products should be visible:');
        publicProducts.forEach(p => {
          console.log(`  - ${p.productName} by ${p.vendorId.businessName}`);
        });
      }
    } else {
      console.log('\n❌ No approved products found!');
      console.log('💡 To fix this:');
      console.log('   1. Go to Admin Panel → Product Approvals');
      console.log('   2. Approve some products by changing status to "approved"');
      console.log('   3. Make sure the products have isActive: true and stock > 0');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
};

checkDatabase();