import { NextResponse } from "next/server";
import _db from "../../../../../../../packages/lib/src/db.js";
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import ProductCategoryModel from "../../../../../../../packages/lib/src/models/admin/ProductCategory.model.js";
import { authMiddlewareCrm } from "../../../../middlewareCrm";
import mongoose from 'mongoose';
import { uploadBase64, deleteFile } from '@repo/lib/utils/upload';

await _db();

// Utility function to process multiple base64 images and upload them
const processMultipleImages = async (images, vendorId, prefix = 'product') => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return [];
  }

  const uploadedUrls = [];

  for (let i = 0; i < images.length; i++) {
    const imageData = images[i];

    // Skip if empty or already a URL
    if (!imageData) continue;
    if (imageData.startsWith('http')) {
      uploadedUrls.push(imageData);
      continue;
    }

    try {
      const fileName = `${prefix}-${vendorId}-${Date.now()}-${i}`;
      const imageUrl = await uploadBase64(imageData, fileName);
      if (imageUrl) {
        uploadedUrls.push(imageUrl);
      }
    } catch (error) {
      console.error(`Failed to upload image ${i}:`, error);
      // Continue with other images even if one fails
    }
  }

  return uploadedUrls;
};

// Utility function to process base64 image and upload it
// Also deletes the old image if a new one is uploaded
const processBase64Image = async (base64String, fileName, oldImageUrl = null) => {
  if (!base64String) return null;

  // Check if it's already a URL (not base64)
  if (base64String.startsWith('http')) {
    return base64String; // Already uploaded, return as is
  }

  // Upload the base64 image and return the URL
  const imageUrl = await uploadBase64(base64String, fileName);

  // If upload was successful and there's an old image, delete the old one
  if (imageUrl && oldImageUrl && oldImageUrl.startsWith('http')) {
    try {
      // Attempt to delete the old file
      // We don't await this as we don't want to fail the whole operation if deletion fails
      deleteFile(oldImageUrl).catch(err => {
        console.warn('Failed to delete old image:', err);
      });
    } catch (err) {
      console.warn('Error deleting old image:', err);
    }
  }

  return imageUrl;
};

// GET - Fetch products for the current user (vendor or supplier)
const getProducts = async (req) => {
  try {
    // Get user ID from authenticated user (or from query parameters if available)
    const searchParams = req.nextUrl?.searchParams;
    const queryUserId = searchParams?.get('userId');

    // Try to get the vendor ID from multiple possible places
    const vendorId = queryUserId || req.user?._id || req.user?.userId;
    const userRole = req.user?.role;

    // Don't return 401 error if userId is missing - return empty products instead
    // This prevents auth errors from triggering logout
    if (!vendorId) {
      console.log("Warning: User/Vendor ID not found in products API request");
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Filter products by the current user's ID
    const origin = userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : null;
    const query = { vendorId: vendorId };
    if (origin) query.origin = origin;

    // Use safe database query
    let products;
    try {
      products = await ProductModel.find(query)
        .populate('category', 'name description')
        .sort({ createdAt: -1 })
        .lean();
    } catch (dbError) {
      console.error("Database error in products API:", dbError);
      return NextResponse.json({
        success: true,
        data: []  // Return empty array on DB errors to prevent auth errors
      });
    }

    const transformedProducts = products.map(product => ({
      ...product,
      category: product.category?.name || '',
      categoryDescription: product.category?.description || product.categoryDescription || '',
      status: product.status === 'rejected' ? 'disapproved' : product.status,
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
    const {
      productName,
      description,
      category,
      categoryDescription,
      price,
      salePrice,
      stock,
      productImages, // Now expecting an array
      isActive,
      status,
      size,
      sizeMetric,
      keyIngredients,
      forBodyPart,
      bodyPartType,
      productForm,
      brand
    } = body;
    const userRole = req.user?.role;

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

    // Make sure we have a valid vendor ID (either from _id or userId field in the JWT payload)
    const vendorId = req.user._id || req.user.userId;

    if (!vendorId) {
      return NextResponse.json(
        { success: false, message: "Unable to determine vendor ID from authentication" },
        { status: 400 }
      );
    }

    // Handle product images upload - now supports multiple images
    let productImageUrls = [];
    if (productImages) {
      // Ensure it's an array
      const imagesArray = Array.isArray(productImages) ? productImages : [productImages];
      productImageUrls = await processMultipleImages(imagesArray, vendorId, 'product');
    }

    // Process keyIngredients - convert comma-separated string to array
    let processedKeyIngredients = [];
    if (keyIngredients) {
      if (typeof keyIngredients === 'string') {
        processedKeyIngredients = keyIngredients.split(',').map(i => i.trim()).filter(i => i.length > 0);
      } else if (Array.isArray(keyIngredients)) {
        processedKeyIngredients = keyIngredients;
      }
    }

    // Fetch owner's region to inherit
    let parentRegionId = null;
    try {
      const Model = userRole === 'supplier'
        ? (await import("@repo/lib/models/Vendor/Supplier.model")).default
        : (await import("@repo/lib/models/Vendor/Vendor.model")).default;

      const parent = await Model.findById(vendorId).select('regionId');
      parentRegionId = parent?.regionId;
    } catch (err) {
      console.error("Error inheriting region for product:", err);
    }

    const newProduct = new ProductModel({
      vendorId: vendorId,
      regionId: parentRegionId,
      origin: userRole.charAt(0).toUpperCase() + userRole.slice(1),
      productName: productName.trim(),
      description: description?.trim() || '',
      category: categoryDoc._id,
      categoryDescription: categoryDescription?.trim() || '',
      price: Number(price),
      salePrice: Number(salePrice) || 0,
      stock: Number(stock),
      productImages: productImageUrls,
      isActive: Boolean(isActive),
      status: status === 'disapproved' ? 'rejected' : (status || 'pending'),
      size: size?.trim() || '',
      sizeMetric: sizeMetric?.trim() || '',
      keyIngredients: processedKeyIngredients,
      forBodyPart: forBodyPart?.trim() || '',
      bodyPartType: bodyPartType?.trim() || '',
      productForm: productForm?.trim() || '',
      brand: brand?.trim() || '',
      createdBy: vendorId,
      updatedBy: vendorId,
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

// Bulk create products
const bulkCreateProducts = async (req) => {
  try {
    const body = await req.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, message: "Products array is required and cannot be empty" },
        { status: 400 }
      );
    }

    const userRole = req.user?.role;

    // Make sure we have a valid vendor ID (either from _id or userId field in the JWT payload)
    const vendorId = req.user._id || req.user.userId;

    if (!vendorId) {
      return NextResponse.json(
        { success: false, message: "Unable to determine vendor ID from authentication" },
        { status: 400 }
      );
    }

    // Validate all products first
    for (const product of products) {
      if (!product.productName || !product.category || product.price === undefined || product.stock === undefined) {
        return NextResponse.json(
          { success: false, message: `Missing required fields for product: ${product.productName || 'unknown'}. Required: productName, category, price, and stock` },
          { status: 400 }
        );
      }

      if (product.price < 0 || product.stock < 0 || (product.salePrice && product.salePrice < 0)) {
        return NextResponse.json(
          { success: false, message: `Price, stock, and sale price cannot be negative for product: ${product.productName}` },
          { status: 400 }
        );
      }

      // Check if category exists
      let categoryDoc = await ProductCategoryModel.findOne({ name: product.category });
      if (!categoryDoc) {
        return NextResponse.json(
          { success: false, message: `Category '${product.category}' not found for product: ${product.productName}` },
          { status: 400 }
        );
      }
    }

    // Process all products
    const createdProducts = [];
    const errors = [];

    for (const product of products) {
      try {
        // Find the category again (since we validated earlier)
        let categoryDoc = await ProductCategoryModel.findOne({ name: product.category });

        // Process keyIngredients - convert comma-separated string to array
        let processedKeyIngredients = [];
        if (product.keyIngredients) {
          if (typeof product.keyIngredients === 'string') {
            processedKeyIngredients = product.keyIngredients.split(',').map(i => i.trim()).filter(i => i.length > 0);
          } else if (Array.isArray(product.keyIngredients)) {
            processedKeyIngredients = product.keyIngredients;
          }
        }

        const newProduct = new ProductModel({
          vendorId: vendorId,
          origin: userRole.charAt(0).toUpperCase() + userRole.slice(1),
          productName: product.productName.trim(),
          description: product.description?.trim() || '',
          category: categoryDoc._id,
          categoryDescription: product.categoryDescription?.trim() || '',
          price: Number(product.price),
          salePrice: Number(product.salePrice) || 0,
          stock: Number(product.stock),
          productImages: product.productImages || [],
          isActive: product.isActive !== undefined ? Boolean(product.isActive) : true,
          status: product.status === 'disapproved' ? 'rejected' : (product.status || 'pending'),
          size: product.size?.trim() || '',
          sizeMetric: product.sizeMetric?.trim() || '',
          keyIngredients: processedKeyIngredients,
          forBodyPart: product.forBodyPart?.trim() || '',
          bodyPartType: product.bodyPartType?.trim() || '',
          productForm: product.productForm?.trim() || '',
          brand: product.brand?.trim() || '',
          createdBy: vendorId,
          updatedBy: vendorId,
        });

        const savedProduct = await newProduct.save();

        const responseProduct = {
          ...savedProduct.toObject(),
          status: savedProduct.status === 'rejected' ? 'disapproved' : savedProduct.status,
          category: categoryDoc.name
        };

        createdProducts.push(responseProduct);
      } catch (error) {
        errors.push({
          productName: product.productName,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk creation completed: ${createdProducts.length} created, ${errors.length} failed`,
      data: {
        created: createdProducts,
        errors: errors,
        totalProcessed: products.length,
        successCount: createdProducts.length,
        errorCount: errors.length
      }
    });

  } catch (error) {
    console.error('Error in bulk product creation:', error);
    return NextResponse.json(
      { success: false, message: 'Error in bulk product creation', error: error.message },
      { status: 500 }
    );
  }
};

// POST - Create single product or multiple products (bulk)
export const POST = authMiddlewareCrm(async (req) => {
  try {
    const body = await req.json();

    if (body && Array.isArray(body.products) && body.products.length > 0) {
      // This is a bulk request
      return bulkCreateProducts(req);
    } else {
      // This is a single product request
      return createProduct(req);
    }
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { success: false, message: 'Error processing request', error: error.message },
      { status: 500 }
    );
  }
}, ["vendor", "supplier"]);

// PUT (update) a product
export const PUT = authMiddlewareCrm(async (req) => {
  try {
    const {
      id,
      productImages, // Now expecting an array
      category,
      status,
      size,
      sizeMetric,
      keyIngredients,
      forBodyPart,
      bodyPartType,
      productForm,
      brand,
      ...updateData
    } = await req.json();

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

    // Make sure we have a valid vendor ID (either from _id or userId field in the JWT payload)
    const vendorId = req.user._id || req.user.userId;

    if (!vendorId) {
      return NextResponse.json(
        { success: false, message: "Unable to determine vendor ID from authentication" },
        { status: 400 }
      );
    }

    const existingProduct = await ProductModel.findOne({ _id: id, vendorId: vendorId });
    if (!existingProduct) {
      return NextResponse.json({ success: false, message: "Product not found or you don't have permission to update it" }, { status: 404 });
    }

    const finalUpdateData = {
      ...updateData,
      updatedBy: vendorId,
      updatedAt: new Date()
    };

    // Handle product images upload - now supports multiple images
    if (productImages !== undefined) {
      if (productImages && productImages.length > 0) {
        // Ensure it's an array
        const imagesArray = Array.isArray(productImages) ? productImages : [productImages];

        // Separate existing URLs from new base64 images
        const existingUrls = imagesArray.filter(img => img && img.startsWith('http'));
        const newBase64Images = imagesArray.filter(img => img && !img.startsWith('http'));

        // Upload new images
        const newUploadedUrls = await processMultipleImages(newBase64Images, vendorId, 'product');

        // Combine existing and new URLs
        finalUpdateData.productImages = [...existingUrls, ...newUploadedUrls];

        // Delete removed images (images that were in old array but not in new array)
        const oldImages = existingProduct.productImages || [];
        const removedImages = oldImages.filter(oldImg => !finalUpdateData.productImages.includes(oldImg));

        for (const removedImg of removedImages) {
          if (removedImg && removedImg.startsWith('http')) {
            try {
              await deleteFile(removedImg);
            } catch (err) {
              console.warn('Failed to delete removed image:', err);
            }
          }
        }
      } else {
        // If productImages is empty array, remove all images
        finalUpdateData.productImages = [];

        // Delete all old images
        const oldImages = existingProduct.productImages || [];
        for (const oldImg of oldImages) {
          if (oldImg && oldImg.startsWith('http')) {
            try {
              await deleteFile(oldImg);
            } catch (err) {
              console.warn('Failed to delete old image:', err);
            }
          }
        }
      }
    }

    // Process keyIngredients - convert comma-separated string to array
    if (keyIngredients !== undefined) {
      if (typeof keyIngredients === 'string') {
        finalUpdateData.keyIngredients = keyIngredients.split(',').map(i => i.trim()).filter(i => i.length > 0);
      } else if (Array.isArray(keyIngredients)) {
        finalUpdateData.keyIngredients = keyIngredients;
      } else {
        finalUpdateData.keyIngredients = [];
      }
    }

    // Add the new fields to finalUpdateData if they are provided
    if (size !== undefined) finalUpdateData.size = size?.trim() || '';
    if (sizeMetric !== undefined) finalUpdateData.sizeMetric = sizeMetric?.trim() || '';
    if (forBodyPart !== undefined) finalUpdateData.forBodyPart = forBodyPart?.trim() || '';
    if (bodyPartType !== undefined) finalUpdateData.bodyPartType = bodyPartType?.trim() || '';
    if (productForm !== undefined) finalUpdateData.productForm = productForm?.trim() || '';
    if (brand !== undefined) finalUpdateData.brand = brand?.trim() || '';

    if (categoryId) finalUpdateData.category = categoryId;
    if (status) finalUpdateData.status = status === 'disapproved' ? 'rejected' : status;

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
}, ["vendor", "supplier"]);

// DELETE a product
export const DELETE = authMiddlewareCrm(async (req) => {
  try {
    console.log("DELETE request received");
    // Ensure database connection
    await _db();
    const body = await req.json();
    console.log("Request body:", body);
    console.log("Request body type:", typeof body);
    console.log("Body keys:", Object.keys(body));

    // Extract ID from the body object { id: '...' }
    let id = body.id || body._id;
    console.log("Raw ID extracted:", id, "Type:", typeof id);

    // Convert to string if it's not already
    if (id && typeof id === 'object' && id.toString) {
      console.log("ID is an object, converting with toString()");
      id = id.toString();
    } else if (id) {
      console.log("Converting ID to string with String()");
      id = String(id);
    }

    console.log("Extracted ID after conversion:", id, "Type:", typeof id, "Length:", id?.length);

    if (!id) {
      console.log("ID is missing from request body");
      return NextResponse.json({ success: false, message: "ID is required for deletion" }, { status: 400 });
    }

    console.log("Product ID to delete:", id);

    // Make sure we have a valid vendor ID (either from _id or userId field in the JWT payload)
    console.log("Full user object:", JSON.stringify(req.user, null, 2));
    const vendorId = req.user._id || req.user.userId;
    console.log("Vendor ID from request:", vendorId);

    if (!vendorId) {
      console.log("Unable to determine vendor ID from authentication");
      return NextResponse.json(
        { success: false, message: "Unable to determine vendor ID from authentication" },
        { status: 400 }
      );
    }

    console.log("Attempting to delete product with ID:", id, "for vendor:", vendorId);

    // Validate ObjectId format - trim whitespace first
    const trimmedId = id?.trim();
    console.log("Trimmed ID:", trimmedId, "Original length:", id?.length, "Trimmed length:", trimmedId?.length);

    if (!trimmedId || !mongoose.Types.ObjectId.isValid(trimmedId)) {
      console.log("Invalid product ID format:", trimmedId, "Type:", typeof trimmedId, "Length:", trimmedId?.length);
      console.log("Is valid ObjectId:", mongoose.Types.ObjectId.isValid(trimmedId));
      return NextResponse.json({
        success: false,
        message: "Invalid product ID format. Please try again.",
        debug: {
          receivedId: id,
          trimmedId: trimmedId,
          type: typeof id,
          isValid: mongoose.Types.ObjectId.isValid(trimmedId)
        }
      }, { status: 400 });
    }

    // Use the trimmed ID for the rest of the operation
    id = trimmedId;

    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      console.log("Invalid vendor ID format:", vendorId);
      return NextResponse.json({ success: false, message: "Invalid vendor ID format" }, { status: 400 });
    }

    let deletedProduct;
    try {
      deletedProduct = await ProductModel.findOneAndDelete({ _id: id, vendorId: vendorId });
      console.log("Delete operation result:", deletedProduct);
    } catch (dbError) {
      console.error("Database error during deletion:", dbError);
      console.error("Database error stack:", dbError.stack);
      return NextResponse.json({ success: false, message: "Database error during deletion", error: dbError.message }, { status: 500 });
    }

    if (!deletedProduct) {
      console.log("Product not found or user doesn't have permission to delete it");
      return NextResponse.json({ success: false, message: "Product not found or you don't have permission to delete it" }, { status: 404 });
    }

    // Delete all product images from VPS if they exist
    if (deletedProduct.productImages && Array.isArray(deletedProduct.productImages)) {
      for (const imageUrl of deletedProduct.productImages) {
        if (imageUrl && imageUrl.startsWith('http')) {
          try {
            await deleteFile(imageUrl);
          } catch (err) {
            console.warn('Failed to delete product image:', imageUrl, err);
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json({ success: false, message: "Error deleting product", error: error.message }, { status: 500 });
  }
}, ["vendor", "supplier"]);
