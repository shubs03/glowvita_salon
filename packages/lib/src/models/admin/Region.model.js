import mongoose from "mongoose";

const regionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  description: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // GeoJSON Polygon for geospatial assignment
  geometry: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]], // Array of arrays of arrays of numbers
    }
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

// Create 2dsphere index for geospatial queries
regionSchema.index({ geometry: '2dsphere' });

regionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const RegionModel = mongoose.models.Region || mongoose.model("Region", regionSchema);

export default RegionModel;
