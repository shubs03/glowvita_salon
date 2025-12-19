import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import DoctorModel from '@repo/lib/models/Vendor/Docters.model';
import { withSubscriptionCheck } from '@/middlewareCrm.js';
import { uploadBase64, deleteFile } from '@repo/lib/utils/upload';

await _db();

// GET the current doctor's profile
export const GET = withSubscriptionCheck(async (req) => {
  try {
    const doctorId = req.user.userId || req.user._id;

    console.log("Fetching doctor profile for ID:", doctorId);
    console.log("User from token:", req.user);

    if (!doctorId) {
      return NextResponse.json({ message: "Doctor ID is required" }, { status: 400 });
    }

    const doctor = await DoctorModel.findById(doctorId).select('-password -__v');

    console.log("Doctor data from DB:", doctor);

    if (!doctor) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: doctor
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch doctor profile",
      error: error.message
    }, { status: 500 });
  }
}, ['doctor']);

// PUT - Update doctor profile
export const PUT = withSubscriptionCheck(async (req) => {
  try {
    const doctorId = req.user.userId || req.user._id;
    const body = await req.json();

    // Find the doctor
    const doctor = await DoctorModel.findById(doctorId);
    if (!doctor) {
      return NextResponse.json({
        success: false,
        message: "Doctor not found"
      }, { status: 404 });
    }

    // Debug: Log doctor ID
    console.log('Doctor ID:', doctorId);

    // Remove _id from body if present to prevent accidental updates
    delete body._id;

    // Handle profile image upload if provided
    if (body.profileImage !== undefined) {
      if (body.profileImage) {
        // Upload new image to VPS
        const fileName = `doctor-${doctorId}-profile`;
        const imageUrl = await uploadBase64(body.profileImage, fileName);

        if (!imageUrl) {
          return NextResponse.json(
            { success: false, message: "Failed to upload profile image" },
            { status: 500 }
          );
        }

        // Delete old image from VPS if it exists
        if (doctor.profileImage) {
          await deleteFile(doctor.profileImage);
        }

        body.profileImage = imageUrl;
      } else {
        // If image is null/empty, remove it
        body.profileImage = null;

        // Delete old image from VPS if it exists
        if (doctor.profileImage) {
          await deleteFile(doctor.profileImage);
        }
      }
    }

    // Update allowed fields only
    const allowedFields = [
      'name', 'email', 'phone', 'gender', 'registrationNumber', 'doctorType',
      'specialties', 'diseases', 'experience', 'clinicName', 'clinicAddress',
      'state', 'city', 'pincode', 'profileImage', 'qualification',
      'registrationYear', 'physicalConsultationStartTime', 'physicalConsultationEndTime',
      'faculty', 'assistantName', 'assistantContact', 'doctorAvailability',
      'landline', 'workingWithHospital', 'videoConsultation'
    ];

    // Update fields
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        doctor[field] = body[field];
      }
    });

    // Set updatedAt timestamp
    doctor.updatedAt = new Date();

    const updatedDoctor = await doctor.save();

    // Return updated doctor without sensitive fields
    const doctorResponse = updatedDoctor.toObject();
    delete doctorResponse.password;
    delete doctorResponse.__v;

    return NextResponse.json({
      success: true,
      message: "Doctor profile updated successfully",
      data: doctorResponse
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating doctor profile:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json({
        success: false,
        message: `Doctor with this ${field} already exists`
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      message: "Failed to update doctor profile",
      error: error.message
    }, { status: 500 });
  }
}, ['doctor']);