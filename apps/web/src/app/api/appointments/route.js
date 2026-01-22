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
        const doctorId = searchParams.get('doctorId');
        const date = searchParams.get('date');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const userId = searchParams.get('userId'); // New parameter for user appointments

        console.log('GET appointments - vendorId:', vendorId, 'staffId:', staffId, 'date:', date, 'userId:', userId);

        // Base query - either vendorId or userId is required
        const query = { 
            status: { $in: ['confirmed', 'pending', 'scheduled','cancelled','completed'] } // Only include active appointments
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
        if (vendorId && staffId && staffId !== 'null' && staffId !== 'undefined') {
            query.staff = staffId;
        }

        console.log('Final query:', JSON.stringify(query, null, 2));
    
        // Fetch appointments with populated vendor data
        const appointments = await AppointmentModel.find(query)
            .select('_id staff staffName service serviceName date startTime endTime duration status serviceItems client userId amount totalAmount finalAmount platformFee serviceTax discountAmount vendorId')
            .populate('vendorId', 'businessName address')
            .lean(); // Use lean() to get plain JavaScript objects with raw ObjectIds

        // Transform appointments to match frontend interface
        const transformedAppointments = appointments.map(apt => {
            // For multi-service appointments, use the first service as the main service
            let service = apt.serviceName || apt.service || 'Unknown Service';
            let staff = apt.staffName || 'Any Professional';
            let duration = apt.duration || 60;
            // Updated to use finalAmount if available, otherwise totalAmount, otherwise amount
            let price = apt.finalAmount || apt.totalAmount || apt.amount || 0;
            
            // If there are service items, use the first one for main service info
            if (apt.serviceItems && apt.serviceItems.length > 0) {
                const firstService = apt.serviceItems[0];
                service = firstService.serviceName || service;
                staff = firstService.staffName || staff;
                duration = firstService.duration || duration;
                // For multi-service appointments, we might want to show the total of all services
                // Sum up all service item amounts for a more accurate total
                const serviceItemsTotal = apt.serviceItems.reduce((sum, item) => sum + (item.amount || 0), 0);
                // But only use this if it's greater than the base price (to handle cases where serviceItems might be incomplete)
                if (serviceItemsTotal > price) {
                    price = serviceItemsTotal;
                }
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
            
            // For time slot checking, we need the actual appointment times
            // CRITICAL: For multi-service appointments, startTime is from FIRST service, endTime is from LAST service
            let startTime = apt.startTime;
            let endTime = apt.endTime;
            
            if (apt.serviceItems && apt.serviceItems.length > 0) {
                // Use first service's startTime (appointment begins with first service)
                startTime = apt.serviceItems[0].startTime || startTime;
                // Use LAST service's endTime (appointment ends with last service)
                const lastService = apt.serviceItems[apt.serviceItems.length - 1];
                endTime = lastService.endTime || endTime;
                
                console.log(`Multi-service appointment ${apt._id}:`, {
                    firstServiceStart: apt.serviceItems[0].startTime,
                    lastServiceEnd: lastService.endTime,
                    finalStartTime: startTime,
                    finalEndTime: endTime,
                    totalServices: apt.serviceItems.length
                });
            }
            
            return {
                _id: apt._id,
                id: apt._id.toString(),
                service: service,
                date: apt.date,
                staff: apt.staff, // ✅ Keep the actual staff ID for comparison
                staffName: staff, // Also include the name for display
                startTime: startTime, // ✅ Include startTime at top level
                endTime: endTime, // ✅ Include endTime at top level
                status: status,
                price: price,
                duration: duration,
                amount: apt.amount || 0,
                totalAmount: apt.totalAmount || 0,
                platformFee: apt.platformFee || 0,
                serviceTax: apt.serviceTax || 0,
                discountAmount: apt.discountAmount || 0,
                finalAmount: apt.finalAmount || 0,
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

        // Add CORS headers
        const response = NextResponse.json(transformedAppointments, { status: 200 });
        
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        
        return response;
    } catch (error) {
        console.error('Error fetching appointments:', error);
        console.error('Error stack:', error.stack);
        
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

// Import travel time calculation utility
import { calculateVendorTravelTime } from '@repo/lib/modules/scheduling/EnhancedTravelUtils';

// POST a new appointment from public web booking
export const POST = async (req) => {
    try {
      
        const body = await req.json();

        console.log('POST request - creating public appointment:', body);
        console.log('Home service data received:', {
            isHomeService: body.isHomeService,
            homeServiceLocation: body.homeServiceLocation,
            hasLocation: !!body.homeServiceLocation,
            locationKeys: body.homeServiceLocation ? Object.keys(body.homeServiceLocation) : [],
            locationValues: body.homeServiceLocation
        });
        console.log('Full body received:', JSON.stringify(body, null, 2));

        // Required fields validation (client is handled separately)
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
            // Staff can be null but must be present in the body
            return body[field] === undefined;
          }
          if (field === 'staffName') {
            // StaffName can be null/empty but must be present in the body
            return body[field] === undefined;
          }
          // For all other fields, they must be present and not null/undefined
          return !body[field] && body[field] !== 0 && body[field] !== false;
        });
        
        if (missingFields.length > 0) {
            console.log('Missing fields:', missingFields);
            console.log('Body received:', body);
            return NextResponse.json(
                { message: `Missing required fields: ${missingFields.join(', ')}` }, 
                { status: 400 }
            );
        }

        // Validate client information - either client or userId is required but not both
        // Remove client from required fields since it's optional if userId is provided
        if (!body.client && !body.userId) {
            console.log('No client field found in body:', body);
            return NextResponse.json(
                { message: "Missing client field (client or userId required)" }, 
                { status: 400 }
            );
        }

        // Calculate travel time for home services
        let travelTimeInfo = null;
        const isHomeService = body.isHomeService || false;
        const homeServiceLocation = body.homeServiceLocation || null;
        
        console.log('Processing appointment - isHomeService:', isHomeService, 'location:', homeServiceLocation);
        
        if (isHomeService && homeServiceLocation && homeServiceLocation.lat && homeServiceLocation.lng) {
            try {
                console.log('Calculating travel time for home service...');
                const customerLocation = {
                    lat: Number(homeServiceLocation.lat),
                    lng: Number(homeServiceLocation.lng)
                };
                travelTimeInfo = await calculateVendorTravelTime(body.vendorId, customerLocation);
                console.log('Travel time calculated:', travelTimeInfo);
            } catch (error) {
                console.warn('Could not calculate travel time, using fallback:', error.message);
                // Use a conservative estimate
                travelTimeInfo = {
                    timeInMinutes: 30,
                    distanceInKm: 10,
                    distanceInMeters: 10000,
                    source: 'fallback'
                };
            }
        }

        // Set default values and ensure proper data types
        const appointmentData = {
            vendorId: body.vendorId,
            client: body.client || body.userId || null, // Either client or userId or null
            clientName: body.clientName,
            service: body.service === "combo" ? (body.serviceItems?.[0]?.service || body.service) : body.service,
            serviceName: body.serviceName,
            staff: body.staff !== undefined ? body.staff : null, // This can be null
            staffName: body.staffName || "Any Professional", // Provide default if not present
            date: body.date ? new Date(body.date) : new Date(),
            startTime: body.startTime,
            endTime: body.endTime,
            duration: Number(body.duration) || 0,
            amount: Number(body.amount) || 0,
            totalAmount: Number(body.totalAmount) || 0,
            platformFee: Number(body.platformFee) || 0,
            serviceTax: Number(body.serviceTax) || 0,
            discountAmount: Number(body.discountAmount) || 0,
            finalAmount: Number(body.finalAmount) || Number(body.totalAmount) || 0,
            paymentMethod: body.paymentMethod || 'Pay at Salon',
            paymentStatus: body.paymentStatus || 'pending',
            status: body.status || 'scheduled',
            notes: body.notes || '',
            serviceItems: body.serviceItems || [],
            isMultiService: body.isMultiService || (body.serviceItems && body.serviceItems.length > 1),
            // Add home service fields
            isHomeService: isHomeService,
            isWeddingService: body.isWeddingService || false,
            mode: 'online' // Web bookings are always online mode
        };
        
        // Add home service location if it's a home service
        if (isHomeService && homeServiceLocation) {
            appointmentData.homeServiceLocation = {
                address: homeServiceLocation.address || '',
                city: homeServiceLocation.city || '',
                state: homeServiceLocation.state || '',
                pincode: homeServiceLocation.pincode || '',
                landmark: homeServiceLocation.landmark || '',
                lat: Number(homeServiceLocation.lat) || 0,
                lng: Number(homeServiceLocation.lng) || 0
            };
            console.log('Added home service location to appointment:', appointmentData.homeServiceLocation);
        }
        
        // Add travel time information if available
        if (travelTimeInfo) {
            appointmentData.travelTime = travelTimeInfo.timeInMinutes || 0;
            appointmentData.travelDistance = travelTimeInfo.distanceInKm || 0;
            appointmentData.distanceMeters = travelTimeInfo.distanceInMeters || 0;
            console.log('Added travel time data:', {
                travelTime: appointmentData.travelTime,
                travelDistance: appointmentData.travelDistance,
                distanceMeters: appointmentData.distanceMeters
            });
        }
        
        // Add travel time to serviceItems if it's a multi-service appointment
        if (appointmentData.isMultiService && appointmentData.serviceItems && appointmentData.serviceItems.length > 0 && travelTimeInfo) {
            appointmentData.serviceItems = appointmentData.serviceItems.map((item, index) => ({
                ...item,
                // Add travel time only to the first service
                travelTime: index === 0 ? (travelTimeInfo.timeInMinutes || 0) : 0,
                travelDistance: index === 0 ? (travelTimeInfo.distanceInKm || 0) : 0,
                distanceMeters: index === 0 ? (travelTimeInfo.distanceInMeters || 0) : 0
            }));
        }

        // Fetch vendor to get regionId
        const vendor = await VendorModel.findById(body.vendorId).select('regionId').lean();
        if (vendor && vendor.regionId) {
            appointmentData.regionId = vendor.regionId;
            console.log('Set regionId for appointment:', vendor.regionId);
        }

        const newAppointment = await AppointmentModel.create(appointmentData);
        console.log('Appointment created successfully with ID:', newAppointment._id);
        console.log('Saved appointment data:', {
            isHomeService: newAppointment.isHomeService,
            homeServiceLocation: newAppointment.homeServiceLocation,
            travelTime: newAppointment.travelTime,
            travelDistance: newAppointment.travelDistance
        });
        
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
        console.error('Error stack:', error.stack);
        
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