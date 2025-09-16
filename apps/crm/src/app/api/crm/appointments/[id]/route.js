import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import AppointmentModel from "../../../../../../../../packages/lib/src/models/Appointment/Appointment.model";
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

await _db();

export const PUT = authMiddlewareCrm(async (req, { params }) => {
    try {
        const vendorId = req.user._id;
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

        // Prepare the update object
        const updateObject = { ...updateData };
        
        // If client is a string (name) and not a valid ObjectId, remove it to prevent cast error
        if (updateObject.client && !Types.ObjectId.isValid(updateObject.client)) {
            // If clientName is not provided, use the client string as clientName
            if (!updateObject.clientName) {
                updateObject.clientName = updateObject.client;
            }
            // Remove the client field to prevent cast error
            delete updateObject.client;
        }

        // If only clientName is provided, update just the name without changing the client reference
        if (updateObject.clientName && !updateObject.client) {
            // Keep the existing client reference and just update the clientName
            updateObject.clientName = updateObject.clientName;
        }

        // Update the appointment
        const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
            appointmentId,
            { 
                $set: updateObject,
                $currentDate: { updatedAt: true }
            },
            { new: true, runValidators: true }
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

export const DELETE = authMiddlewareCrm(async (req, { params }) => {
    try {
        console.log('=== DELETE REQUEST START ===');
        const vendorId = req.user._id;
        const { id: appointmentId } = params;
        
        console.log('DELETE Request - ID:', appointmentId);

        if (!appointmentId) {
            console.error('No appointment ID found for deletion');
            return NextResponse.json(
                { 
                    message: "Appointment ID is required for deletion",
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
