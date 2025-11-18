import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import PaymentCollectionModel from '../../../../../../../../packages/lib/src/models/Payment/PaymentCollection.model';
import AppointmentModel from '../../../../../../../../packages/lib/src/models/Appointment/Appointment.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm';

await _db();

// GET route to fetch payment collections for an appointment
export const GET = authMiddlewareCrm(async (req) => {
  try {
    const vendorId = req.user.userId || req.user._id;
    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get('appointmentId');
    
    // Validate appointment ID
    if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid appointment ID' },
        { status: 400 }
      );
    }
    
    // Find the appointment to ensure it belongs to the vendor
    const appointment = await AppointmentModel.findOne({
      _id: appointmentId,
      vendorId: vendorId
    });
    
    if (!appointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found or access denied' },
        { status: 404 }
      );
    }
    
    // Find all payment collections for this appointment
    const paymentCollections = await PaymentCollectionModel.find({
      appointmentId: appointmentId,
      vendorId: vendorId
    }).sort({ createdAt: -1 }); // Sort by newest first
    
    return NextResponse.json({
      success: true,
      data: paymentCollections,
      message: 'Payment collections retrieved successfully'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching payment collections:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching payment collections', error: error.message },
      { status: 500 }
    );
  }
});