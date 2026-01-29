import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import AppointmentModel from "../../../../../../../../packages/lib/src/models/Appointment/Appointment.model";
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm';
import UserModel from "../../../../../../../../packages/lib/src/models/user/User.model";
import { sendEmail } from "../../../../../../../../packages/lib/src/emailService";
import { getConfirmationTemplate, getCompletionTemplate, getInvoiceTemplate, getCancellationTemplate } from "../../../../../../../../packages/lib/src/emailTemplates";
import VendorModel from "../../../../../../../../packages/lib/src/models/Vendor/Vendor.model";
import pdf from 'html-pdf';

await _db();

export const PUT = authMiddlewareCrm(async (req, { params }) => {
    try {
        const vendorId = req.user.userId || req.user._id;
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

        // Remove fields that MongoDB manages automatically to prevent conflicts
        delete updateObject.updatedAt;
        delete updateObject.createdAt;
        delete updateObject.__v; // version key managed by Mongoose

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

        // Capture clientEmail if provided
        if (updateData.clientEmail) {
            updateObject.clientEmail = updateData.clientEmail;
        }

        // Update the appointment
        // Use runValidators: false to prevent validation errors on partial updates
        // since we're only updating specific fields and not the entire document
        const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
            appointmentId,
            {
                $set: updateObject,
                $currentDate: { updatedAt: true }
            },
            { new: true, runValidators: false }
        )
            .populate('client', 'fullName email phone')
            .populate('service', 'name duration price')
            .populate('staff', 'name email phone');

        if (!updatedAppointment) {
            throw new Error('Failed to update appointment');
        }

        // Send email notifications if status changed
        const statusChanged = updateObject.status && updateObject.status !== existingAppointment.status;
        if (statusChanged) {
            try {
                const vendor = await VendorModel.findById(vendorId).select('businessName address phone city state pincode');
                const businessName = vendor?.businessName || 'GlowVita Salon';
                const businessAddress = `${vendor?.address || ''}, ${vendor?.city || ''}, ${vendor?.state || ''}, ${vendor?.pincode || ''}`.trim().replace(/^,|,$/g, '');
                const businessPhone = vendor?.phone || '';

                let clientEmail = updatedAppointment.client?.email;
                let clientName = updatedAppointment.client?.fullName || updatedAppointment.clientName;
                let clientPhone = updatedAppointment.client?.phone;

                console.log(`[Email Debug ID Route] Initial Client Info: Name=${clientName}, Email=${clientEmail}`);

                // Fallback for online bookings where client stores User ID
                // Use existingAppointment.client as it's the raw ID before population
                const rawClientId = existingAppointment.client;

                if (!clientEmail && rawClientId) {
                    console.log(`[Email Debug ID Route] Client email missing, checking User model for ID: ${rawClientId}`);
                    try {
                        const user = await UserModel.findById(rawClientId).select('firstName lastName emailAddress email mobileNo');
                        if (user) {
                            clientEmail = user.emailAddress || user.email;
                            clientName = clientName || `${user.firstName} ${user.lastName}`;
                            clientPhone = user.mobileNo || user.phone;
                            console.log(`[Email Debug ID Route] Found user info from User model: Name=${clientName}, Email=${clientEmail}, Phone=${clientPhone}`);
                        }
                    } catch (userError) {
                        console.error('[Email Debug ID Route] Error fetching user data:', userError);
                    }
                }

                console.log(`[Email Debug ID Route] Final Client Info for email: Name=${clientName}, Email=${clientEmail}`);

                if (clientEmail) {
                    if (updateObject.status === 'confirmed') {
                        const emailHtml = getConfirmationTemplate({
                            clientName,
                            businessName,
                            serviceName: updatedAppointment.serviceName,
                            date: updatedAppointment.date,
                            startTime: updatedAppointment.startTime,
                            location: updatedAppointment.homeServiceLocation?.address || businessName
                        });

                        await sendEmail({
                            to: clientEmail,
                            subject: `Appointment Confirmed - ${businessName}`,
                            html: emailHtml
                        });
                        console.log(`Confirmation email sent to ${clientEmail}`);
                    } else if (updateObject.status === 'completed' || updateObject.status === 'completed without payment') {
                        // Prepare Invoice HTML
                        let invoiceHtml;
                        try {
                            console.log('Generating invoice template...');
                            invoiceHtml = getInvoiceTemplate({
                                clientName,
                                clientPhone,
                                businessName,
                                businessAddress,
                                businessPhone,
                                serviceName: updatedAppointment.serviceName,
                                date: updatedAppointment.date,
                                startTime: updatedAppointment.startTime,
                                amount: updatedAppointment.amount,
                                addOnsAmount: updatedAppointment.addOnsAmount || 0,
                                tax: updatedAppointment.serviceTax || updatedAppointment.tax || 0,
                                platformFee: updatedAppointment.platformFee || 0,
                                totalAmount: updatedAppointment.totalAmount,
                                amountPaid: updatedAppointment.amountPaid || updatedAppointment.totalAmount,
                                amountRemaining: updatedAppointment.amountRemaining || 0,
                                paymentStatus: updatedAppointment.paymentStatus,
                                invoiceNumber: updatedAppointment._id.toString(),
                                paymentMethod: updatedAppointment.paymentMethod
                            });
                            console.log('Invoice template generated successfully.');
                        } catch (tplError) {
                            console.error('Error generating invoice template:', tplError);
                            invoiceHtml = null;
                        }

                        // Generate PDF Buffer
                        let pdfBuffer;
                        if (invoiceHtml) {
                            console.log('Generating Invoice PDF...');
                            try {
                                const pdfPromise = new Promise((resolve, reject) => {
                                    try {
                                        console.log('Calling pdf.create...');
                                        const options = {
                                            format: 'A4',
                                            timeout: 50000
                                        };

                                        pdf.create(invoiceHtml, options).toBuffer((err, buffer) => {
                                            if (err) {
                                                console.error('pdf.create error callback:', err);
                                                reject(err);
                                            } else {
                                                console.log('pdf.create success callback');
                                                resolve(buffer);
                                            }
                                        });
                                    } catch (err) {
                                        console.error('pdf.create catch block:', err);
                                        reject(err);
                                    }
                                });

                                const timeoutPromise = new Promise((_, reject) =>
                                    setTimeout(() => reject(new Error('PDF generation timed out (30s threshold)')), 30000)
                                );

                                pdfBuffer = await Promise.race([pdfPromise, timeoutPromise]);
                                console.log('Invoice PDF generated, size:', pdfBuffer.length);
                            } catch (pdfError) {
                                console.error('⚠️ PDF Generation failed or timed out:', pdfError.message);
                            }
                        } else {
                            console.warn('Skipping PDF generation due to template error.');
                        }

                        // Send completion email with attachment
                        const completionHtml = getCompletionTemplate({
                            clientName,
                            businessName,
                            serviceName: updatedAppointment.serviceName
                        });

                        await sendEmail({
                            to: clientEmail,
                            subject: `Appointment Completed - ${businessName}`,
                            html: completionHtml,
                            attachments: pdfBuffer ? [
                                {
                                    filename: `Invoice_${updatedAppointment._id}.pdf`,
                                    content: pdfBuffer,
                                    contentType: 'application/pdf'
                                }
                            ] : []
                        });
                        console.log(`Completion email sent to ${clientEmail} with invoice attachment`);
                    } else if (updateObject.status === 'cancelled') {
                        const emailHtml = getCancellationTemplate({
                            clientName,
                            businessName,
                            serviceName: updatedAppointment.serviceName,
                            date: updatedAppointment.date,
                            startTime: updatedAppointment.startTime,
                            cancellationReason: updatedAppointment.cancellationReason
                        });

                        await sendEmail({
                            to: clientEmail,
                            subject: `Appointment Cancelled - ${businessName}`,
                            html: emailHtml
                        });
                        console.log(`Cancellation email sent to ${clientEmail}`);
                    }
                }
            } catch (emailError) {
                console.error('Error sending appointment status email:', emailError);
                // We don't want to fail the whole request if email fails
            }
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
        const vendorId = req.user.userId || req.user._id;
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
