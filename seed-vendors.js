// Script to add sample vendor data for testing
import mongoose from 'mongoose';
import VendorModel from './packages/lib/src/models/Vendor/Vendor.model.js';
import _db from './packages/lib/src/db.js';

const sampleVendors = [
  {
    firstName: "Priya",
    lastName: "Sharma",
    businessName: "Luxe Hair Studio",
    email: "priya@luxehair.com",
    phone: "9876543210",
    state: "Maharashtra",
    city: "Mumbai",
    pincode: "400001",
    location: {
      lat: 19.0760,
      lng: 72.8777
    },
    address: "123 Marine Drive, Mumbai",
    category: "women",
    subCategories: ["shop"],
    status: "Approved",
    password: "tempPassword123",
    description: "Upscale salon specializing in color correction and luxury treatments for women",
    profileImage: null
  },
  {
    firstName: "Rajesh",
    lastName: "Kumar",
    businessName: "Modern Cuts Barbershop",
    email: "rajesh@moderncuts.com",
    phone: "9876543211",
    state: "Karnataka",
    city: "Bangalore",
    pincode: "560001",
    location: {
      lat: 12.9716,
      lng: 77.5946
    },
    address: "456 MG Road, Bangalore",
    category: "men",
    subCategories: ["shop"],
    status: "Approved",
    password: "tempPassword123",
    description: "Traditional & modern cuts with precision styling and beard grooming",
    profileImage: null
  },
  {
    firstName: "Anjali",
    lastName: "Patel",
    businessName: "Bella Vista Spa",
    email: "anjali@bellavista.com",
    phone: "9876543212",
    state: "Gujarat",
    city: "Ahmedabad",
    pincode: "380001",
    location: {
      lat: 23.0225,
      lng: 72.5714
    },
    address: "789 SG Highway, Ahmedabad",
    category: "unisex",
    subCategories: ["shop", "shop-at-home"],
    status: "Approved",
    password: "tempPassword123",
    description: "Award-winning spa with 15 treatment rooms and wellness packages",
    profileImage: null
  },
  {
    firstName: "Meera",
    lastName: "Singh",
    businessName: "Glamour Nails & Beauty",
    email: "meera@glamournails.com",
    phone: "9876543213",
    state: "Delhi",
    city: "New Delhi",
    pincode: "110001",
    location: {
      lat: 28.6139,
      lng: 77.2090
    },
    address: "101 Connaught Place, New Delhi",
    category: "women",
    subCategories: ["shop"],
    status: "Approved",
    password: "tempPassword123",
    description: "Trendy nail salon featuring custom designs and gel treatments",
    profileImage: null
  },
  {
    firstName: "Arjun",
    lastName: "Reddy",
    businessName: "Serenity Wellness Center",
    email: "arjun@serenity.com",
    phone: "9876543214",
    state: "Telangana",
    city: "Hyderabad",
    pincode: "500001",
    location: {
      lat: 17.3850,
      lng: 78.4867
    },
    address: "202 Banjara Hills, Hyderabad",
    category: "unisex",
    subCategories: ["shop", "onsite"],
    status: "Approved",
    password: "tempPassword123",
    description: "Holistic wellness center offering massage, yoga, and beauty services",
    profileImage: null
  },
  {
    firstName: "Kavya",
    lastName: "Nair",
    businessName: "Radiant Skin Clinic",
    email: "kavya@radiantskin.com",
    phone: "9876543215",
    state: "Kerala",
    city: "Kochi",
    pincode: "682001",
    location: {
      lat: 9.9312,
      lng: 76.2673
    },
    address: "303 Marine Drive, Kochi",
    category: "women",
    subCategories: ["shop"],
    status: "Approved",
    password: "tempPassword123",
    description: "Advanced skincare clinic with dermatologist-approved treatments",
    profileImage: null
  }
];

const seedVendors = async () => {
  try {
    console.log('Connecting to database...');
    await _db();
    
    console.log('Clearing existing vendors...');
    await VendorModel.deleteMany({});
    
    console.log('Adding sample vendors...');
    const vendors = await VendorModel.insertMany(sampleVendors);
    
    console.log(`Successfully added ${vendors.length} vendors`);
    console.log('Sample vendors:', vendors.map(v => ({ businessName: v.businessName, status: v.status })));
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding vendors:', error);
    process.exit(1);
  }
};

seedVendors();