import _db from "@repo/lib/db";
import ProductModel from "@repo/lib/models/vendor/Product.model";
import VendorModel from "@repo/lib/models/Vendor/Vendor.model";

await _db();

// Get Public Products (only products approved via admin panel)
export const GET = async () => {
  try {
    console.log('Products API: Starting to fetch approved products...');
    
    // Get products that are approved via admin panel
    const approvedProducts = await ProductModel.find({ 
      status: 'approved', // This is set by admin panel product approval
      isActive: true,
      stock: { $gt: 0 }
    })
    .populate({
      path: 'vendorId',
      select: 'businessName firstName lastName status',
      match: { status: 'Approved' } // Only include products from approved vendors
    })
    .select('productName description price salePrice productImage vendorId stock createdAt')
    .sort({ createdAt: -1 })
    .limit(50);

    console.log('Products API: Total approved products found:', approvedProducts.length);

    // Filter out products where vendor population failed (vendor not approved)
    const validProducts = approvedProducts.filter(product => product.vendorId !== null);
    console.log('Products API: Products with approved vendors:', validProducts.length);

    if (validProducts.length === 0) {
      console.log('Products API: No approved products from approved vendors found');
      return Response.json({
        success: true,
        products: [],
        count: 0,
        message: "No approved products from approved vendors found"
      });
    }

    // Transform the data for the frontend
    const transformedProducts = validProducts.map(product => ({
      id: product._id,
      name: product.productName,
      description: product.description || '',
      price: product.price,
      salePrice: product.salePrice > 0 ? product.salePrice : null,
      image: product.productImage || 'https://placehold.co/320x224/e2e8f0/64748b?text=Product',
      vendorName: product.vendorId?.businessName || 'Unknown Vendor',
      category: 'Beauty Products',
      stock: product.stock,
      isNew: new Date(product.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      rating: (4.2 + Math.random() * 0.8).toFixed(1),
      reviewCount: Math.floor(50 + Math.random() * 500),
      hint: product.description || product.productName
    }));

    console.log('Products API: Successfully transformed products:', transformedProducts.length);
    console.log('Products API: Sample product names:', transformedProducts.slice(0, 3).map(p => p.name));

    return Response.json({
      success: true,
      products: transformedProducts,
      count: transformedProducts.length
    });
  } catch (error) {
    console.error('Products API Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return Response.json(
      { 
        success: false, 
        message: `Failed to fetch products: ${error.message}`,
        products: [],
        error: error.message
      },
      { status: 500 }
    );
  }
};