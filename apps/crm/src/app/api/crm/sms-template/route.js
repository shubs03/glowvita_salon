import { NextResponse } from "next/server";
import _db from '../../../../../../../packages/lib/src/db.js';
import SmsTemplate from '../../../../../../../packages/lib/src/models/Marketing/SmsTemplate.model.js';
import { authMiddlewareCrm } from '../../../../middlewareCrm.js';

// GET all SMS templates for CRM
export const GET = authMiddlewareCrm(async (req, ctx) => {
  try {


    // Connect to database inside the handler (following memory specification)
    const db = await _db();

    const templates = await SmsTemplate.find({})
      .sort({ isPopular: -1, name: 1 })
      .select('-__v');



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
    console.error('Error in GET /api/crm/sms-template:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching SMS templates',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}, ['vendor', 'supplier']);
