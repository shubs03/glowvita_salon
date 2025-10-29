import { NextResponse } from 'next/server';
import AppointmentModel from "@repo/lib/models/Appointment/Appointment.model";
import VendorModel from "@repo/lib/models/Vendor/Vendor.model";
import _db from '@repo/lib/db';

await _db();

// GET existing appointments for checking availability
export const GET = async (req) => {
    try {
        const { searchParams } = new URL(req.url);
        const vendorId = searchParams.get('vendorId');
        const staffId = searchParams.get('staffId');
        const date = searchParams.get('date');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const userId = searchParams.get('userId'); // New parameter for user appointments

        console.log('GET appointments - vendorId:', vendorId, 'staffId:', staffId, 'date:', date, 'userId:', userId);

        // Base query - either vendorId or userId is required
        const query = { 
            status: { $nin: ['cancelled'] } // Exclude cancelled appointments
        };

        // If userId is provided, filter by userId/clientId
        if (userId) {
            query.$or = [
                { client: userId },
                { userId: userId }
            ];
        } 
        // If vendorId is provided, filter by vendorId (existing behavior)
        else if (vendorId) {
            query.vendorId = vendorId;
        } 
        // If neither userId nor vendorId is provided, return error
        else {
            return NextResponse.json(
                { message: "Either userId or vendorId is required" },
                { status: 400 }
            );
        }

        // Add date filtering
        if (date) {
            // Single date query
            const searchDate = new Date(date);
            const startOfDay = new Date(searchDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(searchDate);
            endOfDay.setHours(23, 59, 59, 999);
            
            query.date = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        } else if (startDate && endDate) {
            // Date range query
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Add staff filtering (only when vendorId is provided)
        if (vendorId && staffId && staffId !== 'null') {
            query.staff = staffId;
        }

        console.log('Final query:', JSON.stringify(query, null, 2));
    

        // Fetch appointments with populated vendor data
        const appointments = await AppointmentModel.find(query)
            .select('_id staff staffName service serviceName date startTime endTime duration status serviceItems client userId amount totalAmount vendorId')
            .populate('vendorId', 'businessName address')
            .lean(); // Use lean() to get plain JavaScript objects with raw ObjectIds

        // Transform appointments to match frontend interface
        const transformedAppointments = appointments.map(apt => {
            // For multi-service appointments, use the first service as the main service
            let service = apt.serviceName || apt.service || 'Unknown Service';
            let staff = apt.staffName || 'Any Professional';
            let duration = apt.duration || 60;
            let price = apt.amount || apt.totalAmount || 0;
            
            // If there are service items, use the first one for main service info
            if (apt.serviceItems && apt.serviceItems.length > 0) {
                const firstService = apt.serviceItems[0];
                service = firstService.serviceName || service;
                staff = firstService.staffName || staff;
                duration = firstService.duration || duration;
            }
            
            // Get salon information from vendor data
            const salonName = apt.vendorId?.businessName || 'Glowvita Salon';
            const salonAddress = apt.vendorId?.address || '123 Beauty Street, Salon City';
            
            // Status transformation - ensure proper capitalization and allowed values
            let status = apt.status || 'Confirmed';
            if (typeof status === 'string') {
                // Capitalize first letter
                status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
                // Ensure it's one of the allowed values
                if (!['Completed', 'Confirmed', 'Cancelled'].includes(status)) {
                    status = 'Confirmed';
                }
            } else {
                status = 'Confirmed';
            }
            
            return {
                _id: apt._id,
                id: apt._id.toString(),
                service: service,
                date: apt.date,
                staff: staff,
                status: status,
                price: price,
                duration: duration,
                salon: {
                    name: salonName,
                    address: salonAddress
                },
                serviceItems: apt.serviceItems || [],
                vendorId: apt.vendorId?._id || apt.vendorId, // Handle both populated and non-populated cases
                client: apt.client,
                userId: apt.userId
            };
        });

        console.log('Found appointments:', transformedAppointments.length);
        console.log('Appointment details:', transformedAppointments.map(apt => ({
            id: apt.id,
            staff: apt.staff,
            date: apt.date,
            service: apt.service,
            status: apt.status,
            price: apt.price,
            duration: apt.duration,
            salon: apt.salon
        })));

        // Add CORS headers
        const response = NextResponse.json(transformedAppointments, { status: 200 });
        
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        
        return response;
    } catch (error) {
        console.error('Error fetching appointments:', error);
        
        // Add CORS headers to error response
        const response = NextResponse.json(
            { message: "Error fetching appointments", error: error.message },
            { status: 500 }
        );
        
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        
        return response;
    }
};

// POST a new appointment from public web booking
export const POST = async (req) => {
    try {
        const body = await req.json();

        console.log('POST request - creating public appointment:', body);

        // Required fields validation
        const requiredFields = [
          'vendorId',
          'clientName',
          'service',
          'serviceName',
          'staff',
          'staffName',
          'date',
          'startTime',
          'endTime',
          'duration',
          'amount',
          'totalAmount'
        ];
        
        const missingFields = requiredFields.filter(field => {
          // Special handling for staff field - it can be null but must be present
          if (field === 'staff') {
            return body[field] === undefined;
          }
          return !body[field];
        });
        
        if (missingFields.length > 0) {
            return NextResponse.json(
                { message: `Missing required fields: ${missingFields.join(', ')}` }, 
                { status: 400 }
            );
        }

        // Set default values
        const appointmentData = {
            ...body,
            status: body.status || 'scheduled',
            amount: Number(body.amount) || 0,
            discount: Number(body.discount) || 0,
            tax: Number(body.tax) || 0,
            totalAmount: (Number(body.amount) || 0) - (Number(body.discount) || 0) + (Number(body.tax) || 0),
            notes: body.notes || '',
            isMultiService: body.serviceItems && body.serviceItems.length > 1
        };

        const newAppointment = await AppointmentModel.create(appointmentData);
        
        // Populate the appointment with related data
        // For multi-service appointments, we need to populate serviceItems properly
        const populatedAppointment = await AppointmentModel.findById(newAppointment._id)
            .populate('staff', 'fullName position')
            .populate('service', 'name duration price')
            .populate({
                path: 'serviceItems.service',
                select: 'name duration price',
                strictPopulate: false // This prevents the strictPopulate error
            })
            .populate({
                path: 'serviceItems.staff',
                select: 'fullName position',
                strictPopulate: false // This prevents the strictPopulate error
            });

        // Add CORS headers
        const response = NextResponse.json(
            { message: "Appointment created successfully", appointment: populatedAppointment },
            { status: 201 }
        );
        
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        
        return response;
    } catch (error) {
        console.error('Error creating appointment:', error);
        
        // Add CORS headers to error response
        const response = NextResponse.json(
            { message: "Error creating appointment", error: error.message },
            { status: 500 }
        );
        
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        
        return response;
    }
};

// Handle OPTIONS for CORS preflight
export const OPTIONS = async () => {
    const response = NextResponse.json({}, { status: 200 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
};