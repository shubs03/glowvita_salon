import { NextResponse } from "next/server";
import _db from "@repo/lib/db";
import SmsTemplate from "@repo/lib/models/Marketing/SmsTemplate.model";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

await _db();

// GET all SMS templates
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    const templates = await SmsTemplate.find({}).sort({ createdAt: -1 });
    return NextResponse.json(templates, { status: 200 });
  } catch (error) {
    console.error("Error fetching SMS templates:", error);
    return NextResponse.json(
      { message: "Error fetching SMS templates", error: error.message },
      { status: 500 }
    );
  }
}, ["superadmin", "admin"]);

// POST a new SMS template
export const POST = authMiddlewareAdmin(async (req) => {
  try {
    const body = await req.json();
    const user = req.user;
    
    // Validate required fields
    const { name, content, type = 'Other', status = 'Draft', price = 0 } = body;
    if (!name || !content) {
      return NextResponse.json(
        { message: "Name and content are required fields" },
        { status: 400 }
      );
    }

    // Check if template with same name already exists (case insensitive)
    const existingTemplate = await SmsTemplate.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });
    
    if (existingTemplate) {
      return NextResponse.json(
        { message: "A template with this name already exists" },
        { status: 400 }
      );
    }

    // Create new template
    const newTemplate = new SmsTemplate({
      name: name.trim(),
      content: content.trim(),
      type: type.charAt(0).toUpperCase() + type.slice(1),
      status,
      price: Number(price) || 0,
      createdBy: user._id,
      updatedBy: user._id,
      description: body.description || '',
      isPopular: body.isPopular || false
    });

    await newTemplate.save();
    
    return NextResponse.json(
      { 
        message: "SMS template created successfully", 
        data: newTemplate 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating SMS template:", error);
    return NextResponse.json(
      { 
        message: "Error creating SMS template", 
        error: error.message,
        ...(error.name === 'ValidationError' && { 
          details: Object.fromEntries(
            Object.entries(error.errors).map(([key, err]) => [key, err.message])
          )
        })
      },
      { status: 500 }
    );
  }
}, ["superadmin", "admin"]);

// PUT update an SMS template
export const PUT = authMiddlewareAdmin(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json();
    const user = req.user;
    
    if (!id) {
      return NextResponse.json(
        { message: "Template ID is required" },
        { status: 400 }
      );
    }

    const updatedTemplate = await SmsTemplate.findByIdAndUpdate(
      id,
      { 
        ...body,
        updatedBy: user._id,
        updatedAt: new Date() 
      },
      { new: true, runValidators: true }
    );

    if (!updatedTemplate) {
      return NextResponse.json(
        { message: "SMS template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "SMS template updated successfully",
      data: updatedTemplate
    });
  } catch (error) {
    console.error("Error updating SMS template:", error);
    return NextResponse.json(
      { message: "Error updating SMS template", error: error.message },
      { status: 500 }
    );
  }
}, ["superadmin", "admin"]);

// DELETE an SMS template
export const DELETE = authMiddlewareAdmin(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: "Template ID is required" },
        { status: 400 }
      );
    }

    const deletedTemplate = await SmsTemplate.findByIdAndDelete(id);

    if (!deletedTemplate) {
      return NextResponse.json(
        { message: "SMS template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "SMS template deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting SMS template:", error);
    return NextResponse.json(
      { message: "Error deleting SMS template", error: error.message },
      { status: 500 }
    );
  }
}, ["superadmin", "admin"]);
