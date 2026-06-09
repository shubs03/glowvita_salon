import { NextResponse } from "next/server";
import _db from "@repo/lib/db";
import mongoose from 'mongoose';
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";
import { uploadBase64, deleteFile } from "@repo/lib/utils/upload";

// Import the social media template model
const { default: SocialMediaTemplateModel, modelName } = await import("@repo/lib/models/Marketing/socialMediaTemplate.model");

export const dynamic = 'force-dynamic'; // Ensure dynamic route handling

// GET all Social Media templates
export const GET = authMiddlewareAdmin(async (req) => {
  console.log('GET /api/admin/social-media-templates - Starting request');

  try {
    console.log('Connecting to database...');
    await _db();

    console.log('Getting model...');
    let TemplateModel;
    try {
      // Try to get existing model first
      TemplateModel = mongoose.models[modelName] || mongoose.model(modelName, SocialMediaTemplateModel.schema);
      console.log('Using model:', modelName);
    } catch (e) {
      console.error('Error getting/creating model:', e);
      throw e;
    }

    console.log('Ensuring indexes...');
    try {
      await TemplateModel.ensureIndexes();
    } catch (e) {
      console.warn('Warning: Could not ensure indexes:', e.message);
    }

    console.log('Fetching social media templates (admin originals only)...');
    
    // Self-healing migration for old customized templates
    try {
      const unlinkedCopies = await TemplateModel.find({
        parentTemplateId: null,
        title: { $regex: /\s*-\s*(Edited|Customized|My Design)$/i }
      });

      if (unlinkedCopies.length > 0) {
        console.log(`[Migration] Found ${unlinkedCopies.length} unlinked vendor copies in Admin GET. Healing...`);
        for (const copy of unlinkedCopies) {
          const copyTitleClean = copy.title.replace(/\s*-\s*(Edited|Customized|My Design)$/i, '').trim().toLowerCase();
          // Find original template with the clean name
          const originalMatch = await TemplateModel.findOne({
            parentTemplateId: null,
            title: { $regex: new RegExp(`^${copyTitleClean}$`, 'i') },
            _id: { $ne: copy._id }
          });

          if (originalMatch) {
            console.log(`[Migration] Linking ${copy.title} (ID: ${copy._id}) to original (ID: ${originalMatch._id})`);
            await TemplateModel.updateOne(
              { _id: copy._id },
              {
                $set: {
                  parentTemplateId: originalMatch._id,
                  vendorId: copy.createdBy
                }
              }
            );
          }
        }
      }
    } catch (migrationErr) {
      console.error('[Migration] Failed running template self-healing in Admin:', migrationErr);
    }
    const templates = await TemplateModel.find({ parentTemplateId: null })
      .select('-__v -createdAt -updatedAt')
      .sort({ createdAt: -1 })
      .lean()
      .maxTimeMS(10000) // 10 second timeout
      .exec()
      .then(docs => {
        // Ensure all documents have the availableFor field with a default value
        return docs.map(doc => ({
          ...doc,
          availableFor: doc.availableFor || 'admin' // Add default value if missing
        }));
      });

    console.log(`Successfully retrieved ${templates.length} templates`);

    return NextResponse.json({
      success: true,
      data: templates,
      count: templates.length
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
      }
    });

  } catch (error) {
    // Enhanced error logging
    const errorDetails = {
      message: error.message,
      name: error.name,
      ...(error.code && { code: error.code }),
      ...(error.keyPattern && { keyPattern: error.keyPattern }),
      connectionState: mongoose.connection?.readyState,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      })
    };

    console.error("Error in GET /api/admin/social-media-templates:", errorDetails);

    // Determine appropriate status code
    let statusCode = 500;
    let errorMessage = 'Failed to fetch social media templates';

    if (error.name === 'MongoServerError') {
      statusCode = 503; // Service Unavailable
      errorMessage = 'Database service unavailable. Please try again later.';
    } else if (error.name === 'ValidationError') {
      statusCode = 400; // Bad Request
      errorMessage = 'Validation error';
    } else if (error.name === 'MongooseServerSelectionError') {
      statusCode = 503; // Service Unavailable
      errorMessage = 'Unable to connect to database. Please check your connection.';
    }

    return NextResponse.json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      ...(process.env.NODE_ENV === 'development' && {
        details: errorDetails
      })
    }, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      }
    });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "marketing:view");

// POST a new Social Media template
export const POST = authMiddlewareAdmin(async (req) => {
  console.log('POST /api/admin/social-media-templates - Starting request');
  try {
    await _db();
    const SocialMediaTemplate = mongoose.models[modelName] || mongoose.model(modelName, SocialMediaTemplateModel.schema);

    let body;
    const contentType = req.headers.get('content-type') || '';
    console.log('Content-Type:', contentType);

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      body = {};
      for (const [key, value] of formData.entries()) {
        if (!(value instanceof File)) {
          body[key] = value;
        }
      }
      
      const previewImage = formData.get('previewImage');
      const backgroundImage = formData.get('backgroundImage');

      if (previewImage && typeof previewImage === 'string') {
        body.previewImage = previewImage;
      }
      if (backgroundImage && backgroundImage instanceof File) {
        const arrayBuffer = await backgroundImage.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        body.backgroundImage = `data:${backgroundImage.type};base64,${buffer.toString('base64')}`;
      }
    } else {
      body = await req.json();
    }

    const user = req.user;
    if (!user || !user._id) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const { title, category, availableFor = 'admin', description = '', image, status = 'Draft' } = body;

    if (!title || !category || !availableFor) {
      const missingFields = ['title', 'category', 'availableFor'].filter(f => !body[f]);
      return NextResponse.json({ success: false, message: `Missing required fields: ${missingFields.join(', ')}` }, { status: 400 });
    }

    // Handle background image upload
    let backgroundUrl = '';
    if (body.backgroundImage && body.backgroundImage.startsWith('data:image/')) {
      const fileName = `social-media-template-bg-${Date.now()}`;
      backgroundUrl = await uploadBase64(body.backgroundImage, fileName);
    }

    // Handle preview image upload
    let imageUrl = '';
    if (body.previewImage && body.previewImage.startsWith('data:image/')) {
      const fileName = `social-media-template-preview-${Date.now()}`;
      imageUrl = await uploadBase64(body.previewImage, fileName);
    } else {
      imageUrl = backgroundUrl;
    }

    if (!imageUrl && !backgroundUrl) {
      // It's allowed to have no image, but if they tried we should probably handle it.
    }

    let parsedJsonData = null;
    if (body.jsonData) {
      try {
        parsedJsonData = typeof body.jsonData === 'string' ? JSON.parse(body.jsonData) : body.jsonData;
      } catch (e) {
        console.error("Failed to parse jsonData", e);
      }
    }

    const templateData = {
      title: title.toString().trim(),
      category: category.toString().trim(),
      availableFor: availableFor.toString().trim(),
      description: description ? description.toString().trim() : '',
      status: status || 'Draft',
      createdBy: user._id,
      updatedBy: user._id,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      imageUrl: imageUrl, // Save the image url for preview cards
      jsonData: parsedJsonData || {
        "version": "5.3.0",
        "objects": [
          {
            "type": "textbox",
            "version": "5.3.0",
            "originX": "center",
            "originY": "center",
            "left": 450,
            "top": 200,
            "width": 600,
            "height": 100,
            "fill": "#6B240C",
            "text": "Paarsh Infotech Family",
            "fontSize": 70,
            "fontWeight": "bold",
            "fontFamily": "Times New Roman",
            "textAlign": "center",
            "selectable": true,
            "editable": true
          },
          {
            "type": "textbox",
            "version": "5.3.0",
            "originX": "center",
            "originY": "center",
            "left": 450,
            "top": 320,
            "width": 700,
            "height": 120,
            "fill": "#000000",
            "text": "A day of prayers, a moment of gratitude\nPaarsh Infotech family invites you for\nSatyanarayan Katha",
            "fontSize": 35,
            "fontWeight": "normal",
            "fontFamily": "Arial",
            "textAlign": "center",
            "selectable": true,
            "editable": true
          },
          {
            "type": "textbox",
            "version": "5.3.0",
            "originX": "center",
            "originY": "center",
            "left": 450,
            "top": 550,
            "width": 400,
            "height": 50,
            "fill": "#A45C40",
            "text": "29-08-2025",
            "fontSize": 40,
            "fontWeight": "bold",
            "fontFamily": "Arial",
            "textAlign": "center",
            "selectable": true,
            "editable": true
          },
          {
            "type": "textbox",
            "version": "5.3.0",
            "originX": "center",
            "originY": "center",
            "left": 450,
            "top": 620,
            "width": 600,
            "height": 80,
            "fill": "#000000",
            "text": "Timing For Pooja at 4:00 PM\nAnd for Prasad 5:30 PM",
            "fontSize": 30,
            "fontWeight": "normal",
            "fontFamily": "Arial",
            "textAlign": "center",
            "selectable": true,
            "editable": true
          },
          {
            "type": "textbox",
            "version": "5.3.0",
            "originX": "center",
            "originY": "center",
            "left": 450,
            "top": 720,
            "width": 800,
            "height": 80,
            "fill": "#000000",
            "text": "02, Bhakti Apartment, near Hotel Rasoi, Suchita Nagar,\nMumbai Naka, Nashik, Maharashtra 422001",
            "fontSize": 25,
            "fontWeight": "normal",
            "fontFamily": "Arial",
            "textAlign": "center",
            "selectable": true,
            "editable": true
          }
        ],
        "backgroundImage": {
          "type": "image",
          "src": imageUrl // Correctly format for Fabric.js
        }
      }
    };

    if (parsedJsonData && backgroundUrl) {
      if (templateData.jsonData.backgroundImage) {
        templateData.jsonData.backgroundImage.src = backgroundUrl;
      } else {
        templateData.jsonData.backgroundImage = { type: 'image', src: backgroundUrl };
      }
    }

    const newTemplate = await SocialMediaTemplate.create(templateData);

    return NextResponse.json({ success: true, message: "Social Media template created successfully", data: newTemplate }, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/admin/social-media-templates:", {
      message: error.message,
      name: error.name,
      ...(error.code && { code: error.code }),
      ...(error.keyPattern && { keyPattern: error.keyPattern }),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return NextResponse.json({ success: false, message: "Validation error", errors }, { status: 400 });
    }

    if (error.name === 'MongoServerError' && error.code === 11000) {
      return NextResponse.json({ success: false, message: "Duplicate key error. A template with this title may already exist." }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: "Failed to create social media template", error: error.message }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "marketing:edit");

// PUT a new Social Media template
export const PUT = authMiddlewareAdmin(async (req, { params }) => {
  try {
    // Connect to database
    await _db();

    // Get or create the model using the already imported model
    const SocialMediaTemplate = mongoose.models[modelName] || mongoose.model(modelName, SocialMediaTemplateModel.schema);

    // Check content type to handle both JSON and FormData
    const contentType = req.headers.get('content-type') || '';
    let body;

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData
      const formData = await req.formData();

      body = {};
      for (const [key, value] of formData.entries()) {
        if (!(value instanceof File)) {
          body[key] = value;
        }
      }

      const previewImage = formData.get('previewImage');
      const backgroundImage = formData.get('backgroundImage');

      if (previewImage && typeof previewImage === 'string') {
        body.previewImage = previewImage;
      }

      if (backgroundImage && backgroundImage instanceof File) {
        // New file uploaded — convert to base64
        const arrayBuffer = await backgroundImage.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        body.backgroundImage = `data:${backgroundImage.type};base64,${buffer.toString('base64')}`;
      }
    } else {
      // Handle JSON
      try {
        body = await req.json();
      } catch (err) {
        console.error('Error parsing JSON:', err);
        return NextResponse.json(
          { success: false, message: 'Invalid request body' },
          { status: 400 }
        );
      }
    }

    // Get the template ID from URL params
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Get the authenticated user from the request
    const user = req.user;

    // Find the existing template
    const existingTemplate = await SocialMediaTemplate.findById(id);

    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, message: 'Template not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    const { title, category, availableFor = 'admin', description = '', image, status = 'Draft' } = body;

    if (!title || !category || !availableFor) {
      const missingFields = [];
      if (!title) missingFields.push('title');
      if (!category) missingFields.push('category');
      if (!availableFor) missingFields.push('availableFor');

      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
          missingFields
        },
        { status: 400 }
      );
    }

    // Check for duplicate title (case insensitive, excluding current template)
    const escapedTitle = title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const duplicateTemplate = await SocialMediaTemplate.findOne({
      _id: { $ne: id },
      title: { $regex: new RegExp(`^${escapedTitle}$`, 'i') }
    });

    if (duplicateTemplate) {
      return NextResponse.json(
        {
          success: false,
          message: 'A template with this title already exists'
        },
        { status: 400 }
      );
    }

    // Parse updated jsonData if provided
    let parsedJsonData = existingTemplate.jsonData;
    if (body.jsonData) {
      try {
        parsedJsonData = typeof body.jsonData === 'string' ? JSON.parse(body.jsonData) : body.jsonData;
      } catch (e) {
        console.error("Failed to parse jsonData", e);
      }
    }

    // Update template data
    const safeDescription = (description || '').toString().trim();
    const safeStatus = (status || existingTemplate.status || 'Draft').toString();
    const updateData = {
      title: title.trim(),
      category: category.trim(),
      availableFor: availableFor.trim(),
      description: safeDescription,
      status: safeStatus,
      updatedBy: user._id,
      isActive: body.isActive !== undefined ? body.isActive : existingTemplate.isActive,
      jsonData: parsedJsonData
    };

    // Handle background image upload if provided
    if (body.backgroundImage !== undefined) {
      if (body.backgroundImage && typeof body.backgroundImage === 'string' && body.backgroundImage.trim() !== '') {
        if (body.backgroundImage.startsWith('data:image/')) {
          const fileName = `social-media-template-bg-${Date.now()}`;
          const bgUrl = await uploadBase64(body.backgroundImage, fileName);

          if (bgUrl && updateData.jsonData) {
            if (updateData.jsonData.backgroundImage) {
              updateData.jsonData.backgroundImage.src = bgUrl;
            } else {
              updateData.jsonData.backgroundImage = { type: "image", src: bgUrl };
            }
          }
        }
      } else if (body.backgroundImage === '' || body.backgroundImage === null) {
        // Background image explicitly cleared
        if (updateData.jsonData) {
           delete updateData.jsonData.backgroundImage;
           delete updateData.jsonData.background;
        }
      }
    }

    // Handle preview image upload if provided
    if (body.previewImage !== undefined) {
      if (body.previewImage && typeof body.previewImage === 'string' && body.previewImage.trim() !== '') {
        if (body.previewImage.startsWith('data:image/')) {
          const fileName = `social-media-template-preview-${Date.now()}`;
          const previewUrl = await uploadBase64(body.previewImage, fileName);

          if (previewUrl) {
            if (existingTemplate.imageUrl && existingTemplate.imageUrl !== previewUrl) {
              await deleteFile(existingTemplate.imageUrl);
            }
            updateData.imageUrl = previewUrl;
          }
        }
      } else if (body.previewImage === '' || body.previewImage === null) {
        // Preview explicitly cleared
        updateData.imageUrl = '';
        if (existingTemplate.imageUrl) {
          await deleteFile(existingTemplate.imageUrl);
        }
      }
    }

    // Update the template
    const updatedTemplate = await SocialMediaTemplate.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Template updated successfully',
        data: updatedTemplate
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in PUT /api/admin/social-media-templates:', {
      message: error.message,
      name: error.name,
      ...(error.code && { code: error.code }),
      ...(error.keyPattern && { keyPattern: error.keyPattern }),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });

    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors
        },
        { status: 400 }
      );
    }

    if (error.name === 'MongoServerError' && error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Duplicate key error. A template with this title may already exist."
        },
        { status: 400 }
      );
    }

    if (error.name === 'CastError') {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid ID format"
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update template',
        error: error.message,
        ...(process.env.NODE_ENV === 'development' && {
          details: {
            name: error.name,
            ...(error.code && { code: error.code }),
            ...(error.keyPattern && { keyPattern: error.keyPattern })
          }
        })
      },
      { status: 500 }
    );
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "marketing:edit");

// DELETE a Social Media template
export const DELETE = authMiddlewareAdmin(async (req) => {
  try {
    await _db();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid Template ID format' }, { status: 400 });
    }

    // Get or create the model using the already imported model
    const SocialMediaTemplate = mongoose.models[modelName] || mongoose.model(modelName, SocialMediaTemplateModel.schema);

    const template = await SocialMediaTemplate.findById(id);
    if (!template) {
      return NextResponse.json({ success: false, message: 'Template not found' }, { status: 404 });
    }

    await SocialMediaTemplate.findByIdAndDelete(id);

    // Delete image from VPS if it exists
    if (template.imageUrl) {
      await deleteFile(template.imageUrl);
    }

    return NextResponse.json({ success: true, message: 'Template deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error in DELETE /api/admin/social-media-templates:', error);

    if (error.name === 'CastError') {
      return NextResponse.json({ success: false, message: 'Invalid ID format' }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: 'Failed to delete template', error: error.message }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "marketing:delete");
