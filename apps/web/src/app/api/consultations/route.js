import { NextResponse } from 'next/server';
import DoctorConsultation from '@repo/lib/models/Vendor/DoctorConsultation.model';
import Patient from '@repo/lib/models/Vendor/Patient.model';
import Doctor from '@repo/lib/models/Vendor/Docters.model';
import _db from '@repo/lib/db';

await _db();

/**
 * POST /api/consultations
 * Create a new doctor consultation
 */
export const POST = async (req) => {
  try {
    const body = await req.json();

    // Validate required fields
    const {
      doctorId,
      doctorName,
      doctorSpecialty,
      patientName,
      phoneNumber,
      reason,
      consultationType,
      appointmentDate,
      appointmentTime,
      consultationFee,
      userId
    } = body;

    if (!doctorId || !patientName || !phoneNumber || !reason || !consultationType || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the time slot is available
    const isAvailable = await DoctorConsultation.isSlotAvailable(
      doctorId,
      appointmentDate,
      appointmentTime
    );

    if (!isAvailable) {
      return NextResponse.json(
        { success: false, message: 'This time slot is already booked. Please select another slot.' },
        { status: 409 }
      );
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Try to find or create patient
    let patient = await Patient.findOne({ phone: phoneNumber, doctorId });
    
    if (!patient) {
      // Create new patient record
      patient = await Patient.create({
        name: patientName,
        email: body.email || `${phoneNumber}@temp.com`, // Temporary email if not provided
        phone: phoneNumber,
        gender: 'Not Specified', // Can be updated later
        birthdayDate: new Date('2000-01-01'), // Placeholder
        country: 'India', // Default
        doctorId: doctorId,
        status: 'New'
      });
    }

    // Create consultation record
    const consultation = await DoctorConsultation.create({
      doctorId,
      doctorName: doctorName || doctor.name,
      doctorSpecialty: doctorSpecialty || (doctor.specialties && doctor.specialties[0]) || 'General',
      doctorImage: body.doctorImage,
      doctorRating: body.doctorRating,
      doctorReviewCount: body.doctorReviewCount,
      doctorClinic: body.doctorClinic || doctor.clinicName,
      doctorAddress: body.doctorAddress || doctor.clinicAddress,
      
      patientId: patient._id,
      userId: userId || null,
      patientName,
      phoneNumber,
      email: body.email,
      reason: reason || body.concerns, // Support both 'reason' and 'concerns' field names
      
      consultationType,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      duration: body.duration || 20,
      consultationFee: consultationFee || 0,
      
      // Payment fields - support for both initial payment and post-payment updates
      paymentStatus: body.paymentStatus || 'pending',
      paymentMethod: body.paymentMethod,
      razorpayOrderId: body.razorpayOrderId,
      razorpayPaymentId: body.razorpayPaymentId,
      razorpaySignature: body.razorpaySignature,
      
      // Additional pricing fields
      finalAmount: body.finalAmount || consultationFee,
      discountAmount: body.discountAmount || 0,
      couponCode: body.couponCode,
      
      whatsappNotifications: body.whatsappNotifications !== undefined ? body.whatsappNotifications : true,
      smsNotifications: body.smsNotifications || false,
      emailNotifications: body.emailNotifications || false,
      
      status: 'scheduled',
      bookingSource: 'web',
      notes: body.notes
    });

    // Update patient's consultation count
    if (patient) {
      patient.totalConsultations = (patient.totalConsultations || 0) + 1;
      patient.lastConsultation = new Date();
      await patient.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Consultation booked successfully',
        data: consultation
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating consultation:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'A consultation with these details already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Error creating consultation', error: error.message },
      { status: 500 }
    );
  }
};

/**
 * GET /api/consultations
 * Fetch consultations with filters
 */
export const GET = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');
    const userId = searchParams.get('userId');
    const phoneNumber = searchParams.get('phoneNumber');
    const status = searchParams.get('status');
    const consultationType = searchParams.get('consultationType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = {};

    if (doctorId) {
      query.doctorId = doctorId;
    }

    if (patientId) {
      query.patientId = patientId;
    }

    if (userId) {
      query.userId = userId;
    }

    if (phoneNumber) {
      query.phoneNumber = phoneNumber;
    }

    if (status) {
      query.status = { $in: status.split(',') };
    }

    if (consultationType) {
      query.consultationType = consultationType;
    }

    if (startDate || endDate) {
      query.appointmentDate = {};
      if (startDate) {
        query.appointmentDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.appointmentDate.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    const consultations = await DoctorConsultation.find(query)
      .sort({ appointmentDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('doctorId', 'name specialties email phone clinicName')
      .populate('patientId', 'name email phone')
      .lean();

    const total = await DoctorConsultation.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        data: {
          consultations,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching consultations:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching consultations', error: error.message },
      { status: 500 }
    );
  }
};

/**
 * PUT /api/consultations
 * Update a consultation
 */
export const PUT = async (req) => {
  try {
    const body = await req.json();
    const { consultationId, ...updates } = body;

    if (!consultationId) {
      return NextResponse.json(
        { success: false, message: 'Consultation ID is required' },
        { status: 400 }
      );
    }

    const consultation = await DoctorConsultation.findById(consultationId);

    if (!consultation) {
      return NextResponse.json(
        { success: false, message: 'Consultation not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedUpdates = [
      'status', 'cancellationReason', 'notes', 'prescription', 
      'diagnosis', 'followUpDate', 'paymentStatus', 'paymentMethod',
      'razorpayOrderId', 'razorpayPaymentId', 'razorpaySignature'
    ];

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        consultation[key] = updates[key];
      }
    });

    await consultation.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Consultation updated successfully',
        data: consultation
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating consultation:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating consultation', error: error.message },
      { status: 500 }
    );
  }
};

/**
 * DELETE /api/consultations
 * Cancel a consultation
 */
export const DELETE = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const consultationId = searchParams.get('id');
    const reason = searchParams.get('reason') || 'Cancelled by user';

    if (!consultationId) {
      return NextResponse.json(
        { success: false, message: 'Consultation ID is required' },
        { status: 400 }
      );
    }

    const consultation = await DoctorConsultation.findById(consultationId);

    if (!consultation) {
      return NextResponse.json(
        { success: false, message: 'Consultation not found' },
        { status: 404 }
      );
    }

    await consultation.cancel(reason);

    return NextResponse.json(
      {
        success: true,
        message: 'Consultation cancelled successfully',
        data: consultation
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error cancelling consultation:', error);
    return NextResponse.json(
      { success: false, message: 'Error cancelling consultation', error: error.message },
      { status: 500 }
    );
  }
};
