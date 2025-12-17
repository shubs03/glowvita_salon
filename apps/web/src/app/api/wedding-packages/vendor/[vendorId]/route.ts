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
        }).lean();

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
