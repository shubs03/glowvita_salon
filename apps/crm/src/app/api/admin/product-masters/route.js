import { NextResponse } from 'next/server';

// GET: Fetch product masters from Admin API
export const GET = async (req, ctx) => {
  try {
    console.log('=== CRM Proxy: Fetching product masters from Admin API ===');
    
    // Call Admin API directly (same server, different port)
    const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002';
    const fullUrl = `${adminApiUrl}/api/admin/product-masters`;
    console.log('CRM: Calling Admin API at:', fullUrl);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    console.log('CRM: Admin API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CRM: Admin API error response:`, errorText);
      throw new Error(`Admin API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('CRM: Received data structure:', {
      hasSuccess: !!data.success,
      hasData: !!data.data,
      dataLength: Array.isArray(data.data) ? data.data.length : 'not an array',
      firstItem: data.data?.[0] ? {
        name: data.data[0].name,
        hasCategory: !!data.data[0].category,
        categoryName: data.data[0].category?.name
      } : null
    });

    // Return data keeping admin's structure
    console.log('CRM: Returning', data.data?.length || 0, 'product masters');
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('CRM: Error fetching product masters:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error fetching product masters', 
        error: error.message 
      },
      { status: 500 }
    );
  }
};

// POST: Create new product master via Admin API
export const POST = async (req, ctx) => {
  try {
    console.log('CRM: Creating product master via Admin API');
    const body = await req.json();

    const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002';
    const response = await fetch(`${adminApiUrl}/api/admin/product-masters`, {
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
        message: data.message || 'Failed to create product master',
        error: data.error
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      data: data.data || data,
      message: 'Product master created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('CRM: Error creating product master:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error creating product master', 
        error: error.message 
      },
      { status: 500 }
    );
  }
};

// PUT: Update product master via Admin API
export const PUT = async (req, ctx) => {
  try {
    console.log('CRM: Updating product master via Admin API');
    const body = await req.json();

    const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002';
    const response = await fetch(`${adminApiUrl}/api/admin/product-masters`, {
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
        message: data.message || 'Failed to update product master',
        error: data.error
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      data: data.data || data,
      message: 'Product master updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('CRM: Error updating product master:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error updating product master', 
        error: error.message 
      },
      { status: 500 }
    );
  }
};

// DELETE: Delete product master via Admin API
export const DELETE = async (req, ctx) => {
  try {
    console.log('CRM: Deleting product master via Admin API');
    const body = await req.json();

    const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002';
    const response = await fetch(`${adminApiUrl}/api/admin/product-masters`, {
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
        message: data.message || 'Failed to delete product master',
        error: data.error
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      message: 'Product master deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('CRM: Error deleting product master:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error deleting product master', 
        error: error.message 
      },
      { status: 500 }
    );
  }
};
