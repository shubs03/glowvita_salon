
import { NextResponse } from 'next/server';
import StaffModel from '@repo/lib/models/staffModel';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';
import bcrypt from "bcryptjs";

await _db();

// GET all staff for a vendor
export const GET = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id;
        const staff = await StaffModel.find({ vendorId: vendorId });
        return NextResponse.json(staff, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error fetching staff", error: error.message }, { status: 500 });
    }
}, ['vendor']);

// POST a new staff member
export const POST = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id;
        const body = await req.json();

        // Basic validation
        if (!body.fullName || !body.emailAddress || !body.mobileNo || !body.position) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }
        
        // Generate a random password if not provided
        const password = body.password || Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newStaff = await StaffModel.create({
            ...body,
            vendorId: vendorId,
            password: hashedPassword,
        });

        const staffData = newStaff.toObject();
        delete staffData.password;

        return NextResponse.json({ message: "Staff created successfully", staff: staffData }, { status: 201 });
    } catch (error) {
        if (error.code === 11000) { // Handle duplicate key error for email
             return NextResponse.json({ message: "A staff member with this email already exists." }, { status: 409 });
        }
        return NextResponse.json({ message: "Error creating staff", error: error.message }, { status: 500 });
    }
}, ['vendor']);

// PUT (update) a staff member
export const PUT = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id;
        const { id, ...updateData } = await req.json();

        if (!id) {
            return NextResponse.json({ message: "Staff ID is required for update" }, { status: 400 });
        }
        
        // Ensure the staff member belongs to the vendor
        const staff = await StaffModel.findOne({ _id: id, vendorId: vendorId });
        if (!staff) {
             return NextResponse.json({ message: "Staff not found or access denied" }, { status: 404 });
        }

        const updatedStaff = await StaffModel.findByIdAndUpdate(id, updateData, { new: true });
        
        return NextResponse.json(updatedStaff, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error updating staff", error: error.message }, { status: 500 });
    }
}, ['vendor']);


// DELETE a staff member
export const DELETE = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id;
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: "Staff ID is required for deletion" }, { status: 400 });
        }

        const deletedStaff = await StaffModel.findOneAndDelete({ _id: id, vendorId: vendorId });

        if (!deletedStaff) {
            return NextResponse.json({ message: "Staff not found or access denied" }, { status: 404 });
        }

        return NextResponse.json({ message: "Staff deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error deleting staff", error: error.message }, { status: 500 });
    }
}, ['vendor']);
