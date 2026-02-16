
import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import InventoryTransactionModel from '@repo/lib/models/Vendor/InventoryTransaction.model';
import { authMiddlewareCrm } from '@/middlewareCrm';

await _db();

export const GET = authMiddlewareCrm(async (req) => {
    try {
        const { searchParams } = new URL(req.url);
        const userId = req.user.userId;

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const productId = searchParams.get('productId');
        const type = searchParams.get('type');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const category = searchParams.get('category');

        const query = { vendorId: userId };

        if (productId) {
            query.productId = productId;
        }

        if (type) {
            query.type = type;
        }

        if (category) {
            query.productCategory = category;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;

        const transactions = await InventoryTransactionModel.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .populate('productId', 'productName productImages')
            .populate('productCategory', 'name')
            .populate('performedBy', 'name email') // assuming User model has name/email
            .lean();

        const total = await InventoryTransactionModel.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: transactions,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching inventory transactions:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch transaction history'
        }, { status: 500 });
    }
}, ['vendor', 'supplier']);
