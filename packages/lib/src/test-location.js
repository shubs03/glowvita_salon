import mongoose from 'mongoose';
import dbConnect from './db.js';
import User from './models/user/User.model.js';

async function testLocation() {
  await dbConnect();
  
  try {
    // Find a user with location data
    const user = await User.findOne({ location: { $exists: true, $ne: null } });
    if (user) {
      console.log('User with location data:');
      console.log(`Name: ${user.firstName} ${user.lastName}`);
      console.log(`Email: ${user.emailAddress}`);
      console.log(`Location:`, user.location);
    } else {
      console.log('No users with location data found');
    }
    
    // Count total users
    const count = await User.countDocuments();
    console.log(`Total users in database: ${count}`);
  } catch (error) {
    console.error('Error testing location data:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testLocation();