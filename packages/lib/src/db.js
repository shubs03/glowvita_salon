import { MONGODB_URI } from "../../config/config.js";
import mongoose from "mongoose";

console.log("MONGODB_URI from config:", MONGODB_URI);

// Cache the connection to prevent multiple connections
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const _db = async () => {
  // Don't connect during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log("Skipping MongoDB connection during build phase");
    return null;
  }

  // If already connected, return the existing connection
  if (cached.conn) {
    console.log("Using existing MongoDB connection");
    return cached.conn;
  }

  // Check if MONGODB_URI is defined
  if (!MONGODB_URI) {
    console.warn("MONGODB_URI is not defined, skipping database connection");
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
    };

    try {
      console.log("Creating new MongoDB connection...");
      console.log("Using MONGODB_URI:", MONGODB_URI);
      
      if (!MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined. Check your environment variables.");
      }
      
      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log("MongoDB connected successfully");
        return mongoose;
      }).catch((error) => {
        console.error("MongoDB connection error:", error);
        throw error;
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