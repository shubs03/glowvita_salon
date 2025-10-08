import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import PatientModel from '../../../../../../../packages/lib/src/models/Vendor/Patient.model.js';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

await _db();

// GET: Fetch all patients for the doctor
export const GET = authMiddlewareCrm(async (req) => {
  try {
    const doctorId = req.user._id;
    
    const patients = await PatientModel.find({ doctorId }).sort({ createdAt: -1 });
    
    return NextResponse.json(patients);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch patients', error: error.message }, { status: 500 });
  }
}, ['doctor']);

// POST: Create a new patient
export const POST = authMiddlewareCrm(async (req) => {
  try {
    const doctorId = req.user._id;
    const patientData = await req.json();

    // Validate required fields
    if (!patientData.name || !patientData.email || !patientData.phone || 
        !patientData.gender || !patientData.birthdayDate || !patientData.country) {
      return NextResponse.json({ success: false, message: 'Required fields missing' }, { status: 400 });
    }

    // Check if patient with same email or phone already exists
    const existingPatient = await PatientModel.findOne({
      $or: [
        { email: patientData.email },
        { phone: patientData.phone }
      ],
      doctorId
    });

    if (existingPatient) {
      return NextResponse.json({ success: false, message: 'Patient with this email or phone already exists' }, { status: 400 });
    }

    // Create new patient
    const newPatient = new PatientModel({
      ...patientData,
      doctorId,
      lastConsultation: new Date(),
    });

    const savedPatient = await newPatient.save();
    
    return NextResponse.json({ success: true, data: savedPatient }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to create patient', error: error.message }, { status: 500 });
  }
}, ['doctor']);

// PUT: Update a patient
export const PUT = authMiddlewareCrm(async (req) => {
  try {
    const doctorId = req.user._id;
    const { id, ...updateData } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'Patient ID is required' }, { status: 400 });
    }

    // Validate required fields
    if (!updateData.name || !updateData.email || !updateData.phone || 
        !updateData.gender || !updateData.birthdayDate || !updateData.country) {
      return NextResponse.json({ success: false, message: 'Required fields missing' }, { status: 400 });
    }

    // Check if another patient with same email or phone already exists
    const existingPatient = await PatientModel.findOne({
      $or: [
        { email: updateData.email },
        { phone: updateData.phone }
      ],
      doctorId,
      _id: { $ne: id }
    });

    if (existingPatient) {
      return NextResponse.json({ success: false, message: 'Patient with this email or phone already exists' }, { status: 400 });
    }

    const updatedPatient = await PatientModel.findOneAndUpdate(
      { _id: id, doctorId },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedPatient) {
      return NextResponse.json({ success: false, message: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedPatient });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update patient', error: error.message }, { status: 500 });
  }
}, ['doctor']);

// DELETE: Remove a patient
export const DELETE = authMiddlewareCrm(async (req) => {
  try {
    const doctorId = req.user._id;
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'Patient ID is required' }, { status: 400 });
    }

    const deletedPatient = await PatientModel.findOneAndDelete({ _id: id, doctorId });

    if (!deletedPatient) {
      return NextResponse.json({ success: false, message: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete patient', error: error.message }, { status: 500 });
  }
}, ['doctor']);