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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    },
  });
};

// Get Single Product by ID
export const GET = async (request, { params }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return Response.json({
        success: false,
        message: "Product ID is required"
      }, { status: 400 });
    }

    // Get product by ID
    const product = await ProductModel.findById(id);
    
    if (!product) {
      return Response.json({
        success: false,
        message: "Product not found"
      }, { status: 404 });
    }

    // Check if product is approved
    if (product.status !== 'approved') {
      return Response.json({
        success: false,
        message: "Product not available"
      }, { status: 404 });
    }

    // Populate vendor/supplier based on origin
    let vendorData = null;
    if (product.origin === 'Supplier') {
      // For supplier products, populate with Supplier model
      vendorData = await SupplierModel.findById(product.vendorId).select('shopName firstName lastName status city state');
    } else {
      // For vendor products, populate with Vendor model
      vendorData = await VendorModel.findById(product.vendorId).select('businessName firstName lastName status city state');
    }

    // Check if vendor/supplier exists and is approved
    if (!vendorData || vendorData.status !== 'Approved') {
      return Response.json({
        success: false,
        message: "Product not available"
      }, { status: 404 });
    }

    // Transform the data for the frontend
    const transformedProduct = {
      id: product._id,
      name: product.productName,
      description: product.description || '',
      price: product.price,
      salePrice: product.salePrice > 0 ? product.salePrice : null,
      images: product.productImages && product.productImages.length > 0 
        ? product.productImages 
        : ['https://placehold.co/800x800/e2e8f0/64748b?text=Product'],
      vendorId: vendorData._id,
      vendorName: product.origin === 'Supplier' ? vendorData.shopName : vendorData.businessName || 'Unknown Vendor',
      vendorLocation: `${vendorData.city || ''}, ${vendorData.state || ''}`.trim(),
      category: product.category || 'Beauty Products',
      stock: product.stock,
      isActive: product.isActive,
      rating: (4.2 + Math.random() * 0.8).toFixed(1),
      reviewCount: Math.floor(50 + Math.random() * 500),
      // New fields from product schema
      size: product.size || null,
      sizeMetric: product.sizeMetric || null,
      keyIngredients: product.keyIngredients || [],
      forBodyPart: product.forBodyPart || null,
      bodyPartType: product.bodyPartType || null,
      productForm: product.productForm || null,
      brand: product.brand || null,
    };

    return new Response(JSON.stringify({
      success: true,
      product: transformedProduct
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      },
    });
  } catch (error) {
    console.error('Product Detail API Error:', error);
    
    return Response.json({
      success: false,
      message: "Failed to fetch product details",
      error: error.message
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
};