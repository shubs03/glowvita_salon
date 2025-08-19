import mongoose from "mongoose";

const geoFenceSchema = new mongoose.Schema({
  fenceId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: false,
    trim: true,
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Feature'],
      required: true,
    },
    properties: {
      type: Object,
      default: {},
    },
    geometry: {
      type: {
        type: String,
        enum: ['Polygon'],
        required: true,
      },
      coordinates: {
        type: [[[Number]]], // Array of array of array of numbers for polygon coordinates
        required: true,
      },
    },
  },
  area: {
    type: Number, // Area in square kilometers (optional, can be calculated)
    required: false,
  },
  description: {
    type: String,
    trim: true,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: false,
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

// Add indexes for better performance
geoFenceSchema.index({ fenceId: 1 });
geoFenceSchema.index({ city: 1 });
geoFenceSchema.index({ createdAt: -1 });
geoFenceSchema.index({ "coordinates.geometry": "2dsphere" }); // Geospatial index for location queries

const GeoFenceModel = 
  mongoose.models.GeoFence || mongoose.model("GeoFence", geoFenceSchema);

export default GeoFenceModel;