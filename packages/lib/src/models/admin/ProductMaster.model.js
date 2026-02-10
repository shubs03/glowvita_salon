import mongoose from "mongoose";

const productMasterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory',
    required: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  productForm: {
    type: String, // e.g., serum, cream, oil, powder
    trim: true,
  },
  keyIngredients: {
    type: [String], // Array of ingredients
    default: [],
  },
  productImage: {
    type: String, // URL to the uploaded image
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ["approved", "disapproved"],
    default: "approved",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

productMasterSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const ProductMasterModel = mongoose.models.ProductMaster || mongoose.model("ProductMaster", productMasterSchema);

export default ProductMasterModel;
