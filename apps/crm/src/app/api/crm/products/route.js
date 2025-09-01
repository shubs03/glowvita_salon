
import { NextResponse } from "next/server";
import _db from "../../../../../../../packages/lib/src/db.js";
import ProductModel from "../../../../../../../packages/lib/src/models/Vendor/Product.model.js";
import ProductCategoryModel from "../../../../../../../packages/lib/src/models/admin/ProductCategory.model.js";
import { authMiddlewareCrm } from "../../../../middlewareCrm.js";

await _db();

// GET - Fetch all products
const getProducts = async (req) => {
  try {
    const products = await ProductModel.find({})
      .populate('category', 'name description')
      .sort({ createdAt: -1 })
      .lean();

    // Transform the data to include category name for frontend compatibility
    const transformedProducts = products.map(product => ({
      ...product,
      category: product.category?.name || '',
      categoryDescription: product.category?.description || product.categoryDescription || ''
    }));

    return NextResponse.json({
      success: true,
      data: transformedProducts
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ 
      success: false,
      message: "Error fetching products", 
      error: error.message 
    }, { status: 500 });
  }
};

export const GET = authMiddlewareCrm(getProducts, ["vendor", "supplier"]);

// POST - Create new product
const createProduct = async (req) => {
    try {
        const body = await req.json();
        console.log('Creating product with data:', body);
        const { productName, description, category, categoryDescription, price, salePrice, stock, productImage, isActive } = body;

        // Validate required fields
        if (!productName || !category || price === undefined || stock === undefined) {
            console.log('Validation error: Missing required fields');
            return NextResponse.json(
                { success: false, message: "Missing required fields: productName, category, price, and stock are required" },
                { status: 400 }
            );
        }

        if (price < 0 || stock < 0 || (salePrice && salePrice < 0)) {
            console.log('Validation error: Negative values not allowed');
            return NextResponse.json(
                { success: false, message: "Price, stock, and sale price cannot be negative" },
                { status: 400 }
            );
        }

        // Find category by name to get ObjectId
        let categoryId = null;
        if (category) {
            console.log('Looking for category:', category);
            const categoryDoc = await ProductCategoryModel.findOne({ name: category });
            if (!categoryDoc) {
                console.log('Category not found:', category);
                return NextResponse.json(
                    { success: false, message: `Category '${category}' not found` },
                    { status: 400 }
                );
            }
            categoryId = categoryDoc._id;
            console.log('Found category ID:', categoryId);
        }

        // Handle image - for now, store the base64 directly or use provided URL
        let imageUrl = '';
        if (productImage) {
            // If it's a base64 image, store it directly (temporary solution)
            // In production, you would upload to cloud storage and get a URL
            imageUrl = productImage;
        }

        // Create new product
        const newProduct = new ProductModel({
            productName: productName.trim(),
            description: description?.trim() || '',
            category: categoryId,
            categoryDescription: categoryDescription?.trim() || '',
            price: Number(price),
            salePrice: Number(salePrice) || 0,
            stock: Number(stock),
            productImage: imageUrl,
            isActive: Boolean(isActive),
            createdBy: req.user._id.toString(),
            updatedBy: req.user._id.toString(),
        });

        const savedProduct = await newProduct.save();
        console.log('Product saved successfully:', savedProduct._id);

        return NextResponse.json({
            success: true,
            message: 'Product created successfully',
            data: savedProduct
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { success: false, message: 'Error creating product', error: error.message },
            { status: 500 }
        );
    }
};

export const POST = authMiddlewareCrm(createProduct, ["vendor", "supplier"]);

// PUT (update) a product
export const PUT = authMiddlewareCrm(async (req) => {
  try {
    const { id, productImage, category, ...updateData } = await req.json();

    if (!id) {
      return NextResponse.json({ 
        success: false,
        message: "ID is required for update" 
      }, { status: 400 });
    }
    
    // Server-side validation for updates
    if (updateData.price !== undefined && updateData.price < 0) {
        return NextResponse.json({ 
          success: false,
          message: "Price cannot be negative" 
        }, { status: 400 });
    }
    if (updateData.stock !== undefined && updateData.stock < 0) {
        return NextResponse.json({ 
          success: false,
          message: "Stock cannot be negative" 
        }, { status: 400 });
    }
    if (updateData.salePrice !== undefined && updateData.salePrice < 0) {
        return NextResponse.json({ 
          success: false,
          message: "Sale price cannot be negative" 
        }, { status: 400 });
    }

    // Find category by name to get ObjectId if category is provided
    let categoryId = updateData.category;
    if (category) {
      const categoryDoc = await ProductCategoryModel.findOne({ name: category });
      if (!categoryDoc) {
        return NextResponse.json(
          { success: false, message: `Category '${category}' not found` },
          { status: 400 }
        );
      }
      categoryId = categoryDoc._id;
    }

    // Handle image - for now, store the base64 directly or use provided URL
    let imageUrl = updateData.productImage;
    if (productImage) {
      // If it's a base64 image, store it directly (temporary solution)
      // In production, you would upload to cloud storage and get a URL
      imageUrl = productImage;
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        category: categoryId,
        productImage: imageUrl,
        updatedBy: req.user._id.toString(),
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ 
        success: false,
        message: "Product not found" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ 
      success: false,
      message: "Error updating product", 
      error: error.message 
    }, { status: 500 });
  }
}, ["vendor", "supplier"]);

// DELETE a product
export const DELETE = authMiddlewareCrm(async (req) => {
  try {
    // Get ID from URL search params
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    console.log('DELETE request for product ID:', id);

    if (!id) {
      return NextResponse.json({ 
        success: false,
        message: "ID is required for deletion" 
      }, { status: 400 });
    }

    const deletedProduct = await ProductModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ 
        success: false,
        message: "Product not found" 
      }, { status: 404 });
    }
    
    console.log('Product deleted successfully:', id);

    return NextResponse.json({ 
      success: true,
      message: "Product deleted successfully" 
    });

  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ 
      success: false,
      message: "Error deleting product", 
      error: error.message 
    }, { status: 500 });
  }
}, ["vendor", "supplier"]);
