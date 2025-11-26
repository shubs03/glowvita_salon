import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ClientOrder from './packages/lib/src/models/user/ClientOrder.model.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Debug orders
const debugOrders = async () => {
  try {
    // Find a few recent orders
    const orders = await ClientOrder.find({}).sort({ createdAt: -1 }).limit(5);
    
    console.log('Recent Orders:');
    orders.forEach((order, index) => {
      console.log(`\n--- Order ${index + 1} ---`);
      console.log('Order ID:', order._id);
      console.log('Created At:', order.createdAt);
      console.log('Total Amount:', order.totalAmount);
      console.log('Shipping Amount:', order.shippingAmount);
      console.log('GST Amount:', order.gstAmount);
      console.log('Platform Fee Amount:', order.platformFeeAmount);
      console.log('Tax Amount:', order.taxAmount);
      
      // Calculate subtotal from items
      const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      console.log('Calculated Subtotal:', subtotal);
      
      // Check if values add up
      const calculatedTotal = subtotal + (order.shippingAmount || 0) + (order.taxAmount || 0);
      console.log('Calculated Total:', calculatedTotal);
      console.log('Matches Total Amount:', calculatedTotal === order.totalAmount);
      
      console.log('Items:');
      order.items.forEach((item, itemIndex) => {
        console.log(`  ${itemIndex + 1}. ${item.name} - Qty: ${item.quantity}, Price: ${item.price}, Total: ${item.price * item.quantity}`);
      });
    });
  } catch (error) {
    console.error('Error debugging orders:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await debugOrders();
};

run();