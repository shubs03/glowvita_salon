import { NextResponse } from 'next/server';

// GET: Fetch product categories from Admin API
export const GET = async (req, ctx) => {
  try {
    console.log('CRM: Fetching product categories from Admin API');
    
    // Call Admin API directly (same server, different port)
    const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002';
    const response = await fetch(`${adminApiUrl}/api/admin/product-categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`CRM: Admin API responded with status: ${response.status}`);
      throw new Error(`Admin API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('CRM: Received product categories from Admin:', data?.data?.length || data?.length || 0, 'items');

    // Return data in the format expected by frontend
    // If admin API already returns { data: [...] }, keep it that way
    // Otherwise wrap it
    if (data.data) {
      return NextResponse.json(data, { status: 200 });
    } else {
      return NextResponse.json({
        success: true,
        data: data,
        message: 'Product categories fetched successfully'
      }, { status: 200 });
    }

  } catch (error) {
    console.error('CRM: Error fetching product categories:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error fetching product categories', 
        error: error.message 
      },
      { status: 500 }
    );
  }
};

// POST: Create new product category via Admin API
export const POST = async (req, ctx) => {
  try {
    console.log('CRM: Creating product category via Admin API');
    const body = await req.json();

    const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002';
    const response = await fetch(`${adminApiUrl}/api/admin/product-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: data.message || 'Failed to create product category',
        error: data.error
      }, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('CRM: Error creating product category:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error creating product category', 
        error: error.message 
      },
      { status: 500 }
    );
  }
};

// PUT: Update product category via Admin API
export const PUT = async (req, ctx) => {
  try {
    console.log('CRM: Updating product category via Admin API');
    const body = await req.json();

    const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002';
    const response = await fetch(`${adminApiUrl}/api/admin/product-categories`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: data.message || 'Failed to update product category',
        error: data.error
      }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('CRM: Error updating product category:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error updating product category', 
        error: error.message 
      },
      { status: 500 }
    );
  }
};

// DELETE: Delete product category via Admin API
export const DELETE = async (req, ctx) => {
  try {
    console.log('CRM: Deleting product category via Admin API');
    const body = await req.json();

    const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002';
    const response = await fetch(`${adminApiUrl}/api/admin/product-categories`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: data.message || 'Failed to delete product category',
        error: data.error
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      message: 'Product category deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('CRM: Error deleting product category:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error deleting product category', 
        error: error.message 
      },
      { status: 500 }
    );
  }
};
