import { NextResponse } from "next/server";
import _db from '../../../../../../../packages/lib/src/db.js';
import SmsTemplate from '../../../../../../../packages/lib/src/models/Marketing/SmsTemplate.model.js';

// GET all SMS templates for CRM - TEST ENDPOINT (NO AUTH)
export async function GET(req) {
  try {
    console.log('Received GET /api/crm/test-sms-templates request');
    
    // Connect to database
    await _db();
    console.log('Database connected');
    
    console.log('Fetching SMS templates (Test Mode)...');
    const templates = await SmsTemplate.find({})
      .sort({ isPopular: -1, name: 1 })
      .select('-__v');
    
    console.log(`Found ${templates.length} templates in database (Test Mode)`);
    
    // Transform templates to ensure they have the required fields
    const formattedTemplates = templates.map(template => ({
      _id: template._id,
      name: template.name,
      content: template.content,
      type: template.type,
      status: template.status,
      price: template.price || 0,
      description: template.description || '',
      isPopular: template.isPopular || false,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    }));
      
    return NextResponse.json({
      success: true,
      data: formattedTemplates
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error in GET /api/crm/test-sms-templates:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error fetching SMS templates (Test Mode)', 
        error: error.message
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
