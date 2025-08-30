import { NextResponse } from 'next/server';
import StaffModel from '../../../../../../../packages/lib/src/models/Vendor/Staff.model.js';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';
import bcrypt from "bcryptjs";

await _db();

// Utility function to clean up old problematic indexes and ensure correct ones
const cleanupOldIndexes = async () => {
    try {
        const collection = StaffModel.collection;
        const indexes = await collection.indexes();
        
        console.log('Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));
        
        // Drop all unique indexes on emailAddress or mobileNo (global or compound)
        const problematicIndexes = indexes.filter(idx => 
            (idx.key.emailAddress || idx.key.mobileNo) && idx.unique === true
        );
        
        for (const index of problematicIndexes) {
            console.log('Dropping index:', index.name);
            await collection.dropIndex(index.name);
        }

        // Create compound unique indexes
        await collection.createIndex({ vendorId: 1, emailAddress: 1 }, { unique: true });
        await collection.createIndex({ vendorId: 1, mobileNo: 1 }, { unique: true });
        console.log('Created compound unique indexes for vendorId with emailAddress and mobileNo');
    } catch (error) {
        console.error('Index cleanup error:', error.message);
    }
};

// GET all staff for a vendor
export const GET = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id;
        
        console.log('Fetching staff for vendor:', vendorId);
        
        const staff = await StaffModel.find({ vendorId: vendorId });
        
        console.log('Found staff count:', staff.length);
        if (staff.length > 0) {
            console.log('Existing staff emails:', staff.map(s => s.emailAddress));
            console.log('Existing staff mobiles:', staff.map(s => s.mobileNo));
        }
        
        return NextResponse.json(staff, { status: 200 });
    } catch (error) {
        console.error('Error fetching staff:', error);
        return NextResponse.json({ message: "Error fetching staff", error: error.message }, { status: 500 });
    }
}, ['vendor']);

// POST a new staff member
export const POST = authMiddlewareCrm(async (req) => {
    try {
        // Clean up indexes before creating a new entry
        await cleanupOldIndexes();
        
        const vendorId = req.user._id.toString();
        const body = await req.json();
        
        // Trim input to avoid whitespace issues
        const trimmedBody = {
            ...body,
            emailAddress: body.emailAddress?.trim(),
            mobileNo: body.mobileNo?.trim()
        };
        
        console.log('Creating staff for vendor:', vendorId);
        console.log('Request payload:', trimmedBody);

        // Basic validation
        if (!trimmedBody.fullName || !trimmedBody.emailAddress || !trimmedBody.mobileNo || !trimmedBody.position || !trimmedBody.password) {
            console.log('Missing fields in request:', {
                fullName: !!trimmedBody.fullName,
                emailAddress: !!trimmedBody.emailAddress,
                mobileNo: !!trimmedBody.mobileNo,
                position: !!trimmedBody.position,
                password: !!trimmedBody.password
            });
            return NextResponse.json({ message: "Missing required fields, including password" }, { status: 400 });
        }
        
        // Check for duplicate email (case-insensitive)
        const existingEmailStaff = await StaffModel.findOne({ 
            vendorId: vendorId, 
            emailAddress: { $regex: new RegExp(`^${trimmedBody.emailAddress}$`, 'i') }
        });
        if (existingEmailStaff) {
            console.log('Duplicate email found:', existingEmailStaff.emailAddress, 'for vendor:', vendorId);
            return NextResponse.json({ 
                message: "A staff member with this email already exists for this vendor.",
                field: 'emailAddress',
                value: trimmedBody.emailAddress
            }, { status: 409 });
        }
        
        // Check for duplicate mobile number
        const existingMobileStaff = await StaffModel.findOne({ 
            vendorId: vendorId, 
            mobileNo: trimmedBody.mobileNo 
        });
        if (existingMobileStaff) {
            console.log('Duplicate mobile found:', existingMobileStaff.mobileNo, 'for vendor:', vendorId);
            return NextResponse.json({ 
                message: "A staff member with this mobile number already exists for this vendor.",
                field: 'mobileNo',
                value: trimmedBody.mobileNo
            }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(trimmedBody.password, 10);
        
        console.log('Creating new staff with hashed password');
        
        const newStaff = await StaffModel.create({
            ...trimmedBody,
            vendorId: vendorId,
            password: hashedPassword,
        });
        
        console.log('Staff created successfully:', newStaff._id);

        const staffData = newStaff.toObject();
        delete staffData.password;

        return NextResponse.json({ message: "Staff created successfully", staff: staffData }, { status: 201 });
    } catch (error) {
        console.error('Error creating staff:', error);
        
        if (error.code === 11000) {
            console.log('Duplicate key error details:', error.keyPattern, error.keyValue);
            const duplicateField = Object.keys(error.keyPattern)[0];
            if (duplicateField === 'emailAddress' || duplicateField.includes('emailAddress')) {
                return NextResponse.json({ 
                    message: "A staff member with this email already exists for this vendor.",
                    field: 'emailAddress',
                    value: error.keyValue?.emailAddress || trimmedBody.emailAddress
                }, { status: 409 });
            } else if (duplicateField === 'mobileNo' || duplicateField.includes('mobileNo')) {
                return NextResponse.json({ 
                    message: "A staff member with this mobile number already exists for this vendor.",
                    field: 'mobileNo', 
                    value: error.keyValue?.mobileNo || trimmedBody.mobileNo
                }, { status: 409 });
            } else {
                return NextResponse.json({ 
                    message: "A staff member with these details already exists for this vendor.",
                    duplicateField: duplicateField,
                    keyPattern: error.keyPattern
                }, { status: 409 });
            }
        }
        return NextResponse.json({ message: "Error creating staff", error: error.message }, { status: 500 });
    }
}, ['vendor']);

// PUT (update) a staff member
export const PUT = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id;
        const { _id, ...updateData } = await req.json();

        if (!_id) {
            return NextResponse.json({ message: "Staff ID is required for update" }, { status: 400 });
        }
        
        // Ensure the staff member belongs to the vendor
        const staff = await StaffModel.findOne({ _id: _id, vendorId: vendorId });
        if (!staff) {
            return NextResponse.json({ message: "Staff not found or access denied" }, { status: 404 });
        }
        
        // Check for duplicate email (excluding current staff member)
        if (updateData.emailAddress && updateData.emailAddress !== staff.emailAddress) {
            const existingEmailStaff = await StaffModel.findOne({ 
                vendorId, 
                emailAddress: updateData.emailAddress.trim(), 
                _id: { $ne: _id } 
            });
            if (existingEmailStaff) {
                return NextResponse.json({ message: "A staff member with this email already exists for this vendor." }, { status: 409 });
            }
        }
        
        // Check for duplicate mobile number (excluding current staff member)
        if (updateData.mobileNo && updateData.mobileNo !== staff.mobileNo) {
            const existingMobileStaff = await StaffModel.findOne({ 
                vendorId, 
                mobileNo: updateData.mobileNo.trim(), 
                _id: { $ne: _id } 
            });
            if (existingMobileStaff) {
                return NextResponse.json({ message: "A staff member with this mobile number already exists for this vendor." }, { status: 409 });
            }
        }
        
        // If password is being updated, hash it
        if (updateData.password && updateData.password.trim() !== '') {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        } else {
            delete updateData.password;
        }

        const updatedStaff = await StaffModel.findByIdAndUpdate(_id, updateData, { new: true });
        
        return NextResponse.json(updatedStaff, { status: 200 });
    } catch (error) {
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0];
            if (duplicateField === 'emailAddress') {
                return NextResponse.json({ message: "A staff member with this email already exists for this vendor." }, { status: 409 });
            } else if (duplicateField === 'mobileNo') {
                return NextResponse.json({ message: "A staff member with this mobile number already exists for this vendor." }, { status: 409 });
            } else {
                return NextResponse.json({ message: "A staff member with these details already exists for this vendor." }, { status: 409 });
            }
        }
        return NextResponse.json({ message: "Error updating staff", error: error.message }, { status: 500 });
    }
}, ['vendor']);

// DELETE a staff member
export const DELETE = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id;
        const url = new URL(req.url);
        const id = url.searchParams.get('id') || (await req.json()).id;

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