const dotenv = require('dotenv');
dotenv.config();

const { MONGODB_URI } = require('./packages/config/config.js');
const mongoose = require('mongoose');

async function testDB() {
  console.log('Testing database connection...');
  console.log('MONGODB_URI:', MONGODB_URI);

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected successfully!');
    
    // Try to access a collection
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    await mongoose.connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

testDB();