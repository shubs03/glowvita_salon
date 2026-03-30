import { NextResponse } from 'next/server';
import BillingModel from '@repo/lib/models/Vendor/Billing.model';
import _db from '@repo/lib/db';
import { withSubscriptionCheck } from '@/middlewareCrm';

await _db();

// POST - Create a new billing record
export const POST = withSubscriptionCheck(async (req) => {
    try {
        const userId = req.user.userId.toString();
        const userRole = req.user.role;
        const body = await req.json();

        // Validate required fields
        if (!body.clientId || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields: clientId, items' },
                { status: 400 }
            );
        }

        // Generate unique invoice number
        const invoiceNumber = await BillingModel.generateInvoiceNumber(userId);

        // Process items to calculate staff commission
        const { default: StaffModel } = await import('@repo/lib/models/Vendor/Staff.model');
        const processedItems = await Promise.all(body.items.map(async (item) => {
            if (item.staffMember?.id) {
                const staff = await StaffModel.findById(item.staffMember.id);
                if (staff && staff.commission) {
                    // Calculate effective amount after item-level discount
                    const effectiveAmount = item.totalPrice;
                    const rate = staff.commissionRate || 0;
                    const amount = (effectiveAmount * rate) / 100;

                    console.log(`Applying commission for staff ${staff.fullName}: Rate ${rate}%, Amount ${amount} on Effective Amount ${effectiveAmount}`);

                    return {
                        ...item,
                        staffMember: {
                            ...(item.staffMember || {}),
                            staffCommissionRate: rate,
                            staffCommissionAmount: amount,
                            id: item.staffMember.id, // Ensure ID is preserved
                            name: staff.fullName // Ensure name is preserved
                        }
                    };
                }
            }
            return item;
        }));

        // Create billing record
        const billingRecord = new BillingModel({
            ...body,
            items: processedItems,
            vendorId: userId,
            invoiceNumber,
        });

        // Save to database
        const savedRecord = await billingRecord.save();

        // Update product stock if items were products
        try {
            const { default: ProductModel } = await import('@repo/lib/models/Vendor/Product.model');
            for (const item of processedItems) {
                if (item.itemType === 'Product' && item.itemId) {
                    const updatedProduct = await ProductModel.findByIdAndUpdate(
                        item.itemId,
                        { $inc: { stock: -1 * (item.quantity || 1) } },
                        { new: true }
                    );
                    console.log(`Updated stock for product ${item.name}: New stock ${updatedProduct?.stock}`);
                }
            }
        } catch (stockError) {
            console.error('Error updating product stock:', stockError);
            // We don't want to fail the whole billing if stock update fails, but we log it
        }

        // Sync staff commissions
        try {
            const { syncBillingCommission } = await import('@repo/lib/modules/accounting/StaffAccounting');
            await syncBillingCommission(savedRecord._id);
        } catch (syncError) {
            console.error('Error syncing staff commissions for billing:', syncError);
        }

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
}, ['vendor', 'supplier']);

// GET - Retrieve billing records
export const GET = withSubscriptionCheck(async (req) => {
    try {
        const userId = req.user.userId.toString();
        const userRole = req.user.role;

        // Parse query parameters
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 50;
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');

        // Build query
        const query = { vendorId: userId };

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
}, ['vendor', 'supplier']);

// PUT - Update a billing record
export const PUT = withSubscriptionCheck(async (req) => {
    try {
        const userId = req.user.userId.toString();
        const userRole = req.user.role;
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
            { _id: body.id, vendorId: userId },
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!updatedRecord) {
            return NextResponse.json(
                { success: false, message: 'Billing record not found' },
                { status: 404 }
            );
        }

        // Sync staff commissions if status might have changed to Completed
        if (updatedRecord.paymentStatus === 'Completed') {
            try {
                const { syncBillingCommission } = await import('@repo/lib/modules/accounting/StaffAccounting');
                await syncBillingCommission(updatedRecord._id);
            } catch (syncError) {
                console.error('Error syncing staff commissions for billing update:', syncError);
            }
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
}, ['vendor', 'supplier']);

// DELETE - Delete a billing record
export const DELETE = withSubscriptionCheck(async (req) => {
    try {
        const userId = req.user.userId.toString();
        const userRole = req.user.role;
        const body = await req.json();

        // Validate required fields
        if (!body.id) {
            return NextResponse.json(
                { success: false, message: 'Missing required field: id' },
                { status: 400 }
            );
        }

        // Delete billing record
        const deletedRecord = await BillingModel.findOneAndDelete(
            { _id: body.id, vendorId: userId }
        );

        if (!deletedRecord) {
            return NextResponse.json(
                { success: false, message: 'Billing record not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Billing record deleted successfully',
                data: deletedRecord
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting billing record:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to delete billing record',
                error: error.message
            },
            { status: 500 }
        );
    }
}, ['vendor', 'supplier']);