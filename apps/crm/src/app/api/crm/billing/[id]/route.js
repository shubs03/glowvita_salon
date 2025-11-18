import { NextResponse } from 'next/server';
import BillingModel from '@repo/lib/models/Vendor/Billing.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm';

await _db();

// GET - Retrieve a specific billing record by ID
export const GET = authMiddlewareCrm(async (req, { params }) => {
    try {
        const userId = req.user.userId.toString();
        const userRole = req.user.role;
        const { id } = params;
        
        // Validate ID format
        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Missing billing record ID' },
                { status: 400 }
            );
        }

        // Find billing record
        const billingRecord = await BillingModel.findOne({
            _id: id,
            vendorId: userId
        }).populate('clientId', 'fullName email phone profilePicture address');

        if (!billingRecord) {
            return NextResponse.json(
                { success: false, message: 'Billing record not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { 
                success: true, 
                data: billingRecord
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error retrieving billing record:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Failed to retrieve billing record',
                error: error.message 
            },
            { status: 500 }
        );
    }
}, ['vendor', 'supplier']);