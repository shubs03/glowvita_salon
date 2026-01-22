import { NextResponse } from "next/server";
import _db from '@repo/lib/db';
import Faq from '@repo/lib/models/admin/Faq';
import { authMiddlewareAdmin } from '../../../../middlewareAdmin.js';

await _db();

// GET all FAQs
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    const faqs = await Faq.find({}).sort({ createdAt: -1 });
    return NextResponse.json(faqs, { status: 200 });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { message: 'Error fetching FAQs', error: error.message },
      { status: 500 }
    );
  }
}, ['SUPER_ADMIN', 'REGIONAL_ADMIN']);

// Create a new FAQ
export const POST = authMiddlewareAdmin(async (req) => {
  try {
    const data = await req.json();
    
    const newFaq = new Faq({
      ...data,
      createdBy: req.user?.id || 'system'
    });

    const savedFaq = await newFaq.save();
    return NextResponse.json(savedFaq, { status: 201 });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { message: 'Error creating FAQ', error: error.message },
      { status: 500 }
    );
  }
}, ['SUPER_ADMIN', 'REGIONAL_ADMIN']);

// Update an FAQ
export const PATCH = authMiddlewareAdmin(async (req) => {
  try {
    const { id, ...updates } = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { message: 'FAQ ID is required' },
        { status: 400 }
      );
    }
    
    // Only update fields that are provided
    const updateFields = { 
      ...updates,
      updatedAt: new Date() 
    };
    
    const updatedFaq = await Faq.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedFaq) {
      return NextResponse.json(
        { message: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedFaq);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { message: 'Error updating FAQ', error: error.message },
      { status: 500 }
    );
  }
}, ['SUPER_ADMIN', 'REGIONAL_ADMIN']);

// Delete an FAQ
export const DELETE = authMiddlewareAdmin(async (req) => {
  try {
    const { id } = await req.json();
    
    const deletedFaq = await Faq.findByIdAndDelete(id);
    
    if (!deletedFaq) {
      return NextResponse.json(
        { message: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { message: 'Error deleting FAQ', error: error.message },
      { status: 500 }
    );
  }
}, ['SUPER_ADMIN', 'REGIONAL_ADMIN']);

