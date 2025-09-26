import { NextResponse } from "next/server";
import _db from "../../../../../../../../packages/lib/src/db.js";
import ProductModel from "../../../../../../../../packages/lib/src/models/Vendor/Product.model.js";
import ProductCategoryModel from "../../../../../../../../packages/lib/src/models/admin/ProductCategory.model.js";
import { authMiddlewareCrm } from "../../../../../middlewareCrm.js";

await _db();

// GET - Fetch all vendor products (public endpoint)
const getProducts = async (req) => {
  try {
    // Add CORS headers for web app access
    const headers = {
      "Access-Control-Allow-Origin": "*", // In production, specify the exact origin
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers });
    }

    // Remove user authentication requirement for public access
    // Filter products by fixed origin 'Vendor' only (no vendorId filter to fetch all products)
    const products = await ProductModel.find({ origin: 'Vendor' })
      .populate('category', 'name description')
      .sort({ createdAt: -1 })
      .lean();

    const transformedProducts = products.map(product => ({
      ...product,
      category: product.category?.name || '',
      categoryDescription: product.category?.description || product.categoryDescription || '',
      status: product.status === 'rejected' ? 'disapproved' : product.status,
    }));

    return NextResponse.json({
      success: true,
      data: transformedProducts
    }, { headers });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ 
      success: false,
      message: "Error fetching products", 
      error: error.message 
    }, { status: 500 });
  }
};

// Export GET without auth middleware for public access
export const GET = getProducts;

// Add OPTIONS export for CORS preflight
export const OPTIONS = async (req) => {
  const headers = {
    "Access-Control-Allow-Origin": "*", // In production, specify the exact origin
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  return new NextResponse(null, { status: 204, headers });
};

// ... existing code for POST, PUT, and DELETE endpoints (keeping them protected) ...
// POST - Create new product with fixed origin 'Vendor'
const createProduct = async (req) => {
    try {
        const body = await req.json();
        const { productName, description, category, categoryDescription, price, salePrice, stock, productImage, isActive, status } = body;

        if (!productName || !category || price === undefined || stock === undefined) {
            return NextResponse.json(
                { success: false, message: "Missing required fields: productName, category, price, and stock are required" },
                { status: 400 }
            );
        }

        if (price < 0 || stock < 0 || (salePrice && salePrice < 0)) {
            return NextResponse.json(
                { success: false, message: "Price, stock, and sale price cannot be negative" },
                { status: 400 }
            );
        }

        let categoryDoc = await ProductCategoryModel.findOne({ name: category });
        if (!categoryDoc) {
             return NextResponse.json(
                { success: false, message: `Category '${category}' not found` },
                { status: 400 }
            );
        }
        
        const newProduct = new ProductModel({
            vendorId: req.user._id,
            origin: 'Vendor', // Fixed to Vendor
            productName: productName.trim(),
            description: description?.trim() || '',
            category: categoryDoc._id,
            categoryDescription: categoryDescription?.trim() || '',
            price: Number(price),
            salePrice: Number(salePrice) || 0,
            stock: Number(stock),
            productImage: productImage || '',
            isActive: Boolean(isActive),
            status: status === 'disapproved' ? 'rejected' : (status || 'pending'),
            createdBy: req.user._id,
            updatedBy: req.user._id,
        });

        const savedProduct = await newProduct.save();

        const responseProduct = {
            ...savedProduct.toObject(),
            status: savedProduct.status === 'rejected' ? 'disapproved' : savedProduct.status,
            category: categoryDoc.name
        };

        return NextResponse.json({
            success: true,
            message: 'Product created successfully',
            data: responseProduct
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { success: false, message: 'Error creating product', error: error.message },
            { status: 500 }
        );
    }
};

export const POST = authMiddlewareCrm(createProduct, ["vendor"]);

// PUT (update) a product
export const PUT = authMiddlewareCrm(async (req) => {
  try {
    const { id, productImage, category, status, ...updateData } = await req.json();

    if (!id) {
      return NextResponse.json({ 
        success: false,
        message: "ID is required for update" 
      }, { status: 400 });
    }
    
    if (updateData.price !== undefined && updateData.price < 0) {
        return NextResponse.json({ success: false, message: "Price cannot be negative" }, { status: 400 });
    }
    if (updateData.stock !== undefined && updateData.stock < 0) {
        return NextResponse.json({ success: false, message: "Stock cannot be negative" }, { status: 400 });
    }
    if (updateData.salePrice !== undefined && updateData.salePrice < 0) {
        return NextResponse.json({ success: false, message: "Sale price cannot be negative" }, { status: 400 });
    }

    let categoryId = updateData.category;
    if (category) {
      const categoryDoc = await ProductCategoryModel.findOne({ name: category });
      if (!categoryDoc) {
        return NextResponse.json({ success: false, message: `Category '${category}' not found` }, { status: 400 });
      }
      categoryId = categoryDoc._id;
    }
    
    // Remove vendorId filter to allow updating any product with origin 'Vendor'
    const existingProduct = await ProductModel.findOne({ _id: id, origin: 'Vendor' });
    if (!existingProduct) {
      return NextResponse.json({ success: false, message: "Product not found or you don't have permission to update it" }, { status: 404 });
    }

    const finalUpdateData = {
        ...updateData,
        updatedBy: req.user._id,
        updatedAt: new Date()
    };

    if(categoryId) finalUpdateData.category = categoryId;
    if(productImage) finalUpdateData.productImage = productImage;
    if(status) finalUpdateData.status = status === 'disapproved' ? 'rejected' : status;

    const updatedProduct = await ProductModel.findByIdAndUpdate(id, finalUpdateData, { new: true, runValidators: true }).populate('category', 'name');

    const responseProduct = {
      ...updatedProduct.toObject(),
      status: updatedProduct.status === 'rejected' ? 'disapproved' : updatedProduct.status,
      category: updatedProduct.category?.name
    };

    return NextResponse.json({ success: true, message: 'Product updated successfully', data: responseProduct });

  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ success: false, message: "Error updating product", error: error.message }, { status: 500 });
  }
}, ["vendor"]);

// DELETE a product
export const DELETE = authMiddlewareCrm(async (req) => {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required for deletion" }, { status: 400 });
    }

    // Remove vendorId filter to allow deleting any product with origin 'Vendor'
    const deletedProduct = await ProductModel.findOneAndDelete({ _id: id, origin: 'Vendor' });

    if (!deletedProduct) {
      return NextResponse.json({ success: false, message: "Product not found or you don't have permission to delete it" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ success: false, message: "Error deleting product", error: error.message }, { status: 500 });
  }
}, ["vendor"]);