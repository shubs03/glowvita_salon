import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@repo/lib/auth';
import _db from '@repo/lib/db';
import InvoiceModel from '@repo/lib/models/Invoice/Invoice.model';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';

await _db();

/**
 * GET /api/invoice/[appointmentId]
 * Fetch the invoice for a specific appointment.
 * Only accessible by the authenticated client who booked the appointment.
 */
export async function GET(req, { params }) {
    try {
        // 1. Authenticate the user via JWT cookie
        const token = cookies().get('token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyJwt(token);
        if (!payload || !payload.userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { appointmentId } = params;
        if (!appointmentId) {
            return NextResponse.json({ success: false, message: 'Appointment ID is required' }, { status: 400 });
        }

        // 2. Fetch the appointment to verify ownership
        const appointment = await AppointmentModel.findById(appointmentId).lean();
        if (!appointment) {
            return NextResponse.json({ success: false, message: 'Appointment not found' }, { status: 404 });
        }

        // 3. Security check: confirm logged-in user owns this appointment
        // For online bookings: appointment.client stores the User ID directly (mode: 'online')
        const clientRef = appointment.client?.toString();
        const userId = payload.userId.toString();

        if (clientRef !== userId) {
            return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
        }

        // 4. Look up the invoice linked to this appointment
        const invoice = await InvoiceModel.findOne({ appointmentId }).lean();
        if (!invoice) {
            return NextResponse.json(
                { success: false, message: 'Invoice not yet available. It will be generated once your appointment is completed.' },
                { status: 404 }
            );
        }

        // 5. Fetch vendor/salon profile for branding on invoice
        let vendorInfo = null;
        if (appointment.vendorId) {
            vendorInfo = await VendorModel.findById(appointment.vendorId)
                .select('businessName salonName address city state pincode phone mobile email')
                .lean();
        }

        return NextResponse.json({
            success: true,
            data: {
                invoice,
                vendor: vendorInfo,
                appointment: {
                    _id: appointment._id,
                    date: appointment.date,
                    startTime: appointment.startTime,
                    endTime: appointment.endTime,
                    serviceName: appointment.serviceName,
                    status: appointment.status,
                    mode: appointment.mode,
                },
            },
        }, { status: 200 });

    } catch (error) {
        console.error('[Invoice API] Error fetching invoice:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error', error: error.message },
            { status: 500 }
        );
    }
}
