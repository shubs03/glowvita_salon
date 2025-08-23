import { NextResponse } from 'next/server';
import { authMiddlewareVendor } from '../../../../middlewareCrm.js';

// GET: Fetch categories from Admin API
export const GET = async (req, ctx) => {
  try {
    console.log('CRM: Fetching categories from Admin API');
    
    // Call Admin API directly (same server, different port)
    const adminApiUrl = 'http://localhost:3002';
    const response = await fetch(`${adminApiUrl}/api/admin/product-categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Admin API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('CRM: Received categories from Admin:', data);

    return NextResponse.json({
      success: true,
      data: data.data || data,
      message: 'Categories fetched successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('CRM: Error fetching categories:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error fetching categories', 
        error: error.message 
      },
      { status: 500 }
    );
  }
};

// POST: Create new category via Admin API
export const POST = async (req, ctx) => {
  try {
    console.log('CRM: Creating category via Admin API');
    const body = await req.json();
    console.log('CRM: Category data:', body);

    const { name, description } = body;

    // Validation
    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        success: false,
        message: "Category name is required" 
      }, { status: 400 });
    }

    // Call Admin API to create category
    const adminApiUrl = 'http://localhost:3002';
    const response = await fetch(`${adminApiUrl}/api/admin/product-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.trim(),
        description: description?.trim() || ''
      }),
    });

    const data = await response.json();
    console.log('CRM: Admin API response:', data);

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: data.message || 'Failed to create category',
        error: data.error
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      data: data.data,
      message: 'Category created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('CRM: Error creating category:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error creating category', 
        error: error.message 
      },
      { status: 500 }
    );
  }
};
