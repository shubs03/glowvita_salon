// Script to add sample product data for testing
import mongoose from 'mongoose';
import ProductModel from './packages/lib/src/models/Vendor/Product.model.js';
import VendorModel from './packages/lib/src/models/Vendor/Vendor.model.js';
import _db from './packages/lib/src/db.js';

const sampleProducts = [
  {
    productName: "Radiant Glow Vitamin C Serum",
    description: "A powerful vitamin C serum that brightens and evens skin tone with natural ingredients",
    price: 45.99,
    salePrice: 35.99,
    stock: 50,
    productImage: "https://placehold.co/320x224/f59e0b/ffffff?text=Vitamin+C+Serum",
    status: "approved",
    isActive: true,
    origin: "Vendor"
  },
  {
    productName: "Luxury Anti-Aging Face Cream",
    description: "Rich anti-aging cream with peptides and hyaluronic acid for youthful skin",
    price: 78.50,
    stock: 30,
    productImage: "https://placehold.co/320x224/10b981/ffffff?text=Face+Cream",
    status: "approved",
    isActive: true,
    origin: "Vendor"
  },
  {
    productName: "Matte Lipstick Collection",
    description: "Set of 6 long-lasting matte lipsticks in trending shades",
    price: 32.00,
    stock: 25,
    productImage: "https://placehold.co/320x224/ec4899/ffffff?text=Lipstick+Set",
    status: "approved",
    isActive: true,
    origin: "Vendor"
  },
  {
    productName: "Gentle Cleansing Oil",
    description: "Natural cleansing oil that removes makeup and impurities gently",
    price: 28.75,
    stock: 40,
    productImage: "https://placehold.co/320x224/8b5cf6/ffffff?text=Cleansing+Oil",
    status: "approved",
    isActive: true,
    origin: "Vendor"
  },
  {
    productName: "Nourishing Body Butter Trio",
    description: "Set of 3 rich body butters with natural ingredients for dry skin",
    price: 56.99,
    salePrice: 45.99,
    stock: 20,
    productImage: "https://placehold.co/320x224/059669/ffffff?text=Body+Butter",
    status: "approved",
    isActive: true,
    origin: "Vendor"
  },
  {
    productName: "Professional Eyeshadow Palette",
    description: "Professional eyeshadow palette with 12 blendable shades for stunning looks",
    price: 42.25,
    stock: 35,
    productImage: "https://placehold.co/320x224/dc2626/ffffff?text=Eyeshadow",
    status: "approved",
    isActive: true,
    origin: "Vendor"
  },
  {
    productName: "Hydrating Hair Mask",
    description: "Deep conditioning hair mask for damaged and dry hair",
    price: 24.99,
    stock: 45,
    productImage: "https://placehold.co/320x224/7c3aed/ffffff?text=Hair+Mask",
    status: "approved",
    isActive: true,
    origin: "Vendor"
  },
  {
    productName: "Brightening Face Scrub",
    description: "Gentle exfoliating scrub with natural ingredients for glowing skin",
    price: 19.99,
    stock: 60,
    productImage: "https://placehold.co/320x224/0891b2/ffffff?text=Face+Scrub",
    status: "approved",
    isActive: true,
    origin: "Vendor"
  }
];

const seedProducts = async () => {
  try {
    console.log('Connecting to database...');
    await _db();
    
    // Get approved vendors to assign products to
    const approvedVendors = await VendorModel.find({ status: 'Approved' });
    
    if (approvedVendors.length === 0) {
      console.log('No approved vendors found. Please add some vendors first.');
      process.exit(1);
    }
    
    console.log(`Found ${approvedVendors.length} approved vendors`);
    
    // Clear existing products
    console.log('Clearing existing products...');
    await ProductModel.deleteMany({});
    
    console.log('Adding sample products...');
    const productsWithVendors = sampleProducts.map((product, index) => ({
      ...product,
      vendorId: approvedVendors[index % approvedVendors.length]._id, // Distribute products among vendors
      category: new mongoose.Types.ObjectId(), // For now, we'll use a dummy ObjectId
    }));
    
    const products = await ProductModel.insertMany(productsWithVendors);
    
    console.log(`Successfully added ${products.length} products`);
    console.log('Sample products:', products.map(p => ({ 
      name: p.productName, 
      vendor: approvedVendors.find(v => v._id.toString() === p.vendorId.toString())?.businessName,
      status: p.status 
    })));
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();