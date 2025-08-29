
import _db from "../../../../../../../packages/lib/src/db.js";
import DoctorModel from "../../../../../../../packages/lib/src/models/Vendor/Docters.model.js";
import { authMiddlewareCrm } from "../../../../middlewareCrm.js"; // Using CRM middleware for vendor context
import bcrypt from "bcryptjs";

await _db();

const handler = async (req) => {
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
  
  // The authenticated vendor/user is attached to `req.user` by the middleware
  const vendorId = req.user?._id;

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

  // 2️⃣ Check if email, phone, or registration number already exists *for this vendor*
  if (vendorId) {
      const existingDoctor = await DoctorModel.findOne({
        vendorId, // Scope the search to the current vendor
        $or: [{ email }, { phone }, { registrationNumber }],
      });
      if (existingDoctor) {
        let field = 'email';
        if(existingDoctor.phone === phone) field = 'phone number';
        if(existingDoctor.registrationNumber === registrationNumber) field = 'registration number';

        return Response.json(
          { message: `A doctor with this ${field} already exists in your salon.` },
          { status: 409 } // 409 Conflict is more appropriate
        );
      }
  }


  // 3️⃣ Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4️⃣ Create doctor
  const newDoctor = await DoctorModel.create({
    vendorId, // Associate with the logged-in vendor
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

// Use CRM middleware for requests coming from the CRM panel
export const POST = authMiddlewareCrm(handler, ["vendor", "staff"]);


export const GET = async (req) => {
  const doctors = await DoctorModel.find().select("-password"); // Hide password
  return Response.json(doctors);
};

export const PUT = authMiddlewareCrm(
  async (req) => {
    const { id, password, ...body } = await req.json();
    const vendorId = req.user._id;

    // If password is provided, hash it
    if (password) {
      body.password = await bcrypt.hash(password, 10);
    }
    
    // Legacy support for single specialization
    if (body.specialization && !body.specialties) {
      body.specialties = [body.specialization];
      delete body.specialization;
    }

    const updatedDoctor = await DoctorModel.findOneAndUpdate(
      { _id: id, vendorId }, // Ensure vendor can only update their own doctors
      { ...body, updatedAt: Date.now() },
      { new: true }
    ).select("-password");

    if (!updatedDoctor) {
      return Response.json({ message: "Doctor not found or you don't have permission to edit." }, { status: 404 });
    }

    return Response.json(updatedDoctor);
  },
  ["vendor", "staff"]
);

export const DELETE = authMiddlewareCrm(
  async (req) => {
    const { id } = await req.json();
    const vendorId = req.user._id;
    
    const deleted = await DoctorModel.findOneAndDelete({ _id: id, vendorId }); // Ensure vendor can only delete their own doctors

    if (!deleted) {
      return Response.json({ message: "Doctor not found or you don't have permission to delete." }, { status: 404 });
    }

    return Response.json({ message: "Doctor deleted successfully" });
  },
  ["vendor"]
);
