export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import DoctorConsultation from '@repo/lib/models/Vendor/DoctorConsultation.model';
import _db from '@repo/lib/db';

await _db();

/**
 * GET /api/consultations/booked-slots
 * Get all booked time slots for a specific doctor and date
 */
export const GET = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');

    if (!doctorId || !date) {
      return NextResponse.json(
        { success: false, message: 'doctorId and date are required' },
        { status: 400 }
      );
    }

    // Query for all non-cancelled consultations on the specified date
    const bookedConsultations = await DoctorConsultation.find({
      doctorId,
      appointmentDate: new Date(date),
      status: { $nin: ['cancelled', 'no-show'] } // Exclude cancelled and no-show
    })
    .select('appointmentTime consultationType status')
    .lean();

    // Extract just the time slots
    const bookedSlots = bookedConsultations.map(consultation => consultation.appointmentTime);

    return NextResponse.json(
      {
        success: true,
        data: {
          bookedSlots,
          date,
          doctorId
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching booked slots:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching booked slots', error: error.message },
      { status: 500 }
    );
  }
};
