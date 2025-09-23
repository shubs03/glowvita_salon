import { NextResponse } from "next/server";
import _db from "@repo/lib/db";
import mongoose from 'mongoose';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await _db();
    
    // Test if we can list collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Check if our collection exists
    const hasSocialMediaTemplates = collectionNames.includes('socialmediatemplates');
    
    // Try to get a count of documents
    let docCount = 0;
    if (hasSocialMediaTemplates) {
      const SocialMediaTemplate = mongoose.model('socialmediatemplate');
      docCount = await SocialMediaTemplate.countDocuments({}).exec();
    }
    
    return NextResponse.json({
      success: true,
      connection: {
        host: mongoose.connection.host,
        dbName: mongoose.connection.name,
        readyState: mongoose.connection.readyState,
        collections: collectionNames,
        hasSocialMediaTemplates,
        docCount
      }
    });
    
  } catch (error) {
    console.error('Database connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      connection: {
        readyState: mongoose.connection?.readyState,
        host: mongoose.connection?.host,
        dbName: mongoose.connection?.name,
        error: error.toString()
      }
    }, { status: 500 });
  }
}
