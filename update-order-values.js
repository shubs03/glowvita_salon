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

// Update orders with missing fields
const updateOrders = async () => {
  try {
    // Find orders that don't have the new fields or have null/undefined values
    const orders = await ClientOrder.find({
      $or: [
        { shippingAmount: { $exists: false } },
        { shippingAmount: null },
        { gstAmount: { $exists: false } },
        { gstAmount: null },
        { platformFeeAmount: { $exists: false } },
        { platformFeeAmount: null }
      ]
    });

    console.log(`Found ${orders.length} orders to update`);

    for (const order of orders) {
      // Calculate values based on existing data
      const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Default values (these should match your business logic)
      const shippingAmount = order.shippingAmount || 0;
      const gstAmount = order.gstAmount || (subtotal * 0.18); // 18% GST
      const platformFeeAmount = order.platformFeeAmount || (subtotal * 0.10); // 10% platform fee
      
      // Update the order
      await ClientOrder.findByIdAndUpdate(order._id, {
        $set: {
          shippingAmount,
          gstAmount,
          platformFeeAmount
        }
      });

      console.log(`Updated order ${order._id}`);
    }

    console.log('All orders updated successfully');
  } catch (error) {
    console.error('Error updating orders:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await updateOrders();
};

run();