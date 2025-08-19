
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
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

categorySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const CategoryModel = mongoose.models.Category || mongoose.model("Category", categorySchema);

export default CategoryModel;
