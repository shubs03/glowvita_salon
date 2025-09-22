import mongoose from 'mongoose';
import dbConnect from './db.js';
import User from './models/user/User.model.js';

async function debugUsers() {
  await dbConnect();
  
  try {
    const users = await User.find({}, 'firstName lastName emailAddress mobileNo');
    console.log('Current users in database:');
    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.emailAddress}, ${user.mobileNo})`);
    });
    console.log(`Total users: ${users.length}`);
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    await mongoose.connection.close();
  }
}

debugUsers();