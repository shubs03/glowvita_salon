import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in env");
  process.exit(1);
}

const templateSchema = new mongoose.Schema({
  title: String,
  category: String,
  jsonData: mongoose.Schema.Types.Mixed,
  imageUrl: String
}, { strict: false });

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.");

    const Template = mongoose.model('SocialMediaTemplate', templateSchema, 'socialmediatemplates');
    
    const count = await Template.countDocuments();
    console.log("Total templates in database:", count);

    const templates = await Template.find({}).limit(5).lean();
    for (const t of templates) {
      console.log(`\n--- Template: ${t.title || 'Untitled'} ---`);
      console.log("ID:", t._id);
      console.log("category:", t.category);
      console.log("imageUrl:", t.imageUrl);
      console.log("jsonData type:", typeof t.jsonData);
      if (t.jsonData) {
        const isString = typeof t.jsonData === 'string';
        console.log("Is jsonData string?", isString);
        if (isString) {
          console.log("jsonData starts with:", t.jsonData.substring(0, 100));
        } else {
          console.log("jsonData keys:", Object.keys(t.jsonData));
          console.log("objects length:", t.jsonData.objects?.length);
        }
      } else {
        console.log("jsonData is null or undefined");
      }
    }
  } catch (error) {
    console.error("Error running script:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

run();
