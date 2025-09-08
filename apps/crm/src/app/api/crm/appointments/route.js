import { NextResponse } from 'next/server';
import AppointmentModel from "../../../../../../../packages/lib/src/models/Appointment/Appointment.model";
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

await _db();

// Handle both GET /api/crm/appointments and GET /api/crm/appointments/[id]
export const GET = authMiddlewareCrm(async (req, { params }) => {
    try {
        const vendorId = req.user._id;
        const { searchParams } = new URL(req.url);
        const id = params?.id?.[0]; // Get ID from dynamic route if exists

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
        console.error("Error in appointments API:", error);
        return NextResponse.json(
            { message: "Error processing request", error: error.message },
            { status: 500 }
        );
    }
}, ['vendor']);

// POST a new appointment
export const POST = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id.toString();
        const body = await req.json();

        // Required fields validation
        const requiredFields = [
          'clientName',   // This is the client's name
          'service',
          'serviceName',
          'staff',
          'staffName',
          'date',
          'startTime',
          'endTime',
          'duration',
          'amount',
          'totalAmount',
          'paymentStatus',
          'service',
          'serviceName'
        ];
        
        const missingFields = requiredFields.filter(field => !body[field]);
        
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

        // Set default values
        const appointmentData = {
            ...body,
            vendorId,
            status: body.status || 'scheduled',
            amount: Number(body.amount) || 0,
            discount: Number(body.discount) || 0,
            tax: Number(body.tax) || 0,
            totalAmount: (Number(body.amount) || 0) - (Number(body.discount) || 0) + (Number(body.tax) || 0),
            notes: body.notes || ''
        };

        const newAppointment = await AppointmentModel.create(appointmentData);
        const populatedAppointment = await AppointmentModel.findById(newAppointment._id)
            .populate('staff', 'fullName position')
            .populate('service', 'name duration price');

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

// PUT (update) an appointment
export const PUT = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id;
        const { _id, ...updateData } = await req.json();

        if (!_id) {
            return NextResponse.json(
                { message: "Appointment ID is required for update" },
                { status: 400 }
            );
        }

        // Ensure the appointment belongs to the vendor
        const existingAppointment = await AppointmentModel.findOne({ _id, vendorId });
        if (!existingAppointment) {
            return NextResponse.json(
                { message: "Appointment not found or access denied" },
                { status: 404 }
            );
        }

        // Recalculate total amount if amount, discount, or tax is updated
        if (updateData.amount !== undefined || updateData.discount !== undefined || updateData.tax !== undefined) {
            const amount = updateData.amount !== undefined ? Number(updateData.amount) : existingAppointment.amount;
            const discount = updateData.discount !== undefined ? Number(updateData.discount) : existingAppointment.discount;
            const tax = updateData.tax !== undefined ? Number(updateData.tax) : existingAppointment.tax;
            updateData.totalAmount = amount - discount + tax;
        }

        // Recalculate end time if start time or duration is updated
        if (updateData.startTime || updateData.duration) {
            const startTime = updateData.startTime || existingAppointment.startTime;
            const duration = updateData.duration || existingAppointment.duration;
            const [hours, minutes] = startTime.split(':').map(Number);
            const startDate = new Date();
            startDate.setHours(hours, minutes, 0, 0);
            const endDate = new Date(startDate.getTime() + duration * 60000);
            updateData.endTime = endDate.toTimeString().slice(0, 5);
        }

        const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
            _id,
            { $set: updateData },
            { new: true, runValidators: true }
        )
        .populate('staff', 'fullName position')
        .populate('service', 'name duration price');

        if (!updatedAppointment) {
            return NextResponse.json(
                { message: "Failed to update appointment" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "Appointment updated successfully",
            appointment: updatedAppointment
        });
    } catch (error) {
        console.error('Error updating appointment:', error);
        return NextResponse.json(
            { message: "Error updating appointment", error: error.message },
            { status: 500 }
        );
    }
}, ['vendor']);

// DELETE an appointment
export const DELETE = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id;
        const url = new URL(req.url);
        const id = url.searchParams.get('id') || (await req.json()).id;

        if (!id) {
            return NextResponse.json({ message: "Appointment ID is required for deletion" }, { status: 400 });
        }

        const deletedAppointment = await AppointmentModel.findOneAndDelete({ _id: id, vendorId: vendorId });

        if (!deletedAppointment) {
            return NextResponse.json({ message: "Appointment not found or access denied" }, { status: 404 });
        }

        return NextResponse.json({ message: "Appointment deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error deleting appointment", error: error.message }, { status: 500 });
    }
}, ['vendor']);

// PATCH /api/crm/appointments - Update appointment status
export const PATCH = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id;
        const { _id, status, cancellationReason } = await req.json();

        if (!_id || !status) {
            return NextResponse.json(
                { message: "Appointment ID and status are required" },
                { status: 400 }
            );
        }

        // Validate status
        const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { message: "Invalid status value" },
                { status: 400 }
            );
        }

        // Add cancellation reason to notes if status is cancelled
        if (status === 'cancelled') {
            const cancellationReasonText = cancellationReason || 'No reason provided';
            const cancellationNote = `[${new Date().toISOString()}] Appointment cancelled: ${cancellationReasonText}`;
            
            // Get the existing appointment to append to the notes
            const existingAppointment = await AppointmentModel.findOne({ _id, vendorId });
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
                { _id, vendorId },
                updateObj,
                { new: true, runValidators: true }
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
                { _id, vendorId },
                { $set: { status } },
                { new: true, runValidators: true }
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