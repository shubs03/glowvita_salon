import { NextResponse } from 'next/server';
import BillingModel from '@repo/lib/models/Vendor/Billing.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm';

await _db();

// POST - Create a new billing record
export const POST = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user.userId.toString();
        const body = await req.json();
        
        // Validate required fields
        if (!body.clientId || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields: clientId, items' },
                { status: 400 }
            );
        }

        // Generate unique invoice number
        const invoiceNumber = await BillingModel.generateInvoiceNumber(vendorId);
        
        // Create billing record
        const billingRecord = new BillingModel({
            ...body,
            vendorId,
            invoiceNumber,
        });

        // Save to database
        const savedRecord = await billingRecord.save();

        return NextResponse.json(
            { 
                success: true, 
                message: 'Billing record created successfully',
                data: savedRecord
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating billing record:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Failed to create billing record',
                error: error.message 
            },
            { status: 500 }
        );
    }
}, ['vendor']);

// GET - Retrieve billing records
export const GET = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user.userId.toString();
        
        // Parse query parameters
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 50;
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');
        
        // Build query
        const query = { vendorId };
        
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        // Execute query with pagination
        const billingRecords = await BillingModel.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
            
        // Get total count for pagination
        const totalCount = await BillingModel.countDocuments(query);

        return NextResponse.json(
            { 
                success: true, 
                data: billingRecords,
                pagination: {
                    page,
                    limit,
                    totalCount,
                    totalPages: Math.ceil(totalCount / limit)
                }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error retrieving billing records:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Failed to retrieve billing records',
                error: error.message 
            },
            { status: 500 }
        );
    }
}, ['vendor']);

// PUT - Update a billing record
export const PUT = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user.userId.toString();
        const body = await req.json();
        
        // Validate required fields
        if (!body.id) {
            return NextResponse.json(
                { success: false, message: 'Missing required field: id' },
                { status: 400 }
            );
        }

        // Update billing record
        const updatedRecord = await BillingModel.findOneAndUpdate(
            { _id: body.id, vendorId },
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!updatedRecord) {
            return NextResponse.json(
                { success: false, message: 'Billing record not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { 
                success: true, 
                message: 'Billing record updated successfully',
                data: updatedRecord
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating billing record:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Failed to update billing record',
                error: error.message 
            },
            { status: 500 }
        );
    }
}, ['vendor']);