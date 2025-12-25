import { NextRequest, NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import WeddingPackage from '@repo/lib/models/Vendor/WeddingPackage.model';

export async function GET(
    request: NextRequest,
    { params }: { params: { vendorId: string } }
) {
    try {
        await _db();

        const packages = await WeddingPackage.find({
            vendorId: params.vendorId,
            isActive: true,
            status: 'approved'
        })
        .select('name description services totalPrice discountedPrice duration staffCount assignedStaff image status isActive createdAt updatedAt')
        .lean();

        console.log('Fetched wedding packages:', packages);
        console.log('Package 0 assignedStaff:', packages[0]?.assignedStaff);
        console.log('Package 0 staffCount:', packages[0]?.staffCount);

        return NextResponse.json({
            success: true,
            weddingPackages: packages
        });
    } catch (error) {
        console.error('Error fetching wedding packages:', error);
        return NextResponse.json(
            { success: false, message: 'Error fetching wedding packages' },
            { status: 500 }
        );
    }
}
