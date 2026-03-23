import { NextResponse } from 'next/server';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import ClientModel from '@repo/lib/models/Vendor/Client.model';
import UserModel from '@repo/lib/models/user';
import _db from '@repo/lib/db';
import { authMiddlewareAdmin } from "../../../../middlewareAdmin";

// GET - Fetch online transactions (appointments with 'Pay Online' paymentMethod)
export const GET = authMiddlewareAdmin(async (req) => {
    try {
        await _db();

        const url = new URL(req.url);
        let page = parseInt(url.searchParams.get('page')) || 1;
        let limit = parseInt(url.searchParams.get('limit')) || 10;
        const search = url.searchParams.get('search') || '';
        const regionId = url.searchParams.get('regionId') || '';
        const status = url.searchParams.get('status') || '';
        const vendorId = url.searchParams.get('vendorId') || '';
        const serviceName = url.searchParams.get('serviceName') || '';

        // Build region query 
        const { getRegionQuery } = await import("@repo/lib/utils/regionQuery");
        const regionQuery = getRegionQuery(req.user, regionId && regionId !== 'all' ? regionId : null);

        if (page < 1) page = 1;
        if (limit < 1 || limit > 100) limit = 10;

        // Query for online payments
        const query = {
            ...regionQuery,
            paymentMethod: "Pay Online"
        };

        if (status && status !== 'all') {
            query.status = status;
        }

        if (vendorId && vendorId !== 'all') {
            query.vendorId = vendorId;
        }

        if (serviceName && serviceName !== 'all') {
            query.serviceName = serviceName;
        }

        // If there's a search term, we need to search across client names, invoice numbers, etc.
        // For simplicity, let's just do a basic search by invoiceNumber or name if we had it populated
        if (search) {
            query.$or = [
                { invoiceNumber: { $regex: search, $options: 'i' } },
                { clientName: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const appointments = await AppointmentModel.find(query)
            .sort({ date: -1, startTime: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'vendorId',
                select: 'businessName vendorContact',
                model: VendorModel
            })
            .lean();

        const total = await AppointmentModel.countDocuments(query);
        
        // Fetch valid dropdown options based on the base query (without pagination/vendor/service filters)
        const baseQuery = { ...regionQuery, paymentMethod: "Pay Online" };
        const uniqueServiceNames = await AppointmentModel.distinct('serviceName', baseQuery);
        // Getting vendors involved in online transactions
        const distinctVendorIds = await AppointmentModel.distinct('vendorId', baseQuery);
        const vendorsList = await VendorModel.find({ _id: { $in: distinctVendorIds } }).select('_id businessName').lean();

        return NextResponse.json({
            success: true,
            data: appointments,
            servicesList: uniqueServiceNames.filter(Boolean),
            vendorsList: vendorsList,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }, { status: 200 });

    } catch (error) {
        console.error('=== ERROR FETCHING ONLINE TRANSACTIONS ===', error);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch online transactions",
            error: error.message
        }, { status: 500 });
    }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "reports:view");
