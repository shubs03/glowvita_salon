import { NextResponse } from 'next/server';
import ClientModel from '@repo/lib/models/Vendor/Client.model';
import UserModel from '@repo/lib/models/user';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import _db from '@repo/lib/db';
import { authMiddlewareAdmin } from "../../../../middlewareAdmin";
import { hasPermission, forbiddenResponse } from "@repo/lib";
import mongoose from "mongoose";

// GET - Fetch customers for admin dashboard
export const GET = authMiddlewareAdmin(async (req) => {
    // Validate models are properly imported
    if (!ClientModel) {
        console.error('ClientModel is not properly imported');
        return NextResponse.json({ 
            success: false,
            message: "ClientModel is not properly imported" 
        }, { status: 500 });
    }
    if (!UserModel) {
        console.error('UserModel is not properly imported');
        return NextResponse.json({ 
            success: false,
            message: "UserModel is not properly imported" 
        }, { status: 500 });
    }
    if (!AppointmentModel) {
        console.error('AppointmentModel is not properly imported');
        return NextResponse.json({ 
            success: false,
            message: "AppointmentModel is not properly imported" 
        }, { status: 500 });
    }
    if (!VendorModel) {
        console.error('VendorModel is not properly imported');
        return NextResponse.json({ 
            success: false,
            message: "VendorModel is not properly imported" 
        }, { status: 500 });
    }
    
    try {
        await _db();
        console.log('Database connected successfully');
        
        // Test database connection
        try {
            const testResult = await UserModel.findOne({}).select('_id').lean();
            console.log('Database connection test successful, sample result:', testResult);
        } catch (testError) {
            console.error('Database connection test failed:', testError);
            return NextResponse.json({ 
                success: false,
                message: "Database connection test failed",
                error: testError.message
            }, { status: 500 });
        }
    } catch (dbError) {
        console.error('Database connection error:', dbError);
        return NextResponse.json({ 
            success: false,
            message: "Database connection failed",
            error: dbError.message
        }, { status: 500 });
    }
    
    try {
        console.log('=== ADMIN CUSTOMERS API REQUEST ===');
        console.log('Request URL:', req.url);
        
        const url = new URL(req.url);
        let page = parseInt(url.searchParams.get('page')) || 1;
        let limit = parseInt(url.searchParams.get('limit')) || 10;
        const search = url.searchParams.get('search') || '';
        const status = url.searchParams.get('status') || '';
        let source = url.searchParams.get('source') || 'all'; // 'online', 'offline', or 'all'
        let vendorId = url.searchParams.get('vendorId') || '';
        
        console.log('Parsed parameters:', { page, limit, search, status, source, vendorId });
        
        // Validate parameters
        if (page < 1) page = 1;
        if (limit < 1 || limit > 100) limit = 10;
        if (!['online', 'offline', 'all'].includes(source)) source = 'all';
        
        // Validate vendorId if provided
        if (vendorId && vendorId.length !== 24) {
            console.log('Invalid vendorId provided, ignoring:', vendorId);
            vendorId = '';
        }
        
        // Test if models are working
        try {
            const userModelCount = await UserModel.countDocuments({});
            console.log('User model count:', userModelCount);
            
            const appointmentModelCount = await AppointmentModel.countDocuments({});
            console.log('Appointment model count:', appointmentModelCount);
            
            const clientModelCount = await ClientModel.countDocuments({});
            console.log('Client model count:', clientModelCount);
            
            const vendorModelCount = await VendorModel.countDocuments({});
            console.log('Vendor model count:', vendorModelCount);
            
            // Test fetching a sample user
            await UserModel.findOne({}).select('_id firstName lastName').lean();
            
            // Test fetching a sample appointment
            await AppointmentModel.findOne({}).select('_id client').lean();
            
            // Test fetching a sample client
            await ClientModel.findOne({}).select('_id fullName').lean();
            
            // Test fetching a sample vendor
            await VendorModel.findOne({}).select('_id businessName').lean();
        } catch (modelTestError) {
            console.error('Model test failed:', modelTestError);
            return NextResponse.json({ 
                success: false,
                message: "Model test failed",
                error: modelTestError.message
            }, { status: 500 });
        }
        
        let allClients = [];
        let totalOffline = 0;
        
        // Handle different sources
        if (source === 'offline' || source === 'all') {
            // Fetch offline clients from ClientModel
            const query = {};
            
            if (status && status !== 'all') {
                query.status = status;
            }
            
            if (search) {
                query.$or = [
                    { fullName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } },
                ];
            }
            
            // If vendorId is specified, filter by vendor
            if (vendorId) {
                query.vendorId = vendorId;
            }
            
            let clients = [];
            try {
                clients = await ClientModel.find(query)
                    .sort({ lastVisit: -1, createdAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .select('-emergencyContact -socialMediaLinks -tags -notes')
                    .lean();
            } catch (clientError) {
                console.error('Error fetching offline clients:', clientError);
                clients = [];
            }
            
            let total = 0;
            try {
                total = await ClientModel.countDocuments(query);
            } catch (countError) {
                console.error('Error counting offline clients:', countError);
                total = 0;
            }
            
            // Add source field to identify offline clients
            const offlineClients = clients.map(client => ({
                ...client,
                source: 'offline'
            }));
            
            // If we only want offline clients, return them
            if (source === 'offline') {
                console.log('Returning offline clients only:', offlineClients.length);
                return NextResponse.json({ 
                    success: true,
                    data: offlineClients,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit)
                    }
                }, { status: 200 });
            }
            
            // If we want all clients, we'll combine with online clients later
            // For now, store offline clients
            allClients = offlineClients;
            totalOffline = total;
            
            // Debug logging
            console.log('Offline clients found:', offlineClients.length);
        }
        
        // Fetch online clients (all users from user table)
        if (source === 'online' || source === 'all') {
            // Build query for users (online clients only)
            let userQuery = {};
            
            if (search) {
                userQuery.$or = [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { emailAddress: { $regex: search, $options: 'i' } },
                    { mobileNo: { $regex: search, $options: 'i' } }
                ];
            }
            
            // Find all unique user IDs who have appointments
            let appointmentQuery = {};
            if (vendorId) {
                appointmentQuery.vendorId = vendorId;
            }
            
            let appointments = [];
            try {
                appointments = await AppointmentModel.find(appointmentQuery)
                    .select('client vendorId')
                    .lean();
                console.log('Appointments found:', appointments.length);
            } catch (appointmentError) {
                console.error('Error fetching appointments:', appointmentError);
                appointments = [];
            }
            
            // Filter appointments by vendor if needed
            let filteredAppointments = appointments;
            if (vendorId) {
                filteredAppointments = appointments.filter(appt => 
                    appt.vendorId && appt.vendorId.toString() === vendorId
                );
            }
            
            const userIds = [...new Set(filteredAppointments.map(appt => appt.client.toString()))];
            
            // For 'all' source, we want to show all users from the user table
            // For 'online' source, we still filter by users with appointments
            if (source === 'online') {
                if (userIds.length > 0) {
                    userQuery._id = { $in: userIds };
                } else {
                    // If we're looking for online clients but found no appointments,
                    // return an empty array
                    userQuery._id = { $in: [] }; // This will return an empty array
                }
            }
            // For 'all' source, we don't add any ID filter, so we get all users
            console.log('Final user query for execution:', JSON.stringify(userQuery));
            
            // Debug logging
            console.log('User IDs found from appointments:', userIds.length);
            console.log('Source filter:', source);
            console.log('User query:', JSON.stringify(userQuery));
            console.log('Vendor ID filter:', vendorId);
            
            const skip = (page - 1) * limit;
            
            // Debug logging
            console.log('Final user query being executed:', JSON.stringify(userQuery));
            
            // Fetch online clients (users who booked appointments) with booking count
            console.log('Executing user query:', JSON.stringify(userQuery));
            let onlineClients = [];
            try {
                onlineClients = await UserModel.find(userQuery)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .select('firstName lastName emailAddress mobileNo createdAt updatedAt')
                    .lean();
                console.log('Successfully fetched online clients:', onlineClients.length);
            } catch (userError) {
                console.error('Error fetching users:', userError);
                // Return empty array if there's an error
                onlineClients = [];
            }
            
            let onlineTotal = 0;
            try {
                onlineTotal = await UserModel.countDocuments(userQuery);
                console.log('Online clients total count:', onlineTotal);
            } catch (countError) {
                console.error('Error counting users:', countError);
                onlineTotal = 0;
            }
            
            // Add booking count for each online client using aggregation for better performance
            if (onlineClients.length > 0) {
                const userIdsForCount = onlineClients.map(user => user._id);
                const appointmentQueryForCount = { client: { $in: userIdsForCount } };
                if (vendorId) {
                    appointmentQueryForCount.vendorId = vendorId;
                }
                
                // Use aggregation to get booking counts for all users in one query
                let bookingCounts = [];
                try {
                    bookingCounts = await AppointmentModel.aggregate([
                        { $match: appointmentQueryForCount },
                        { $group: { _id: "$client", count: { $sum: 1 } } }
                    ]);
                } catch (aggregateError) {
                    console.error('Error aggregating appointments:', aggregateError);
                    bookingCounts = [];
                }
                
                // Create a map of user ID to booking count
                const bookingCountMap = {};
                bookingCounts.forEach(item => {
                    bookingCountMap[item._id.toString()] = item.count;
                });
                
                // Add booking count to each user
                onlineClients.forEach(user => {
                    user.bookingCount = bookingCountMap[user._id.toString()] || 0;
                });
            }
            
            // Debug logging
            console.log('Online clients found:', onlineClients.length);
            
            // Transform online clients to match the expected structure
            const transformedOnlineClients = onlineClients.map(user => ({
                _id: user._id,
                fullName: `${user.firstName} ${user.lastName}`,
                email: user.emailAddress,
                phone: user.mobileNo,
                birthdayDate: null,
                gender: 'Other',
                country: '',
                occupation: '',
                profilePicture: '',
                address: '',
                lastVisit: user.createdAt,
                totalBookings: user.bookingCount || 0,
                totalSpent: 0,    // Will be calculated in frontend
                status: 'Active',
                source: 'online',
                vendorId: null, // Will be populated later
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }));
            
            // Get vendor information for each client
            const vendorIds = [...new Set(filteredAppointments.map(appt => appt.vendorId).filter(Boolean))];
            let vendors = [];
            try {
                vendors = await VendorModel.find({ _id: { $in: vendorIds } })
                    .select('businessName')
                    .lean();
            } catch (vendorError) {
                console.error('Error fetching vendors:', vendorError);
                vendors = [];
            }
                
            const vendorMap = vendors.reduce((acc, vendor) => {
                acc[vendor._id.toString()] = vendor.businessName;
                return acc;
            }, {});
            
            // Add vendor names and IDs to clients
            const onlineClientsWithVendors = transformedOnlineClients.map(client => {
                // Find the appointment for this client to get the vendorId
                const appointment = filteredAppointments.find(appt => 
                    appt.client.toString() === client._id.toString()
                );
                
                return {
                    ...client,
                    vendorId: appointment ? appointment.vendorId : null,
                    vendorName: appointment && appointment.vendorId ? 
                        vendorMap[appointment.vendorId.toString()] || 'Unknown Vendor' : 'N/A'
                };
            });
            
            // If we only want online clients, return them
            if (source === 'online') {
                console.log('Returning online clients only:', onlineClientsWithVendors.length);
                return NextResponse.json({ 
                    success: true,
                    data: onlineClientsWithVendors,
                    pagination: {
                        page,
                        limit,
                        total: onlineTotal,
                        totalPages: Math.ceil(onlineTotal / limit)
                    }
                }, { status: 200 });
            }
            
            // If we want all clients, combine with offline clients
            if (source === 'all') {
                // Combine offline and online clients
                const combinedClients = [...(allClients || []), ...onlineClientsWithVendors];
                
                // Remove duplicates by _id
                const uniqueClients = combinedClients.filter((client, index, self) => 
                    index === self.findIndex(c => c._id.toString() === client._id.toString())
                );
                
                // Debug logging
                console.log('Combined clients (all sources):', uniqueClients.length);
                console.log('All clients (offline):', allClients.length);
                console.log('Online clients with vendors:', onlineClientsWithVendors.length);
                
                // For pagination with 'all' source, we'll use a simple approach
                // In a real application, you'd want more sophisticated pagination
                const paginatedClients = uniqueClients.slice((page - 1) * limit, page * limit);
                
                console.log('Final response data length:', paginatedClients.length);
                
                const response = { 
                    success: true,
                    data: paginatedClients,
                    pagination: {
                        page,
                        limit,
                        total: uniqueClients.length,
                        totalPages: Math.ceil(uniqueClients.length / limit)
                    }
                };
                
                console.log('=== FINAL RESPONSE ===', JSON.stringify(response, null, 2));
                
                return NextResponse.json(response, { status: 200 });
            }
        }
        
        console.log('Invalid source parameter:', source);
        return NextResponse.json({ 
            success: false,
            message: "Invalid source parameter" 
        }, { status: 400 });
    } catch (error) {
        console.error('=== ERROR FETCHING CUSTOMERS ===', error);
        return NextResponse.json({ 
            success: false,
            message: "Failed to fetch customers", 
            error: error.message 
        }, { status: 500 });
    }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "customers:view");

// Validate models have expected methods
if (ClientModel && typeof ClientModel.find !== 'function') {
    console.error('ClientModel.find is not a function');
}
if (UserModel && typeof UserModel.find !== 'function') {
    console.error('UserModel.find is not a function');
}
if (AppointmentModel && typeof AppointmentModel.find !== 'function') {
    console.error('AppointmentModel.find is not a function');
}
if (VendorModel && typeof VendorModel.find !== 'function') {
    console.error('VendorModel.find is not a function');
}