import { NextResponse } from 'next/server';
import AppointmentModel from "@repo/lib/models/Appointment/Appointment.model";
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
    

        const appointments = await AppointmentModel.find(query)
            .select('_id staff staffName service serviceName date startTime endTime duration status serviceItems clientId userId')
            .lean(); // Use lean() to get plain JavaScript objects with raw ObjectIds

        console.log('Found appointments:', appointments.length);
        console.log('Appointment details:', appointments.map(apt => ({
            id: apt._id?.toString(),
            staffId: apt.staff?.toString(),
            staffName: apt.staffName,
            date: apt.date,
            startTime: apt.startTime,
            endTime: apt.endTime,
            duration: apt.duration,
            service: apt.serviceName || apt.service,
            status: apt.status,
            clientId: apt.clientId?.toString(),
            userId: apt.userId?.toString()
        })));

        // Add CORS headers
        const response = NextResponse.json(appointments, { status: 200 });
        
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