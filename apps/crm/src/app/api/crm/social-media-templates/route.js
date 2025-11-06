import { NextResponse } from "next/server";
import _db from '../../../../../../../packages/lib/src/db.js';
import mongoose from 'mongoose';
import { authMiddlewareCrm } from '../../../../middlewareCrm.js';

// Import the social media template model
const { default: SocialMediaTemplateModel, modelName } = await import("../../../../../../../packages/lib/src/models/Marketing/socialMediaTemplate.model.js");

export const dynamic = 'force-dynamic';

// GET all Social Media templates available for CRM (vendor)
export const GET = authMiddlewareCrm(async (req, ctx) => {
  try {
    console.log('Received GET /api/crm/social-media-templates request');
    console.log('Auth context:', ctx);
    console.log('User info:', { userId: req.user?._id, userRole: req.user?.role });
    
    // Connect to database inside the handler (following memory specification)
    const db = await _db();
    console.log('Database connection status:', db ? 'Connected' : 'Not connected');
    
    // Get or create the model
    let SocialMediaTemplate;
    try {
      SocialMediaTemplate = mongoose.model(modelName);
      console.log('Using existing model');
    } catch (e) {
      console.log('Creating new model...');
      SocialMediaTemplate = mongoose.model(modelName, SocialMediaTemplateModel.schema);
    }
    
    console.log('Fetching ALL social media templates (including Draft for development)...');
    
    // Fetch ALL templates that are active (including Draft status for development)
    const templates = await SocialMediaTemplate.find({
      isActive: true
      // Temporarily removed status: 'Published' filter to show Draft templates
    })
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`Found ${templates.length} social media templates (all active and published)`);
    console.log('Templates data:', JSON.stringify(templates.map(t => ({ 
      id: t._id, 
      title: t.title, 
      category: t.category, 
      availableFor: t.availableFor 
    })), null, 2));
    
    // Transform templates to ensure they have the required fields
    const formattedTemplates = templates.map(template => ({
      _id: template._id,
      id: template._id,
      title: template.title,
      category: template.category,
      description: template.description,
      imageUrl: template.imageUrl,
      jsonData: template.jsonData, // Include JSON data for canvas editing
      availableFor: template.availableFor,
      status: template.status,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedTemplates,
      total: formattedTemplates.length
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
    
  } catch (error) {
    console.error('Error in GET /api/crm/social-media-templates:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error fetching social media templates', 
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

// POST - Create a customized version of a template
export const POST = authMiddlewareCrm(async (req, ctx) => {
  try {
    console.log('Received POST /api/crm/social-media-templates request');
    
    // Connect to database
    await _db();
    
    // Get or create the model
    let SocialMediaTemplate;
    try {
      SocialMediaTemplate = mongoose.model(modelName);
    } catch (e) {
      SocialMediaTemplate = mongoose.model(modelName, SocialMediaTemplateModel.schema);
    }
    
    const body = await req.json();
    const { templateId, jsonData, title, customizations } = body;
    
    if (!templateId || !jsonData) {
      return NextResponse.json(
        { success: false, message: 'Template ID and JSON data are required' },
        { status: 400 }
      );
    }
    
    // Find the original template
    const originalTemplate = await SocialMediaTemplate.findById(templateId);
    if (!originalTemplate) {
      return NextResponse.json(
        { success: false, message: 'Original template not found' },
        { status: 404 }
      );
    }
    
    // Create a customized version
    const customizedTemplate = {
      title: title || `${originalTemplate.title} - Customized`,
      category: originalTemplate.category,
      description: `Customized version of ${originalTemplate.title}`,
      availableFor: originalTemplate.availableFor,
      status: 'Draft',
      isActive: true,
      jsonData: jsonData,
      imageUrl: originalTemplate.imageUrl, // Keep original background
      createdBy: req.user._id,
      updatedBy: req.user._id,
      parentTemplateId: templateId // Reference to original template
    };
    
    const newCustomizedTemplate = await SocialMediaTemplate.create(customizedTemplate);
    
    return NextResponse.json({
      success: true,
      message: 'Customized template saved successfully',
      data: newCustomizedTemplate
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error in POST /api/crm/social-media-templates:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error saving customized template', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    );
  }
}, ['vendor', 'supplier']);