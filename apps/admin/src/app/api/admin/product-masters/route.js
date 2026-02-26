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
    let imageUrl = null;

    // Upload image to VPS if provided
    if (image) {
      const fileName = `product-master-${Date.now()}`;
      imageUrl = await uploadBase64(image, fileName);

      if (!imageUrl) {
        return Response.json(
          { 
            success: false,
            message: "Failed to upload image" 
          },
          { status: 500 }
        );
      }
    }

    const newProductMaster = await ProductMasterModel.create({
      name,
      category,
      brand,
      description,
      productForm,
      keyIngredients: Array.isArray(keyIngredients) ? keyIngredients : [],
      productImage: imageUrl
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

      // Handle image upload if new image is provided
      if (updateData.image !== undefined) {
        if (updateData.image) {
          // Upload new image to VPS
          const fileName = `product-master-${Date.now()}`;
          const imageUrl = await uploadBase64(updateData.image, fileName);

          if (!imageUrl) {
            return Response.json(
              { 
                success: false,
                message: "Failed to upload image" 
              },
              { status: 500 }
            );
          }

          // Delete old image from VPS if it exists
          if (existingProductMaster.productImage) {
            await deleteFile(existingProductMaster.productImage);
          }

          updateData.productImage = imageUrl;
        } else {
          // If image is null/empty, remove it
          updateData.productImage = null;

          // Delete old image from VPS if it exists
          if (existingProductMaster.productImage) {
            await deleteFile(existingProductMaster.productImage);
          }
        }
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

      // Delete image from VPS if it exists
      if (deletedProductMaster.productImage) {
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
