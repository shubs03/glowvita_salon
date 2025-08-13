import { MONGODB_URI } from "../../config/config.js";
import mongoose from "mongoose";

const _db = async () => {

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default _db;
