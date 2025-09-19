import { NextResponse } from "next/server";
import _db from "../../../../../../packages/lib/src/db.js";
import ProductModel from "../../../../../../packages/lib/src/models/Vendor/Product.model.js";
import ProductCategoryModel from "../../../../../../packages/lib/src/models/admin/ProductCategory.model.js";

// GET - Fetch a single product by ID
export async function GET(request, { params }) {
  try {
    // Connect to database
    await _db();
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          message: "Product ID is required" 
        },
        { status: 400 }
      );
    }
    
    // Fetch product with populated category and vendor
    const product = await ProductModel.findById(id)
      .populate('category', 'name description')
      .populate('vendorId', 'name') // Assuming vendor model has 'name' field
      .lean();
    
    if (!product) {
      return NextResponse.json(
        { 
          success: false,
          message: "Product not found" 
        },
        { status: 404 }
      );
    }
    
    // Transform product to match frontend expectations
    const transformedProduct = {
      id: product._id.toString(),
      name: product.productName,
      description: product.description,
      fullDescription: product.description, // In a real app, this might be a separate field
      price: product.price,
      salePrice: product.salePrice > 0 ? product.salePrice : undefined,
      image: product.productImage || 'https://images.unsplash.com/photo-1526947425629-310f1053ab48?w=800&h=800&fit=crop',
      rating: 4.5, // In a real app, this would come from reviews
      reviewCount: Math.floor(Math.random() * 1000) + 100, // Mock review count
      vendorName: product.vendorId?.name || 'Unknown Vendor',
      isNew: product.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // New if created within last 7 days
      category: product.category?.name || 'Uncategorized',
      inStock: product.stock > 0,
      stockCount: product.stock,
      size: 'Standard', // In a real app, this might be a separate field
      features: [
        'High quality materials',
        'Durable construction',
        'Easy to use',
        'Comes with warranty',
        'Eco-friendly'
      ], // In a real app, this might be a separate field
      ingredients: 'Natural ingredients' // In a real app, this might be a separate field
    };
    
    return NextResponse.json({
      success: true,
      data: transformedProduct
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Error fetching product", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}