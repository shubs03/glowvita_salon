import mongoose from "mongoose";

const productCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
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

productCategorySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const ProductCategoryModel = mongoose.models.ProductCategory || mongoose.model("ProductCategory", productCategorySchema);

export default ProductCategoryModel;