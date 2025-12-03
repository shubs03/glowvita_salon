import _db from "@repo/lib/db";
import ProductModel from "@repo/lib/models/Vendor/Product.model";
import VendorModel from "@repo/lib/models/Vendor.model";
import SupplierModel from "@repo/lib/models/Vendor/Supplier.model";

await _db();

// Handle CORS preflight
export const OPTIONS = async (request) => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    },
  });
};

// Get Public Products (only products approved via admin panel)
export const GET = async (request) => {
  try {
    // Extract vendorId from query parameters if provided
    const url = new URL(request.url);
    const vendorId = url.searchParams.get('vendorId');
    
    // Build query with optional vendor filter
    const query = { 
      status: 'approved', // This is set by admin panel product approval
      isActive: true,
      stock: { $gt: 0 }
    };
    
    // Add vendor filter if vendorId is provided
    if (vendorId) {
      query.vendorId = vendorId;
    }
    
    // Get products that are approved via admin panel
    const approvedProducts = await ProductModel.find(query)
      .select('productName description price salePrice productImages vendorId stock createdAt origin')
      .sort({ createdAt: -1 })
      .limit(50);

    // Separate products by origin (Vendor vs Supplier)
    const vendorProducts = approvedProducts.filter(p => p.origin === 'Vendor');
    const supplierProducts = approvedProducts.filter(p => p.origin === 'Supplier');

    // Get vendor IDs and supplier IDs
    const vendorIds = [...new Set(vendorProducts.map(p => p.vendorId))];
    const supplierIds = [...new Set(supplierProducts.map(p => p.vendorId))];

    // Fetch vendors and suppliers in parallel
    const [vendors, suppliers] = await Promise.all([
      vendorIds.length > 0 
        ? VendorModel.find({ 
            _id: { $in: vendorIds }, 
            status: 'Approved' 
          }).select('_id businessName firstName lastName status city state')
        : Promise.resolve([]),
      supplierIds.length > 0 
        ? SupplierModel.find({ 
            _id: { $in: supplierIds }, 
            status: 'Approved' 
          }).select('_id shopName firstName lastName status city state')
        : Promise.resolve([])
    ]);

    // Create maps for quick lookup
    const vendorMap = new Map(vendors.map(v => [v._id.toString(), v]));
    const supplierMap = new Map(suppliers.map(s => [s._id.toString(), s]));

    // Filter and transform products
    const validProducts = approvedProducts.filter(product => {
      if (product.origin === 'Vendor') {
        return vendorMap.has(product.vendorId.toString());
      } else {
        return supplierMap.has(product.vendorId.toString());
      }
    });

    if (validProducts.length === 0) {
      return Response.json({
        success: true,
        products: [],
        count: 0,
        message: "No approved products from approved vendors found"
      });
    }

    // Transform the data for the frontend
    const transformedProducts = validProducts.map(product => {
      let vendorData = null;
      if (product.origin === 'Vendor') {
        vendorData = vendorMap.get(product.vendorId.toString());
      } else {
        vendorData = supplierMap.get(product.vendorId.toString());
      }

      return {
        id: product._id,
        name: product.productName,
        description: product.description || '',
        price: product.price,
        salePrice: product.salePrice > 0 ? product.salePrice : null,
        image: product.productImages && product.productImages.length > 0 
          ? product.productImages[0] 
          : 'https://placehold.co/320x224/e2e8f0/64748b?text=Product',
        vendorId: vendorData?._id || product.vendorId,
        vendorName: product.origin === 'Vendor' 
          ? (vendorData?.businessName || 'Unknown Vendor') 
          : (vendorData?.shopName || 'Unknown Supplier'),
        category: 'Beauty Products',
        stock: product.stock,
        isNew: new Date(product.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        rating: (4.2 + Math.random() * 0.8).toFixed(1),
        reviewCount: Math.floor(50 + Math.random() * 500),
        hint: product.description || product.productName
      };
    });

    return new Response(JSON.stringify({
      success: true,
      products: transformedProducts,
      count: transformedProducts.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      },
    });
  } catch (error) {
    console.error('Products API Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: `Failed to fetch products: ${error.message}`,
      products: [],
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      },
    });
  }
};