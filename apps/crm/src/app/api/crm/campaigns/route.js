import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import _db from '../../../../../../../packages/lib/src/db.js';
import Campaign from '../../../../../../../packages/lib/src/models/Marketing/Campaign.model.js';
import { authMiddlewareCrm } from '../../../../middlewareCrm.js';

// GET: Fetch all campaigns for CRM
export const GET = authMiddlewareCrm(async (req, ctx) => {
  try {
    console.log('Received GET /api/crm/campaigns request');
    console.log('Auth context:', ctx);
    
    // Connect to database inside the handler (following memory specification)
    const db = await _db();
    console.log('Database connection status:', db ? 'Connected' : 'Not connected');
    
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId') || req.user?._id;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    
    console.log('Fetching campaigns with filters:', { vendorId, status, page, limit });
    
    // Build query filters
    const query = {};
    if (vendorId) {
      query.vendorId = vendorId;
    } else if (req.user?._id) {
      query.vendorId = req.user._id;
    }
    if (status) {
      query.status = status;
    }
    
    // Get total count for pagination
    const total = await Campaign.countDocuments(query);
    
    // Fetch campaigns with pagination
    const campaigns = await Campaign.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-__v');
    
    console.log(`Found ${campaigns.length} campaigns in database`);
    console.log('Campaigns data:', JSON.stringify(campaigns, null, 2));
    
    return NextResponse.json({
      success: true,
      data: campaigns,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
    
  } catch (error) {
    console.error('Error in GET /api/crm/campaigns:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error fetching campaigns', 
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

// POST: Create a new campaign
export const POST = authMiddlewareCrm(async (req, ctx) => {
  try {
    console.log('Received POST /api/crm/campaigns request');
    console.log('Auth context:', ctx);
    
    // Connect to database inside the handler (following memory specification)
    const db = await _db();
    console.log('Database connection status:', db ? 'Connected' : 'Not connected');
    
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body.name || !body.content || !body.type || body.type.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields: name, content, and type are required' 
        },
        { status: 400 }
      );
    }
    
    // Validate authenticated user
    if (!req.user?._id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User authentication required' 
        },
        { status: 401 }
      );
    }
    
    // Validate and convert templateId to ObjectId if provided
    let templateId = null;
    if (body.templateId && body.templateId !== 'null' && body.templateId !== '') {
      if (mongoose.Types.ObjectId.isValid(body.templateId)) {
        templateId = new mongoose.Types.ObjectId(body.templateId);
      } else {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid template ID format' 
          },
          { status: 400 }
        );
      }
    }
    
    // Create new campaign object
    const campaignData = {
      name: body.name,
      type: Array.isArray(body.type) ? body.type : [body.type],
      templateId: templateId,
      content: body.content,
      status: body.status || 'Draft',
      vendorId: body.vendorId || req.user?._id,
      createdBy: req.user?._id,
      targetAudience: body.targetAudience || 'All Customers',
      scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : new Date(),
      budget: body.budget || 0,
      metrics: {
        messagesSent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0
      }
    };
    
    console.log('Creating campaign with data:', campaignData);
    console.log('User info:', { userId: req.user?._id, userRole: req.user?.role });
    
    // Validate that user ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid user ID format' 
        },
        { status: 400 }
      );
    }
    
    // Save to database
    const campaign = await Campaign.create(campaignData);
    
    console.log('Campaign created successfully:', campaign);
    
    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'Campaign created successfully'
    }, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Error in POST /api/crm/campaigns:', error);
    
    // Handle specific MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { 
          success: false,
          message: 'Validation error', 
          errors: validationErrors,
          error: process.env.NODE_ENV === 'development' ? error.message : undefined 
        },
        { status: 400 }
      );
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          success: false,
          message: 'A campaign with this name already exists',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Error creating campaign', 
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

// PUT: Update an existing campaign
export const PUT = authMiddlewareCrm(async (req, ctx) => {
  try {
    console.log('Received PUT /api/crm/campaigns request');
    console.log('Auth context:', ctx);
    
    // Connect to database inside the handler (following memory specification)
    const db = await _db();
    console.log('Database connection status:', db ? 'Connected' : 'Not connected');
    
    const body = await req.json();
    const { _id, ...updateData } = body;
    
    if (!_id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Campaign ID is required for update' 
        },
        { status: 400 }
      );
    }
    
    console.log('Updating campaign with ID:', _id);
    console.log('Update data:', updateData);
    
    // Update campaign in database
    const updatedCampaign = await Campaign.findByIdAndUpdate(
      _id, 
      { ...updateData, updatedAt: new Date() }, 
      { new: true, runValidators: true }
    );
    
    if (!updatedCampaign) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Campaign not found' 
        },
        { status: 404 }
      );
    }
    
    console.log('Campaign updated successfully:', updatedCampaign);
    
    return NextResponse.json({
      success: true,
      data: updatedCampaign,
      message: 'Campaign updated successfully'
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Error in PUT /api/crm/campaigns:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error updating campaign', 
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

// DELETE: Delete a campaign
export const DELETE = authMiddlewareCrm(async (req, ctx) => {
  try {
    console.log('Received DELETE /api/crm/campaigns request');
    console.log('Auth context:', ctx);
    
    // Connect to database inside the handler (following memory specification)
    const db = await _db();
    console.log('Database connection status:', db ? 'Connected' : 'Not connected');
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Campaign ID is required for deletion' 
        },
        { status: 400 }
      );
    }
    
    console.log('Deleting campaign with ID:', id);
    
    // Delete campaign from database
    const deletedCampaign = await Campaign.findByIdAndDelete(id);
    
    if (!deletedCampaign) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Campaign not found' 
        },
        { status: 404 }
      );
    }
    
    console.log('Campaign deleted successfully:', deletedCampaign._id);
    
    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Error in DELETE /api/crm/campaigns:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error deleting campaign', 
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