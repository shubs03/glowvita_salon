import mongoose from 'mongoose';
import dbConnect from '../db.js';

async function fixUserIndexes() {
  await dbConnect();
  
  try {
    const User = mongoose.model('User');
    
    // Drop existing indexes
    await User.collection.dropIndexes();
    
    // Create correct indexes
    await User.collection.createIndex({ emailAddress: 1 }, { unique: true });
    await User.collection.createIndex({ mobileNo: 1 }, { unique: true });
    
    console.log('User indexes fixed successfully');
  } catch (error) {
    console.error('Error fixing user indexes:', error);
  } finally {
    await mongoose.connection.close();
  }
}

fixUserIndexes();