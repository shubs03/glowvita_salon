
import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import { authMiddlewareCrm } from '@/middlewareCrm';

await _db();

export const GET = authMiddlewareCrm(async (req) => {
    try {
        const { searchParams } = new URL(req.url);
        const userId = req.user.userId;
        const threshold = parseInt(searchParams.get('threshold') || '10');

        const query = {
            vendorId: userId,
            stock: { $lte: threshold },
            isActive: true // Only check active products
        };

        const lowStockProducts = await ProductModel.find(query)
            .select('productName stock productImages category price')
            .populate('category', 'name')
            .sort({ stock: 1 }) // Lowest stock first
            .lean();

        return NextResponse.json({
            success: true,
            data: lowStockProducts,
            count: lowStockProducts.length
        });

    } catch (error) {
        console.error('Error fetching low stock products:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch low stock alerts'
        }, { status: 500 });
    }
}, ['vendor', 'supplier']);
