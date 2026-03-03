import { NextResponse } from 'next/server';
import _db from "@repo/lib/db";
import ProductCategoryModel from "@repo/lib/models/admin/ProductCategory";
import { authMiddlewareCrm } from '../../../../middlewareCrm.js';

await _db();

// GET: Fetch categories
export const GET = authMiddlewareCrm(async (req) => {
  try {
    console.log('CRM: Fetching categories from DB');
    const categories = await ProductCategoryModel.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length,
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
});

// POST: Create new category
export const POST = authMiddlewareCrm(async (req) => {
  try {
    console.log('CRM: Creating category in DB');
    const body = await req.json();
    const { name, description } = body;

    // Validation
    if (!name || name.trim() === '') {
      return NextResponse.json({
        success: false,
        message: "Category name is required"
      }, { status: 400 });
    }

    // Check if category already exists
    const existingCategory = await ProductCategoryModel.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });

    if (existingCategory) {
      return NextResponse.json({
        success: false,
        message: "Category with this name already exists"
      }, { status: 409 });
    }

    // Create new category
    const newCategory = await ProductCategoryModel.create({
      name: name.trim(),
      description: description?.trim() || '',
      gstType: 'none',
      gstValue: 0
    });

    return NextResponse.json({
      success: true,
      data: newCategory,
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
});

