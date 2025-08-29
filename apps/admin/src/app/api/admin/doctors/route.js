

import _db from "../../../../../../../packages/lib/src/db.js";
import DoctorModel from "../../../../../../../packages/lib/src/models/Vendor/Docters.model.js";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";
import bcrypt from "bcryptjs";

await _db();

export const POST = async (req) => {
  const body = await req.json();
  const {
    name,
    email,
    phone,
    gender,
    registrationNumber,
    doctorType, 
    specialties,
    diseases, 
    experience,
    clinicName,
    clinicAddress,
    state,
    city,
    pincode,
    profileImage,
    qualification,
    registrationYear,
    password,
    physicalConsultationStartTime,
    physicalConsultationEndTime,
    faculty,
    assistantName,
    assistantContact,
    doctorAvailability,
    landline,
    workingWithHospital,
    videoConsultation,
  } = body;

  // 1️⃣ Validate required fields
  if (
    !name ||
    !email ||
    !phone ||
    !gender ||
    !registrationNumber ||
    !doctorType || 
    !specialties || !Array.isArray(specialties) || specialties.length === 0 || 
    !experience ||
    !clinicName ||
    !clinicAddress ||
    !state ||
    !city ||
    !pincode ||
    !password ||
    !physicalConsultationStartTime ||
    !physicalConsultationEndTime ||
    !assistantName ||
    !assistantContact ||
    !doctorAvailability ||
    workingWithHospital === undefined ||
    videoConsultation === undefined
  ) {
    return Response.json(
      { message: "All required fields must be provided" },
      { status: 400 }
    );
  }

  // 2️⃣ Check if email, phone, or registration number already exists
  const existingDoctor = await DoctorModel.findOne({
    $or: [{ email }, { phone }, { registrationNumber }],
  });
  if (existingDoctor) {
    return Response.json(
      { message: "Email, phone number, or registration number already in use" },
      { status: 400 }
    );
  }

  // 3️⃣ Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4️⃣ Create doctor
  const newDoctor = await DoctorModel.create({
    name,
    email,
    phone,
    gender,
    registrationNumber,
    doctorType,
    specialties,
    diseases: diseases || [],
    experience,
    clinicName,
    clinicAddress,
    state,
    city,
    pincode,
    profileImage: profileImage || null,
    qualification: qualification || null,
    registrationYear: registrationYear || null,
    password: hashedPassword,
    physicalConsultationStartTime,
    physicalConsultationEndTime,
    faculty: faculty || null,
    assistantName,
    assistantContact,
    doctorAvailability,
    landline: landline || null,
    workingWithHospital,
    videoConsultation,
  });

  // 5️⃣ Remove password before returning
  const doctorData = newDoctor.toObject();
  delete doctorData.password;

  return Response.json(
    { message: "Doctor created successfully", doctor: doctorData },
    { status: 201 }
  );
};

export const GET = async (req) => {
  const doctors = await DoctorModel.find().select("-password"); // Hide password
  return Response.json(doctors);
};

export const PUT = authMiddlewareAdmin(
  async (req) => {
    const { id, password, ...body } = await req.json();

    // If password is provided, hash it
    if (password) {
      body.password = await bcrypt.hash(password, 10);
    }
    
    // Legacy support for single specialization
    if (body.specialization && !body.specialties) {
      body.specialties = [body.specialization];
      delete body.specialization;
    }

    const updatedDoctor = await DoctorModel.findByIdAndUpdate(
      id,
      { ...body, updatedAt: Date.now() },
      { new: true }
    ).select("-password");

    if (!updatedDoctor) {
      return Response.json({ message: "Doctor not found" }, { status: 404 });
    }

    return Response.json(updatedDoctor);
  },
  ["superadmin"]
);

export const DELETE = authMiddlewareAdmin(
  async (req) => {
    const { id } = await req.json();
    const deleted = await DoctorModel.findByIdAndDelete(id);

    if (!deleted) {
      return Response.json({ message: "Doctor not found" }, { status: 404 });
    }

    return Response.json({ message: "Doctor deleted successfully" });
  },
  ["superadmin"]
);


    