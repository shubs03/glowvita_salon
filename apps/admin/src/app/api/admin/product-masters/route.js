import _db from "@repo/lib/db";
import ProductMasterModel from "@repo/lib/models/admin/ProductMaster.model";
import ProductCategoryModel from "@repo/lib/models/admin/ProductCategory";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";
import { uploadBase64, deleteFile } from "@repo/lib/utils/upload";

await _db();

// GET all product masters - No auth required for reading templates
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    const productMasters = await ProductMasterModel.find({}).populate("category", "name");
    console.log('Admin: Sending product masters:', productMasters.length, 'items');
    return Response.json({
      success: true,
      data: productMasters,
      count: productMasters.length
    }, { status: 200 });
  } catch (error) {
    console.error('Admin: Error fetching product masters:', error);
    return Response.json(
      {
        success: false,
        message: "Error fetching product masters",
        error: error.message
      },
      { status: 500 }
    );
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "product-masters:view");

// POST a new product master
export const POST = authMiddlewareAdmin(async (req) => {
  const body = await req.json();
  const { name, category, brand, description, productForm, keyIngredients, image } = body;

  if (!name || !category) {
    return Response.json(
      {
        success: false,
        message: "Name and category are required"
      },
      { status: 400 }
    );
  }

  try {
    let imageUrls = [];

    // Upload images to VPS if provided
    if (image && Array.isArray(image)) {
      for (const imgBase64 of image) {
        const fileName = `product-master-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const uploadedUrl = await uploadBase64(imgBase64, fileName);
        if (uploadedUrl) {
          imageUrls.push(uploadedUrl);
        }
      }
    } else if (image) {
      // Handle single image if it's not an array for backward compatibility
      const fileName = `product-master-${Date.now()}`;
      const uploadedUrl = await uploadBase64(image, fileName);
      if (uploadedUrl) {
        imageUrls.push(uploadedUrl);
      }
    }

    const newProductMaster = await ProductMasterModel.create({
      name,
      category,
      brand,
      description,
      productForm,
      keyIngredients: Array.isArray(keyIngredients) ? keyIngredients : [],
      productImages: imageUrls,
      productImage: imageUrls.length > 0 ? imageUrls[imageUrls.length - 1] : null
    });

    return Response.json({
      success: true,
      data: newProductMaster,
      message: "Product master created successfully"
    }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Error creating product master",
        error: error.message
      },
      { status: 500 }
    );
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "product-masters:edit");

// PUT (update) a product master by ID
export const PUT = authMiddlewareAdmin(
  async (req) => {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return Response.json(
        {
          success: false,
          message: "ID is required for update"
        },
        { status: 400 }
      );
    }

    try {
      // Get existing product master to check for old image
      const existingProductMaster = await ProductMasterModel.findById(id);
      if (!existingProductMaster) {
        return Response.json({
          success: false,
          message: "Product master not found"
        }, { status: 404 });
      }

      // Handle image upload if new images are provided
      if (updateData.image !== undefined) {
        let finalImageUrls = [];
        const oldImageUrls = existingProductMaster.productImages || [];

        // If it's a new upload (array of strings - either URLs or base64)
        if (Array.isArray(updateData.image)) {
          for (const imgData of updateData.image) {
            if (typeof imgData === 'string' && (imgData.startsWith('http') || imgData.startsWith('/uploads/'))) {
              // Already an uploaded URL
              finalImageUrls.push(imgData);
            } else if (imgData) {
              // New base64 image, upload it
              const fileName = `product-master-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
              const uploadedUrl = await uploadBase64(imgData, fileName);
              if (uploadedUrl) {
                finalImageUrls.push(uploadedUrl);
              }
            }
          }
        } else if (updateData.image) {
          // Single image string (either URL or base64)
          if (typeof updateData.image === 'string' && (updateData.image.startsWith('http') || updateData.image.startsWith('/uploads/'))) {
            finalImageUrls.push(updateData.image);
          } else {
            const fileName = `product-master-${Date.now()}`;
            const uploadedUrl = await uploadBase64(updateData.image, fileName);
            if (uploadedUrl) {
              finalImageUrls.push(uploadedUrl);
            }
          }
        }

        // Cleanup: delete files that are no longer in the final list
        for (const oldUrl of oldImageUrls) {
          if (!finalImageUrls.includes(oldUrl)) {
            await deleteFile(oldUrl);
          }
        }

        // Also cleanup old productImage if it's not in the new list and exists independently
        if (existingProductMaster.productImage && !finalImageUrls.includes(existingProductMaster.productImage)) {
          await deleteFile(existingProductMaster.productImage);
        }

        updateData.productImages = finalImageUrls;
        updateData.productImage = finalImageUrls.length > 0 ? finalImageUrls[finalImageUrls.length - 1] : null;
        delete updateData.image;
      }

      // Handle keyIngredients array
      if (updateData.keyIngredients && !Array.isArray(updateData.keyIngredients)) {
        updateData.keyIngredients = [];
      }

      const updatedProductMaster = await ProductMasterModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      return Response.json({
        success: true,
        data: updatedProductMaster,
        message: "Product master updated successfully"
      }, { status: 200 });
    } catch (error) {
      return Response.json(
        {
          success: false,
          message: "Error updating product master",
          error: error.message
        },
        { status: 500 }
      );
    }
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"],
  "product-masters:edit"
);

// DELETE a product master by ID
export const DELETE = authMiddlewareAdmin(
  async (req) => {
    const { id } = await req.json();

    if (!id) {
      return Response.json(
        {
          success: false,
          message: "ID is required for deletion"
        },
        { status: 400 }
      );
    }

    try {
      const deletedProductMaster = await ProductMasterModel.findByIdAndDelete(id);
      if (!deletedProductMaster) {
        return Response.json(
          {
            success: false,
            message: "Product master not found"
          },
          { status: 404 }
        );
      }

      // Delete images from VPS if they exist
      if (deletedProductMaster.productImages && Array.isArray(deletedProductMaster.productImages)) {
        for (const imgUrl of deletedProductMaster.productImages) {
          await deleteFile(imgUrl);
        }
      } else if (deletedProductMaster.productImage) {
        await deleteFile(deletedProductMaster.productImage);
      }

      return Response.json(
        {
          success: true,
          message: "Product master deleted successfully"
        },
        { status: 200 }
      );
    } catch (error) {
      return Response.json(
        {
          success: false,
          message: "Error deleting product master",
          error: error.message
        },
        { status: 500 }
      );
    }
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"],
  "product-masters:delete"
);
