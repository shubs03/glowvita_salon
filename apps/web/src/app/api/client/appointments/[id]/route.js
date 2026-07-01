import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@repo/lib/auth';
import _db from '@repo/lib/db';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import ClientModel from '@repo/lib/models/Vendor/Client.model';
import UserModel from '@repo/lib/models/user/User.model';

await _db();

/**
 * GET /api/client/appointments/[id]
 * Fetch a single appointment's details for the authenticated user.
 */
export async function GET(req, { params }) {
    try {
        // 1. Authenticate user via JWT cookie
        const token = cookies().get('token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyJwt(token);
        if (!payload || !payload.userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const appointmentId = params?.id;
        if (!appointmentId) {
            return NextResponse.json({ success: false, message: 'Appointment ID is required' }, { status: 400 });
        }

        // 2. Fetch the appointment
        const appointment = await AppointmentModel.findById(appointmentId).lean();
        if (!appointment) {
            return NextResponse.json({ success: false, message: 'Appointment not found' }, { status: 404 });
        }

        // 3. Security check: confirm logged-in user owns this appointment
        const clientRef = appointment.client?.toString();
        const userId = payload.userId.toString();
        let isOwner = false;

        const user = await UserModel.findById(userId).lean();

        if (clientRef === userId) {
            isOwner = true;
        } else if (clientRef) {
            const clientDoc = await ClientModel.findById(clientRef).lean();
            if (clientDoc) {
                if (clientDoc.userId?.toString() === userId) {
                    isOwner = true;
                } else if (user && user.mobileNo && clientDoc.phone && user.mobileNo === clientDoc.phone) {
                    isOwner = true;
                }
            }
        }

        if (!isOwner && user && user.mobileNo && appointment.clientPhone) {
            if (user.mobileNo === appointment.clientPhone) {
                isOwner = true;
            }
        }

        if (!isOwner) {
            return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
        }

        // 4. Fetch vendor info
        let vendorInfo = null;
        if (appointment.vendorId) {
            vendorInfo = await VendorModel.findById(appointment.vendorId)
                .select('businessName salonName address city state pincode phone mobile email')
                .lean();
        }

        return NextResponse.json({
            success: true,
            appointment: {
                _id: appointment._id.toString(),
                date: appointment.date,
                startTime: appointment.startTime,
                endTime: appointment.endTime,
                status: appointment.status,
                service: appointment.service?.toString() || null,
                serviceName: appointment.serviceName,
                serviceItems: appointment.serviceItems || [],
                vendorId: appointment.vendorId?.toString() || null,
                vendorName: vendorInfo?.businessName || vendorInfo?.salonName || 'GlowVita Salon'
            }
        }, { status: 200 });

    } catch (error) {
        console.error('[Client Appointment API] Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error', error: error.message },
            { status: 500 }
        );
    }
}
