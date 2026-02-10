import _db from "@repo/lib/db";
import ProductCategoryModel from "@repo/lib/models/admin/ProductCategory";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

await _db();

// Add CORS headers - More permissive for development
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins in development
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Admin-Authorization, Vendor-Authorization",
  "Access-Control-Allow-Credentials": "true"
};

// Handle CORS preflight requests
export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
};

// GET all product categories
export const GET = async (req) => {
  try {
    const categories = await ProductCategoryModel.find({}).sort({ createdAt: -1 });
    return Response.json({
      success: true,
      data: categories,
      count: categories.length,
    }, { 
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return Response.json(
      { 
        success: false,
        message: "Error fetching product categories", 
        error: error.message 
      },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
};

// POST a new product category
export const POST = async (req) => {
  try {
    const body = await req.json();
    const { name, description, gstType, gstValue } = body;

    // Validation
    if (!name || name.trim() === '') {
      return Response.json({ 
        success: false,
        message: "Category name is required" 
      }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Check if category already exists
    const existingCategory = await ProductCategoryModel.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });

    if (existingCategory) {
      return Response.json({ 
        success: false,
        message: "Category with this name already exists" 
      }, { 
        status: 409,
        headers: corsHeaders
      });
    }

    // Create new category
    const newCategory = await ProductCategoryModel.create({ 
      name: name.trim(), 
      description: description?.trim() || '',
      gstType: gstType || 'none',
      gstValue: gstValue ? Number(gstValue) : 0
    });

    return Response.json({
      success: true,
      data: newCategory,
      message: "Product category created successfully"
    }, { 
      status: 201,
      headers: corsHeaders
    });

  } catch (error) {
    console.error("Error creating product category:", error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return Response.json({
        success: false,
        message: "Validation error",
        errors: validationErrors
      }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return Response.json({
        success: false,
        message: "Category with this name already exists"
      }, { 
        status: 409,
        headers: corsHeaders
      });
    }

    return Response.json(
      { 
        success: false,
        message: "Error creating product category", 
        error: error.message 
      },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
};

// PUT update a product category
export const PUT = async (req) => {
  try {
    const body = await req.json();
    const { id, name, description, gstType, gstValue } = body;

    if (!id) {
      return Response.json({ 
        success: false,
        message: "Category ID is required" 
      }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    if (!name || name.trim() === '') {
      return Response.json({ 
        success: false,
        message: "Category name is required" 
      }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Check if another category with the same name exists (excluding current one)
    const existingCategory = await ProductCategoryModel.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      _id: { $ne: id }
    });

    if (existingCategory) {
      return Response.json({ 
        success: false,
        message: "Another category with this name already exists" 
      }, { 
        status: 409,
        headers: corsHeaders
      });
    }

    // Update category
    const updatedCategory = await ProductCategoryModel.findByIdAndUpdate(
      id,
      { 
        name: name.trim(), 
        description: description?.trim() || '',
        gstType: gstType || 'none',
        gstValue: gstValue ? Number(gstValue) : 0,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return Response.json({ 
        success: false,
        message: "Product category not found" 
      }, { 
        status: 404,
        headers: corsHeaders
      });
    }

    return Response.json({
      success: true,
      data: updatedCategory,
      message: "Product category updated successfully"
    }, { 
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error("Error updating product category:", error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return Response.json({
        success: false,
        message: "Validation error",
        errors: validationErrors
      }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    return Response.json(
      { 
        success: false,
        message: "Error updating product category", 
        error: error.message 
      },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
};

// DELETE a product category
export const DELETE = async (req) => {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return Response.json({ 
        success: false,
        message: "Category ID is required" 
      }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Check if category exists
    const category = await ProductCategoryModel.findById(id);
    if (!category) {
      return Response.json({ 
        success: false,
        message: "Product category not found" 
      }, { 
        status: 404,
        headers: corsHeaders
      });
    }

    // TODO: Check if category is being used by any products
    // const ProductModel = require('path/to/Product.model');
    // const productCount = await ProductModel.countDocuments({ category: id });
    // if (productCount > 0) {
    //   return Response.json({ 
    //     success: false,
    //     message: "Cannot delete category that is being used by products" 
    //   }, { status: 409 });
    // }

    // Delete category
    await ProductCategoryModel.findByIdAndDelete(id);

    return Response.json({
      success: true,
      message: "Product category deleted successfully"
    }, { 
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error("Error deleting product category:", error);
    return Response.json(
      { 
        success: false,
        message: "Error deleting product category", 
        error: error.message 
      },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
};