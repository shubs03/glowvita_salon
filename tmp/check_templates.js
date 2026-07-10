import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const socialMediaTemplateSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  imageUrl: String,
  jsonData: mongoose.Schema.Types.Mixed,
  vendorId: mongoose.Schema.Types.ObjectId,
  parentTemplateId: mongoose.Schema.Types.ObjectId,
  isActive: Boolean,
  createdAt: Date
});

const SocialMediaTemplate = mongoose.models.SocialMediaTemplate || mongoose.model('SocialMediaTemplate', socialMediaTemplateSchema);

async function main() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI not found in env");
    process.exit(1);
  }
  
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");
  
  const templates = await SocialMediaTemplate.find({}).lean();
  console.log(`Found ${templates.length} templates:`);
  
  for (const t of templates) {
    console.log(`- Title: ${t.title}`);
    console.log(`  ID: ${t._id}`);
    console.log(`  imageUrl: ${t.imageUrl}`);
    console.log(`  isVendorCopy: ${!!t.vendorId}`);
    if (t.jsonData) {
      const bg = typeof t.jsonData === 'string' ? JSON.parse(t.jsonData).backgroundImage : t.jsonData.backgroundImage;
      console.log(`  jsonData.backgroundImage.src: ${bg?.src}`);
    }
    console.log('');
  }
  
  await mongoose.disconnect();
}

main().catch(console.error);
