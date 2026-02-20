import { NextResponse } from 'next/server';
import AppointmentModel from "../../../../../../../packages/lib/src/models/Appointment/Appointment.model";
import _db from '@repo/lib/db';
import ClientModel from '@repo/lib/models/Vendor/Client.model';
import UserModel from "../../../../../../../packages/lib/src/models/user/User.model";
import { withSubscriptionCheck } from '@/middlewareCrm';
import { sendEmail } from "../../../../../../../packages/lib/src/emailService";
import { getConfirmationTemplate, getCompletionTemplate, getInvoiceTemplate, getCancellationTemplate } from "../../../../../../../packages/lib/src/emailTemplates";
import VendorModelLib from "../../../../../../../packages/lib/src/models/Vendor/Vendor.model";
import { checkAndCreditReferralBonus } from "../../../../../../../packages/lib/src/utils/referralWalletCredit";

// Helper function to send appointment emails
const sendAppointmentEmail = async (appointment, vendorId, newStatus, oldStatus, fallbackClientId = null) => {
    console.log(`[Email Debug] Attempting to send email for appointment ${appointment._id}`);
    console.log(`[Email Debug] Status change: ${oldStatus} -> ${newStatus}`);

    if (newStatus === oldStatus) {
        console.log('[Email Debug] Status unchanged, skipping email');
        return;
    }

    try {
        const vendor = await VendorModelLib.findById(vendorId).select('businessName address phone city state pincode');
        const businessName = vendor?.businessName || 'GlowVita Salon';
        const businessAddress = `${vendor?.address || ''}, ${vendor?.city || ''}, ${vendor?.state || ''}, ${vendor?.pincode || ''}`.trim().replace(/^,|,$/g, '');
        const businessPhone = vendor?.phone || '';

        let clientEmail = appointment.client?.email || appointment.clientEmail;
        let clientName = appointment.client?.fullName || appointment.clientName;
        let clientPhone = appointment.client?.phone || '';

        // If client email is missing, it might be an online booking with a User ID stored in the client field
        // We check appointment.client (which might be populated/null) or try to get the raw ID
        const clientId = appointment.client?._id || appointment.client || fallbackClientId;

        if (!clientEmail && clientId) {
            console.log(`[Email Debug] Client email missing, checking User model for ID: ${clientId}`);
            try {
                const user = await UserModel.findById(clientId).select('firstName lastName emailAddress email mobileNo');
                if (user) {
                    clientEmail = user.emailAddress || user.email;
                    clientName = clientName || `${user.firstName} ${user.lastName}`;
                    clientPhone = user.mobileNo || user.phone;
                    console.log(`[Email Debug] Found user info from User model: Name=${clientName}, Email=${clientEmail}, Phone=${clientPhone}`);
                }
            } catch (userError) {
                console.error('[Email Debug] Error fetching user data:', userError);
            }
        }

        console.log(`[Email Debug] Final Client Info for email: Name=${clientName}, Email=${clientEmail}`);

        if (clientEmail) {
            if (newStatus === 'confirmed') {
                const emailHtml = getConfirmationTemplate({
                    clientName,
                    businessName,
                    serviceName: appointment.serviceName,
                    date: appointment.date,
                    startTime: appointment.startTime,
                    location: appointment.homeServiceLocation?.address || businessName
                });

                await sendEmail({
                    to: clientEmail,
                    subject: `Appointment Confirmed - ${businessName}`,
                    html: emailHtml
                });
                console.log(`Confirmation email sent to ${clientEmail}`);
            } else if (newStatus === 'completed' || newStatus === 'completed without payment') {
                // Send completion template
                const completionHtml = getCompletionTemplate({
                    clientName,
                    businessName,
                    serviceName: appointment.serviceName
                });

                // Fetch formal invoice
                let invoiceHtml;
                let formalInvoice;
                try {
                    const { default: InvoiceModel } = await import('@repo/lib/models/Invoice/Invoice.model');
                    formalInvoice = await InvoiceModel.findOne({ appointmentId: appointment._id });

                    if (formalInvoice) {
                        invoiceHtml = getInvoiceTemplate({
                            clientName,
                            clientPhone,
                            businessName,
                            businessAddress,
                            businessPhone,
                            date: new Date(formalInvoice.createdAt).toLocaleDateString(),
                            items: formalInvoice.items,
                            subtotal: formalInvoice.subtotal,
                            tax: formalInvoice.taxAmount,
                            taxRate: formalInvoice.taxRate,
                            platformFee: formalInvoice.platformFee,
                            discount: formalInvoice.discountAmount,
                            couponCode: appointment.payment?.offer?.code || "",
                            totalAmount: formalInvoice.totalAmount,
                            paymentStatus: formalInvoice.paymentStatus,
                            invoiceNumber: formalInvoice.invoiceNumber,
                            paymentMethod: formalInvoice.paymentMethod
                        });
                    } else {
                        // Fallback
                        invoiceHtml = getInvoiceTemplate({
                            clientName,
                            clientPhone,
                            businessName,
                            businessAddress,
                            businessPhone,
                            date: new Date(appointment.date).toLocaleDateString(),
                            items: [{
                                name: appointment.serviceName,
                                price: appointment.amount,
                                quantity: 1,
                                totalPrice: appointment.amount
                            }],
                            subtotal: appointment.amount,
                            tax: appointment.serviceTax || appointment.tax || 0,
                            taxRate: 0,
                            platformFee: appointment.platformFee || 0,
                            discount: appointment.discountAmount || appointment.discount || 0,
                            totalAmount: appointment.totalAmount,
                            paymentStatus: appointment.paymentStatus,
                            invoiceNumber: appointment.invoiceNumber || appointment._id.toString(),
                            paymentMethod: appointment.paymentMethod
                        });
                    }
                } catch (tplError) {
                    console.error('Error fetching invoice for email:', tplError);
                }

                // Generate PDF Buffer (add this for consistency if missing)
                let pdfBuffer;
                if (invoiceHtml) {
                    try {
                        const pdf = (await import('html-pdf')).default;
                        pdfBuffer = await new Promise((resolve, reject) => {
                            pdf.create(invoiceHtml, { format: 'A4' }).toBuffer((err, buffer) => {
                                if (err) reject(err);
                                else resolve(buffer);
                            });
                        });
                    } catch (pdfError) {
                        console.error('PDF generation failed in appointments route:', pdfError);
                    }
                }

                await sendEmail({
                    to: clientEmail,
                    subject: `Appointment Completed - ${businessName}`,
                    html: completionHtml,
                    attachments: pdfBuffer ? [
                        {
                            filename: `Invoice_${formalInvoice?.invoiceNumber || appointment.invoiceNumber || appointment._id}.pdf`,
                            content: pdfBuffer,
                            contentType: 'application/pdf'
                        }
                    ] : []
                });
                console.log(`Completion email and invoice sent to ${clientEmail}`);
            } else if (newStatus === 'cancelled') {
                const emailHtml = getCancellationTemplate({
                    clientName,
                    businessName,
                    serviceName: appointment.serviceName,
                    date: appointment.date,
                    startTime: appointment.startTime,
                    cancellationReason: appointment.cancellationReason
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
    }
};

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
        const vendorId = req.user.vendorId || req.user.userId;
        const { searchParams } = new URL(req.url);
        const id = extractAppointmentId(req.url, params);

        console.log('GET request - extracted ID:', id);
        console.log('GET request - params:', params);

        // If ID is provided, return single appointment
        if (id) {
            const appt = await AppointmentModel.findOne({
                _id: id,
                vendorId: vendorId
            })
                .populate('staff', 'fullName position')
                .populate('service', 'name duration price')
                .lean();

            if (!appt) {
                return NextResponse.json(
                    { message: "Appointment not found or access denied" },
                    { status: 404 }
                );
            }

            if (appt.client) {
                if (appt.mode === 'online') {
                    const UserModel = (await import('@repo/lib/models/user')).default;
                    const user = await UserModel.findById(appt.client).select('firstName lastName emailAddress mobileNo').lean();
                    if (user) {
                        appt.client = {
                            _id: user._id,
                            name: `${user.firstName} ${user.lastName}`,
                            email: user.emailAddress,
                            phone: user.mobileNo
                        };
                    }
                } else {
                    const client = await ClientModel.findById(appt.client).select('fullName email phone').lean();
                    if (client) {
                        appt.client = {
                            _id: client._id,
                            name: client.fullName,
                            email: client.email,
                            phone: client.phone
                        };
                    }
                }
            }

            return NextResponse.json(appt, { status: 200 });
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

        const rawAppointments = await AppointmentModel.find(query)
            .populate('staff', 'fullName position')
            .populate('service', 'name duration price')
            .lean();

        const appointments = await Promise.all(rawAppointments.map(async (appt) => {
            if (appt.client) {
                if (appt.mode === 'online') {
                    // Try to populate from User model for online appointments
                    const UserModel = (await import('@repo/lib/models/user')).default;
                    const user = await UserModel.findById(appt.client).select('firstName lastName emailAddress mobileNo').lean();
                    if (user) {
                        appt.client = {
                            _id: user._id,
                            name: `${user.firstName} ${user.lastName}`,
                            email: user.emailAddress,
                            phone: user.mobileNo
                        };
                    }
                } else {
                    // Try to populate from Client model for offline appointments
                    const client = await ClientModel.findById(appt.client).select('fullName email phone').lean();
                    if (client) {
                        appt.client = {
                            _id: client._id,
                            name: client.fullName,
                            email: client.email,
                            phone: client.phone
                        };
                    }
                }
            }
            return appt;
        }));

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
        const vendorId = (req.user.vendorId || req.user.userId).toString();
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

        // Fetch vendor's region to inherit
        const VendorModel = (await import("@repo/lib/models/Vendor/Vendor.model")).default;
        const vendor = await VendorModel.findById(vendorId).select('regionId');
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
                // Include add-ons if they exist - check both 'addOns' and 'selectedAddons'
                addOns: (item.addOns || item.selectedAddons || []).map(addon => ({
                    name: addon.name,
                    price: addon.price,
                    duration: addon.duration || 0,
                    _id: addon._id || addon.id
                }))
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
                // Include add-ons if they exist in the main body - check both 'addOns' and 'selectedAddons'
                addOns: (body.addOns || body.selectedAddons || []).map(addon => ({
                    name: addon.name,
                    price: addon.price,
                    duration: addon.duration || 0,
                    _id: addon._id || addon.id
                }))
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
            regionId: vendor?.regionId,
            status: body.status || 'scheduled',
            amount: baseAmount,
            addOnsAmount,
            discount: Number(body.discount) || 0,
            tax: Number(body.tax) || 0,
            totalAmount,
            finalAmount: totalAmount, // <--- Ensure finalAmount is set for online/offline consistency
            notes: body.notes || '',
            mode: 'offline', // CRM bookings are always offline mode
            serviceItems // Include the processed service items
        };

        // Check for conflicts before creating
        const { checkMultiServiceConflict } = await import('../../../../../../../packages/lib/src/modules/scheduling/ConflictChecker');
        const conflict = await checkMultiServiceConflict(
            vendorId,
            appointmentData.date,
            serviceItems
        );

        if (conflict) {
            return NextResponse.json(
                {
                    message: "The selected professional is already booked at this time.",
                    conflict: {
                        startTime: conflict.startTime,
                        endTime: conflict.endTime,
                        staffName: conflict.staffName
                    }
                },
                { status: 409 }
            );
        }

        const newAppointment = await AppointmentModel.create(appointmentData);

        // CREDIT STAFF LEDGER IF CREATED AS COMPLETED
        if (newAppointment.status === 'completed' || newAppointment.status === 'completed without payment') {
            try {
                const { syncStaffCommission } = await import('@repo/lib/modules/accounting/StaffAccounting');
                await syncStaffCommission(newAppointment._id);
            } catch (accError) {
                console.error("Error syncing staff on creation:", accError);
            }
        }

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
        const vendorId = req.user.vendorId || req.user.userId;
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

        // Check for conflicts if staff, date, or time is being updated
        if (updateData.staff || updateData.date || updateData.startTime || updateData.endTime || updateData.serviceItems) {
            const { checkMultiServiceConflict } = await import('../../../../../../../packages/lib/src/modules/scheduling/ConflictChecker');

            const checkDate = updateData.date ? new Date(updateData.date) : existingAppointment.date;

            // Re-construct service items for verification
            let verificationItems = updateData.serviceItems || existingAppointment.serviceItems;

            // If it's a legacy single-service update that doesn't use serviceItems array
            if (!updateData.serviceItems && (updateData.staff || updateData.startTime || updateData.endTime)) {
                verificationItems = [{
                    staff: updateData.staff || existingAppointment.staff,
                    startTime: updateData.startTime || existingAppointment.startTime,
                    endTime: updateData.endTime || existingAppointment.endTime,
                    service: updateData.service || existingAppointment.service
                }];
            }

            const conflict = await checkMultiServiceConflict(
                vendorId,
                checkDate,
                verificationItems,
                appointmentId // Exclude current appointment from check
            );

            if (conflict) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "The update would cause a conflict with another appointment.",
                        conflict: {
                            startTime: conflict.startTime,
                            endTime: conflict.endTime,
                            staffName: conflict.staffName
                        }
                    },
                    { status: 409 }
                );
            }
        }

        // Update the appointment using findOne and save to trigger pre-save hooks
        const updatedAppointment = await AppointmentModel.findOne({
            _id: appointmentId,
            vendorId: vendorId
        });

        if (!updatedAppointment) {
            return NextResponse.json(
                { success: false, message: 'Appointment not found or access denied' },
                { status: 404 }
            );
        }

        // Handle cancellation specifically to capture reason and add to notes
        if (updateData.status === 'cancelled' && existingAppointment.status !== 'cancelled') {
            updateData.cancellationReason = updateData.cancellationReason || 'No reason provided';
            const cancellationNote = `[${new Date().toISOString()}] Appointment cancelled: ${updateData.cancellationReason}`;
            const existingNotes = existingAppointment.notes || '';
            updateData.notes = existingNotes ? `${cancellationNote}\n${existingNotes}` : cancellationNote;
        }

        // Apply updates
        Object.keys(updateData).forEach(key => {
            updatedAppointment[key] = updateData[key];
        });

        // Ensure totalAmount and finalAmount are in sync if updated
        if (updateData.totalAmount !== undefined) {
            updatedAppointment.finalAmount = updateData.totalAmount;
        }

        await updatedAppointment.save({ validateBeforeSave: false });

        // SYNC STAFF LEDGER IF RELEVANT CHANGES OCCURRED
        const commissionRelevantFields = ['status', 'amount', 'discount', 'staff', 'serviceItems', 'totalAmount'];
        const hasRelevantChanges = Object.keys(updateData).some(key => commissionRelevantFields.includes(key));

        if (hasRelevantChanges) {
            try {
                const { syncStaffCommission } = await import('@repo/lib/modules/accounting/StaffAccounting');
                await syncStaffCommission(appointmentId);
            } catch (accError) {
                console.error("Error syncing staff on update:", accError);
            }
        }

        // Populate for response
        await updatedAppointment.populate([
            { path: 'client', select: 'fullName email phone' },
            { path: 'service', select: 'name duration price' },
            { path: 'staff', select: 'fullName position email phone' }
        ]);

        // Send email notifications
        await sendAppointmentEmail(updatedAppointment, vendorId, updatedAppointment.status, existingAppointment.status);

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
        const vendorId = req.user.vendorId || req.user.userId;
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
        const vendorId = req.user.vendorId || req.user.userId;
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
        const validStatuses = ['scheduled', 'confirmed', 'completed', 'completed without payment', 'partially-completed', 'cancelled', 'no-show'];
        if (!validStatuses.includes(body.status)) {
            return NextResponse.json(
                { message: "Invalid status value" },
                { status: 400 }
            );
        }

        // Fetch the existing appointment once to get old values
        const existingAppointment = await AppointmentModel.findOne({ _id: appointmentId, vendorId });
        if (!existingAppointment) {
            return NextResponse.json(
                { message: "Appointment not found or access denied" },
                { status: 404 }
            );
        }

        const oldStatus = existingAppointment.status;
        const rawClientId = existingAppointment.client;

        // Add cancellation reason to notes if status is cancelled
        if (body.status === 'cancelled') {
            const cancellationReasonText = body.cancellationReason || 'No reason provided';
            const cancellationNote = `[${new Date().toISOString()}] Appointment cancelled: ${cancellationReasonText}`;
            const existingNotes = existingAppointment.notes || '';

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
                .populate('client', 'fullName email phone')
                .populate('staff', 'fullName position')
                .populate('service', 'name duration price');

            if (!updatedAppointment) {
                return NextResponse.json(
                    { message: "Appointment not found or access denied" },
                    { status: 404 }
                );
            }

            if (updatedAppointment) {
                // Send email notifications
                await sendAppointmentEmail(updatedAppointment, vendorId, 'cancelled', oldStatus, rawClientId);
            }

            // Sync Commission on PATCH
            try {
                const { syncStaffCommission } = await import('@repo/lib/modules/accounting/StaffAccounting');
                await syncStaffCommission(appointmentId);
            } catch (accError) {
                console.error("Error syncing staff on PATCH:", accError);
            }

            return NextResponse.json({
                message: "Appointment status updated successfully",
                appointment: updatedAppointment
            });
        } else {
            // Logic for completing an appointment and calculating staff commission
            const updateFields = { status: body.status };

            // Use findOne and save instead of findOneAndUpdate to trigger pre-save hooks (like commission calculation)
            const updatedAppointment = await AppointmentModel.findOne({ _id: appointmentId, vendorId });

            if (!updatedAppointment) {
                return NextResponse.json(
                    { message: "Appointment not found or access denied" },
                    { status: 404 }
                );
            }

            // Apply updates
            Object.keys(updateFields).forEach(key => {
                updatedAppointment[key] = updateFields[key];
            });

            await updatedAppointment.save({ validateBeforeSave: false });

            // CENTRALIZED INVOICE GENERATION LOGIC
            if (body.status === 'completed' || body.status === 'completed without payment') {
                try {
                    const { default: InvoiceModel } = await import('@repo/lib/models/Invoice/Invoice.model');
                    const invoice = await InvoiceModel.createFromAppointment(appointmentId, vendorId);
                    if (invoice) {
                        updatedAppointment.invoiceNumber = invoice.invoiceNumber;
                        console.log(`Linked sequential invoice ${invoice.invoiceNumber} to appointment ${appointmentId}`);
                    }

                    // CREDIT STAFF COMMISSION TO LEDGER
                    try {
                        const { creditStaffCommission } = await import('@repo/lib/modules/accounting/StaffAccounting');
                        await creditStaffCommission(appointmentId);
                        console.log(`Credited staff commission for appointment ${appointmentId}`);
                    } catch (commError) {
                        console.error("Error crediting staff commission:", commError);
                    }
                } catch (invoiceError) {
                    console.error("Error in centralized invoice generation:", invoiceError);
                }

                // Check and credit referral bonus if user was referred (triggers on first completed appointment)
                console.log(`[CRM Referral] ===== STARTING REFERRAL BONUS CHECK =====`);
                console.log(`[CRM Referral] Appointment ID: ${appointmentId}`);
                console.log(`[CRM Referral] Appointment status: ${updatedAppointment.status}`);
                // LOGIC FIX: Handle both online (User ID) and offline (Client ID) modes
                let targetUserId = null;

                if (updatedAppointment.mode === 'online') {
                    // For online appointments, client field IS the User ID
                    // We need to check if it's an object (populated) or string/ObjectId
                    if (updatedAppointment.client && updatedAppointment.client._id) {
                        targetUserId = updatedAppointment.client._id.toString();
                    } else {
                        targetUserId = updatedAppointment.client?.toString();
                    }
                    console.log(`[CRM Referral] Online appointment detected. Using client field as User ID: ${targetUserId}`);
                } else {
                    // For offline appointments, client field is Client ID. We need to find if this Client is linked to a User.
                    // Note: The client field might be populated or just an ID depending on the finding logic
                    let clientIdToCheck = null;
                    if (updatedAppointment.client && updatedAppointment.client._id) {
                        clientIdToCheck = updatedAppointment.client._id;
                    } else if (updatedAppointment.client) {
                        clientIdToCheck = updatedAppointment.client;
                    }

                    if (clientIdToCheck) {
                        try {
                            const ClientModel = (await import('@repo/lib/models/Vendor/Client.model')).default;
                            const clientDoc = await ClientModel.findById(clientIdToCheck).select('userId');
                            if (clientDoc && clientDoc.userId) {
                                targetUserId = clientDoc.userId.toString();
                                console.log(`[CRM Referral] Offline appointment linked to User ID: ${targetUserId}`);
                            } else {
                                console.log(`[CRM Referral] Offline appointment client not linked to any User`);
                            }
                        } catch (clientErr) {
                            console.error(`[CRM Referral] Error fetching client details:`, clientErr);
                        }
                    }
                }

                if (targetUserId) {
                    try {
                        console.log(`[CRM Referral] ===== TRIGGERING REFERRAL BONUS CHECK =====`);
                        const referralResult = await checkAndCreditReferralBonus(targetUserId, 'appointment');
                        console.log(`[CRM Referral] ===== REFERRAL BONUS RESULT =====`);
                        console.log(`[CRM Referral] Success: ${referralResult.success}`);
                        console.log(`[CRM Referral] Message: ${referralResult.message}`);

                        if (referralResult.success) {
                            console.log(`[CRM Referral] ✅ Referral bonus credited successfully!`);
                        } else {
                            console.warn(`[CRM Referral] ⚠️ Referral bonus not credited: ${referralResult.message}`);
                        }
                    } catch (referralError) {
                        // Don't fail the appointment update if referral crediting fails, just log the error
                        console.error('[CRM Referral] ❌ ERROR crediting referral bonus:', referralError);
                    }
                } else {
                    console.log(`[CRM Referral] ❌ No valid User ID found for referral bonus check`);
                }
            }

            // Populate for response
            await updatedAppointment.populate([
                { path: 'client', select: 'fullName email phone' },
                { path: 'staff', select: 'fullName position' },
                { path: 'service', select: 'name duration price' }
            ]);

            // Send email notifications
            await sendAppointmentEmail(updatedAppointment, vendorId, updatedAppointment.status, oldStatus, rawClientId);

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

