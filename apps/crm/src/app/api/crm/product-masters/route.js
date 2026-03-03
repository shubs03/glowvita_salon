import { NextResponse } from 'next/server';
import _db from "@repo/lib/db";
import ProductMasterModel from "@repo/lib/models/admin/ProductMaster.model";
import { authMiddlewareCrm } from '../../../../middlewareCrm.js';

await _db();

// GET: Fetch product masters
export const GET = authMiddlewareCrm(async (req) => {
    try {
        console.log('CRM: Fetching product masters from DB');
        const productMasters = await ProductMasterModel.find({ status: 'approved' }).populate("category", "name");

        return NextResponse.json({
            success: true,
            data: productMasters,
            count: productMasters.length,
            message: 'Product masters fetched successfully'
        }, { status: 200 });

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
});
