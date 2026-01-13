import { NextResponse } from 'next/server';
import AppointmentModel from "../../../../../../../packages/lib/src/models/Appointment/Appointment.model";
import _db from '@repo/lib/db';
import ClientModel from '@repo/lib/models/Vendor/Client.model';
import { withSubscriptionCheck } from '@/middlewareCrm';

await _db();

// Helper function to extract appointment ID from URL
const extractAppointmentId = (url, params) => {
    // First try to get from params (for dynamic routes like [id] or [...id])
    if (params?.id) {
        // Handle both single ID and array of IDs
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
            return id;
        }
    }
    
    // Fallback: try to extract from URL path
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    const appointmentsIndex = pathSegments.findIndex(segment => segment === 'appointments');
    if (appointmentsIndex !== -1 && pathSegments[appointmentsIndex + 1]) {
        const potentialId = pathSegments[appointmentsIndex + 1];
        // Validate if it's a MongoDB ObjectId
        if (/^[0-9a-fA-F]{24}$/.test(potentialId)) {
            return potentialId;
        }
    }
    
    return null;
};

// Handle both GET /api/crm/appointments and GET /api/crm/appointments/[id]
export const GET = withSubscriptionCheck(async (req, { params }) => {
    try {
        console.log('GET request - params:', params);
        console.log('GET request - req.user:', req.user);
        const vendorId = req.user.userId;
        const { searchParams } = new URL(req.url);
        const id = extractAppointmentId(req.url, params);

        console.log('GET request - extracted ID:', id);
        console.log('GET request - params:', params);

        // If ID is provided, return single appointment
        if (id) {
            const appointment = await AppointmentModel.findOne({
                _id: id,
                vendorId: vendorId
            })
            .populate('client', 'name email phone')
            .populate('staff', 'fullName position')
            .populate('service', 'name duration price');

            if (!appointment) {
                return NextResponse.json(
                    { message: "Appointment not found or access denied" },
                    { status: 404 }
                );
            }
            return NextResponse.json(appointment, { status: 200 });
        }

        // Otherwise, return filtered list of appointments
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const staffId = searchParams.get('staffId');
        const status = searchParams.get('status');

        const query = { vendorId };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (staffId) query.staff = staffId;
        if (status) query.status = status;

        const appointments = await AppointmentModel.find(query)
            .populate('client', 'name email phone')
            .populate('staff', 'fullName position')
            .populate('service', 'name duration price');

        return NextResponse.json(appointments, { status: 200 });
    } catch (error) {
        console.error("Error in appointments GET API:", error);
        return NextResponse.json(
            { message: "Error processing request", error: error.message },
            { status: 500 }
        );
    }
}, ['vendor']);

// POST a new appointment
export const POST = withSubscriptionCheck(async (req) => {
    try {
        const vendorId = req.user.userId.toString();
        const body = await req.json();

        console.log('POST request - creating appointment:', body);

        // Required fields validation
        const requiredFields = [
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

        // Calculate end time if not provided
        if (!body.endTime) {
            const [hours, minutes] = body.startTime.split(':').map(Number);
            const startDate = new Date();
            startDate.setHours(hours, minutes, 0, 0);
            const endDate = new Date(startDate.getTime() + (body.duration || 30) * 60000);
            body.endTime = endDate.toTimeString().slice(0, 5);
        }

        // Process service items (for multi-service appointments)
        let serviceItems = [];
        if (body.serviceItems && Array.isArray(body.serviceItems)) {
            serviceItems = body.serviceItems.map(item => ({
                service: item.service || item._id || item.id,
                serviceName: item.serviceName || item.name,
                staff: item.staff || body.staff,
                staffName: item.staffName || body.staffName,
                startTime: item.startTime || body.startTime,
                endTime: item.endTime || body.endTime,
                duration: item.duration || body.duration,
                amount: item.amount || item.price || 0,
                // Include add-ons if they exist
                addOns: item.selectedAddons?.map(addon => ({
                    name: addon.name,
                    price: addon.price,
                    duration: addon.duration || 0,
                    _id: addon._id || addon.id
                })) || []
            }));
        } else {
            // For single service appointments, create a single service item
            serviceItems = [{
                service: body.service,
                serviceName: body.serviceName,
                staff: body.staff,
                staffName: body.staffName,
                startTime: body.startTime,
                endTime: body.endTime,
                duration: body.duration,
                amount: body.amount,
                // Include add-ons if they exist in the main body
                addOns: body.selectedAddons?.map(addon => ({
                    name: addon.name,
                    price: addon.price,
                    duration: addon.duration || 0,
                    _id: addon._id || addon.id
                })) || []
            }];
        }

        // Calculate total amount including add-ons
        const baseAmount = Number(body.amount) || 0;
        const addOnsAmount = serviceItems.reduce((sum, item) => {
            return sum + (item.addOns?.reduce((addonSum, addon) => addonSum + (Number(addon.price) || 0), 0) || 0);
        }, 0);
        const totalAmount = baseAmount + addOnsAmount;

        // Set default values
        const appointmentData = {
            ...body,
            vendorId,
            status: body.status || 'scheduled',
            amount: baseAmount,
            addOnsAmount,
            discount: Number(body.discount) || 0,
            tax: Number(body.tax) || 0,
            totalAmount,
            notes: body.notes || '',
            mode: 'offline', // CRM bookings are always offline mode
            serviceItems // Include the processed service items
        };

        const newAppointment = await AppointmentModel.create(appointmentData);
        const populatedAppointment = await AppointmentModel.findById(newAppointment._id)
            .populate('staff', 'fullName position')
            .populate('service', 'name duration price')
            .populate('serviceItems.service', 'name duration price');

        return NextResponse.json(
            { message: "Appointment created successfully", appointment: populatedAppointment },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating appointment:', error);
        return NextResponse.json(
            { message: "Error creating appointment", error: error.message },
            { status: 500 }
        );
    }
}, ['vendor']);

// Handle PUT /api/crm/appointments/[id] (update)
export const PUT = withSubscriptionCheck(async (req, { params }) => {
    try {
        const vendorId = req.user.userId;
        const appointmentId = params?.id;
        
        if (!appointmentId) {
            return NextResponse.json(
                { success: false, message: 'Appointment ID is required' },
                { status: 400 }
            );
        }

        const requestBody = await req.json();
        
        // Handle both direct updates and updates in an 'updates' object
        const updateData = requestBody.updates || requestBody;
        
        if (!updateData || Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { success: false, message: 'No update data provided' },
                { status: 400 }
            );
        }

        // Ensure the appointment exists and belongs to the vendor
        const existingAppointment = await AppointmentModel.findOne({
            _id: appointmentId,
            vendorId: vendorId
        });

        if (!existingAppointment) {
            return NextResponse.json(
                { success: false, message: 'Appointment not found or access denied' },
                { status: 404 }
            );
        }

        // Calculate end time if start time or duration is updated
        if (updateData.startTime || updateData.duration) {
            const startTime = updateData.startTime || existingAppointment.startTime;
            const duration = updateData.duration || existingAppointment.duration;
            const [hours, minutes] = startTime.split(':').map(Number);
            const startDate = new Date();
            startDate.setHours(hours, minutes, 0, 0);
            const endDate = new Date(startDate.getTime() + duration * 60000);
            updateData.endTime = endDate.toTimeString().slice(0, 5);
        }

        // Recalculate total amount if relevant fields are updated
        if (updateData.amount !== undefined || updateData.discount !== undefined || updateData.tax !== undefined) {
            const amount = updateData.amount !== undefined ? Number(updateData.amount) : existingAppointment.amount;
            const discount = updateData.discount !== undefined ? Number(updateData.discount) : existingAppointment.discount || 0;
            const tax = updateData.tax !== undefined ? Number(updateData.tax) : existingAppointment.tax || 0;
            updateData.totalAmount = Math.max(0, amount - discount + tax);
        }

        // Update the appointment
        const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
            appointmentId,
            { 
                $set: updateData,
                $currentDate: { updatedAt: true }
            },
            { new: true, runValidators: false } // Disable validation to avoid issues with existing appointments
        )
        .populate('client', 'name email phone')
        .populate('service', 'name duration price')
        .populate('staff', 'name email phone');

        if (!updatedAppointment) {
            throw new Error('Failed to update appointment');
        }

        return NextResponse.json({
            success: true,
            data: updatedAppointment,
            message: 'Appointment updated successfully'
        });

    } catch (error) {
        console.error('Error updating appointment:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Failed to update appointment',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
});

// DELETE an appointment
export const DELETE = withSubscriptionCheck(async (req, { params }) => {
    try {
        console.log('=== DELETE REQUEST START ===');
        const vendorId = req.user.userId;
        const appointmentId = extractAppointmentId(req.url, params);
        
        console.log('DELETE Request URL:', req.url);
        console.log('DELETE Request params:', params);
        console.log('Extracted appointment ID:', appointmentId);

        if (!appointmentId) {
            console.error('No appointment ID found for deletion');
            return NextResponse.json(
                { 
                    message: "Appointment ID is required for deletion",
                    receivedUrl: req.url,
                    receivedParams: params
                },
                { status: 400 }
            );
        }

        const deletedAppointment = await AppointmentModel.findOneAndDelete({ 
            _id: appointmentId, 
            vendorId: vendorId 
        });

        if (!deletedAppointment) {
            return NextResponse.json(
                { message: "Appointment not found or access denied" }, 
                { status: 404 }
            );
        }

        return NextResponse.json(
            { 
                message: "Appointment deleted successfully",
                appointment: deletedAppointment
            }, 
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting appointment:', error);
        return NextResponse.json(
            { message: "Error deleting appointment", error: error.message },
            { status: 500 }
        );
    }
}, ['vendor']);

// PATCH /api/crm/appointments - Update appointment status
export const PATCH = withSubscriptionCheck(async (req, { params }) => {
    try {
        const vendorId = req.user.userId;
        const body = await req.json();
        const appointmentId = extractAppointmentId(req.url, params) || body._id;
        
        console.log('PATCH Request - ID:', appointmentId);
        console.log('PATCH Request - body:', body);

        if (!appointmentId || !body.status) {
            return NextResponse.json(
                { message: "Appointment ID and status are required" },
                { status: 400 }
            );
        }

        // Validate status
        const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];
        if (!validStatuses.includes(body.status)) {
            return NextResponse.json(
                { message: "Invalid status value" },
                { status: 400 }
            );
        }

        // Add cancellation reason to notes if status is cancelled
        if (body.status === 'cancelled') {
            const cancellationReasonText = body.cancellationReason || 'No reason provided';
            const cancellationNote = `[${new Date().toISOString()}] Appointment cancelled: ${cancellationReasonText}`;
            
            // Get the existing appointment to append to the notes
            const existingAppointment = await AppointmentModel.findOne({ _id: appointmentId, vendorId });
            const existingNotes = existingAppointment?.notes || '';
            
            const updateObj = {
                $set: {
                    status: 'cancelled',
                    cancellationReason: cancellationReasonText,
                    notes: existingNotes ? `${cancellationNote}\n${existingNotes}` : cancellationNote,
                    updatedAt: new Date()
                }
            };

            const updatedAppointment = await AppointmentModel.findOneAndUpdate(
                { _id: appointmentId, vendorId },
                updateObj,
                { new: true, runValidators: false } // Disable validation to avoid issues with existing appointments
            )
            .populate('staff', 'fullName position')
            .populate('service', 'name duration price');

            if (!updatedAppointment) {
                return NextResponse.json(
                    { message: "Appointment not found or access denied" },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                message: "Appointment status updated successfully",
                appointment: updatedAppointment
            });
        } else {
            const updatedAppointment = await AppointmentModel.findOneAndUpdate(
                { _id: appointmentId, vendorId },
                { $set: { status: body.status } },
                { new: true, runValidators: false } // Disable validation to avoid issues with existing appointments
            )
            .populate('staff', 'fullName position')
            .populate('service', 'name duration price');

            if (!updatedAppointment) {
                return NextResponse.json(
                    { message: "Appointment not found or access denied" },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                message: "Appointment status updated successfully",
                appointment: updatedAppointment
            });
        }
    } catch (error) {
        console.error('Error updating appointment status:', error);
        return NextResponse.json(
            { message: "Error updating appointment status", error: error.message },
            { status: 500 }
        );
    }
}, ['vendor']);

