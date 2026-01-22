
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Owner is required'],
    refPath: 'origin'
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory',
    required: [true, 'Category is required'],
  },
  categoryDescription: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  salePrice: {
    type: Number,
    min: [0, 'Sale price cannot be negative'],
    default: 0,
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  productImages: {
    type: [String], // Array of URLs to uploaded images
    default: [],
  },
  size: {
    type: String,
    trim: true,
  },
  sizeMetric: {
    type: String,
    trim: true,
  },
  keyIngredients: {
    type: [String],
    default: [],
  },
  forBodyPart: {
    type: String,
    trim: true,
  },
  bodyPartType: {
    type: String,
    trim: true,
  },
  productForm: {
    type: String,
    trim: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'disapproved'],
    default: 'pending',
  },
  regionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Region",
    required: true,
    index: true,
  },
  origin: {
    type: String,
    required: true,
    enum: ['Vendor', 'Supplier'],
    default: 'Vendor'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

productSchema.pre('save', async function (next) {
  try {
    // 1. Inherit regionId from Parent (Vendor or Supplier) if missing
    if (!this.regionId && this.vendorId) {
      let ParentModel;
      if (this.origin === 'Vendor') {
        ParentModel = mongoose.models.Vendor || (await import('./Vendor.model.js')).default;
      } else {
        ParentModel = mongoose.models.Supplier || (await import('./Supplier.model.js')).default;
      }
      
      const parent = await ParentModel.findById(this.vendorId).select('regionId');
      if (parent && parent.regionId) {
        this.regionId = parent.regionId;
      }
    }

    this.updatedAt = new Date();
    next();
  } catch (error) {
    console.error("Error in Product pre-save middleware:", error);
    next(error);
  }
});

const ProductModel = mongoose.models.Product || mongoose.model('Product', productSchema, 'crm_products');

export default ProductModel;
