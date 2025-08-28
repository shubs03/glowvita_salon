import { MONGODB_URI } from "../../config/config.js";
import mongoose from "mongoose";

// Cache the connection to prevent multiple connections
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const _db = async () => {
  // If already connected, return the existing connection
  if (cached.conn) {
    console.log("Using existing MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
    };

    try {
      console.log("Creating new MongoDB connection...");
      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log("MongoDB connected successfully");
        return mongoose;
      });
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
};

export default _db;
