import { NextResponse } from 'next/server';
import StaffModel from '@repo/lib/models/Vendor/Staff.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm';
import bcrypt from "bcryptjs";
import { uploadBase64, deleteFile } from '@repo/lib/utils/upload';
import mongoose from 'mongoose'; // Import mongoose directly

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

// GET all staff for a vendor or doctor
export const GET = authMiddlewareCrm(async (req) => {
    try {
        const ownerId = req.user.userId;
        const userRole = req.user.role;

        let vendorIdToUse = null;

        if (userRole === 'vendor' || userRole === 'doctor') {
            vendorIdToUse = ownerId;
        } else if (userRole === 'staff') {
            // Find the staff member to get their vendorId
            if (mongoose.Types.ObjectId.isValid(ownerId)) {
                const staffMember = await StaffModel.findById(ownerId).select('vendorId').lean();
                if (staffMember) {
                    vendorIdToUse = staffMember.vendorId;
                }
            }

            // If still not found, check if it was already provided in req.user
            if (!vendorIdToUse && req.user.vendorId) {
                vendorIdToUse = req.user.vendorId;
            }
        }

        if (!vendorIdToUse) {
            console.error('Staff API: Could not determine vendorId for user', ownerId);
            return NextResponse.json({ message: "Could not determine organization context" }, { status: 400 });
        }

        // Fetch staff with lean() for better performance and to avoid document overhead
        let staff = await StaffModel.find({ vendorId: vendorIdToUse }).lean();

        // Manual backup search if nothing found (handles edge cases with ID types)
        if (!staff || staff.length === 0) {
            try {
                const allStaff = await StaffModel.find({}).select('vendorId fullName').lean();
                const matched = allStaff.filter(s =>
                    s.vendorId && s.vendorId.toString() === vendorIdToUse.toString()
                );
                if (matched.length > 0) {
                    staff = await StaffModel.find({ _id: { $in: matched.map(m => m._id) } }).lean();
                }
            } catch (err) {
                console.error('Staff manual fallback failed:', err);
            }
        }

        // Map the earnings summary from the consolidated fields
        const formattedStaff = staff.map(s => {
            return {
                ...s,
                id: s._id, // Add id for frontend convenience
                earningsSummary: {
                    netBalance: s.netBalance || 0,
                    accumulatedEarnings: s.accumulatedEarnings || 0,
                    totalPaidOut: s.totalPaidOut || 0,
                    commissionCount: s.commissionCount || 0
                }
            };
        });

        return NextResponse.json(formattedStaff, { status: 200 });
    } catch (error) {
        console.error('Error fetching staff list:', error);
        return NextResponse.json({
            message: "Error fetching staff",
            error: error.message
        }, { status: 500 });
    }
}, ['vendor', 'doctor', 'staff']); // Allow staff role as well

// POST a new staff member
export const POST = authMiddlewareCrm(async (req) => {
    try {
        // Clean up indexes before creating a new entry
        await cleanupOldIndexes();

        const ownerId = req.user.userId.toString();
        const userType = req.user.role === 'doctor' ? 'Doctor' : 'Vendor';
        const body = await req.json();

        const trimmedBody = {
            ...body,
            emailAddress: body.emailAddress?.trim(),
            mobileNo: body.mobileNo?.trim()
        };

        console.log(`Creating staff for owner: ${ownerId} (Type: ${userType})`);
        console.log('Request payload:', trimmedBody);
        console.log('Commission Info:', {
            commission: trimmedBody.commission,
            commissionRate: trimmedBody.commissionRate,
            type: typeof trimmedBody.commissionRate
        });

        if (!trimmedBody.fullName || !trimmedBody.emailAddress || !trimmedBody.mobileNo || !trimmedBody.position) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const existingEmailStaff = await StaffModel.findOne({
            vendorId: ownerId,
            emailAddress: { $regex: new RegExp(`^${trimmedBody.emailAddress}$`, 'i') }
        });
        if (existingEmailStaff) {
            return NextResponse.json({
                message: `A staff member with this email already exists for this ${userType.toLowerCase()}.`,
                field: 'emailAddress',
                value: trimmedBody.emailAddress
            }, { status: 409 });
        }

        const existingMobileStaff = await StaffModel.findOne({
            vendorId: ownerId,
            mobileNo: trimmedBody.mobileNo
        });
        if (existingMobileStaff) {
            return NextResponse.json({
                message: `A staff member with this mobile number already exists for this ${userType.toLowerCase()}.`,
                field: 'mobileNo',
                value: trimmedBody.mobileNo
            }, { status: 409 });
        }

        // Handle photo upload if provided
        if (trimmedBody.photo) {
            const fileName = `staff-${ownerId}-${Date.now()}`;
            const imageUrl = await uploadBase64(trimmedBody.photo, fileName);

            if (!imageUrl) {
                return NextResponse.json(
                    { message: "Failed to upload photo" },
                    { status: 500 }
                );
            }

            trimmedBody.photo = imageUrl;
        }

        // Handle commission enabled date
        if (trimmedBody.commission) {
            trimmedBody.commissionEnabledDate = new Date();
        }

        // Validate working hours before creating
        const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        // Dynamically import VendorWorkingHours to avoid circular dependency
        const { default: VendorWorkingHours } = await import('@repo/lib/models/Vendor/VendorWorkingHours.model');

        for (const day of dayNames) {
            const dayAvailableField = `${day}Available`;
            const dayField = `${day}Slots`;

            // Only validate if the day is available and has slots defined
            if (trimmedBody[dayAvailableField] && trimmedBody[dayField] && trimmedBody[dayField].length > 0) {
                // Get vendor working hours for the specific day
                const vendorHours = await VendorWorkingHours.getVendorHoursForDay(ownerId, day);

                // If vendor is closed on this day, staff cannot work
                if (!vendorHours) {
                    return NextResponse.json({ message: `Vendor is closed on ${day}. Staff cannot be scheduled.` }, { status: 400 });
                }

                // Validate each staff slot
                for (const slot of trimmedBody[dayField]) {
                    const staffStartMinutes = StaffModel.timeToMinutes(slot.startTime);
                    const staffEndMinutes = StaffModel.timeToMinutes(slot.endTime);

                    // Check if staff hours are within vendor hours
                    if (staffStartMinutes < vendorHours.openMinutes || staffEndMinutes > vendorHours.closeMinutes) {
                        return NextResponse.json({ message: `Staff working hours must be within vendor hours (${vendorHours.openTime} - ${vendorHours.closeTime}) on ${day}` }, { status: 400 });
                    }

                    // Check if staff start time is before end time
                    if (staffStartMinutes >= staffEndMinutes) {
                        return NextResponse.json({ message: `Staff start time must be before end time on ${day}` }, { status: 400 });
                    }
                }
            }
        }

        // Check if schema has tempPassword, if not add it dynamically (fixes caching issues)
        if (!StaffModel.schema.paths.tempPassword) {
            StaffModel.schema.add({
                tempPassword: { type: String, select: false }
            });
        }

        // Generate a random temporary password instead of using one from the request
        const generatedPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2).toUpperCase() + "!1";
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        const newStaff = await StaffModel.create({
            ...trimmedBody,
            vendorId: ownerId,
            userType: userType, // Set the userType based on owner's role
            password: hashedPassword,
            tempPassword: generatedPassword, // Store plain text for email
        });

        const staffData = newStaff.toObject();
        delete staffData.password;

        return NextResponse.json({ message: "Staff created successfully", staff: staffData }, { status: 201 });
    } catch (error) {
        console.error('Error creating staff:', error);

        // Handle validation errors
        if (error.name === 'ValidationError' || error.message.includes('Vendor is closed') || error.message.includes('Staff working hours must be within vendor hours')) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0];
            const userType = req.user.role === 'doctor' ? 'doctor' : 'vendor';
            if (duplicateField === 'emailAddress' || duplicateField.includes('emailAddress')) {
                return NextResponse.json({
                    message: `A staff member with this email already exists for this ${userType}.`,
                    field: 'emailAddress'
                }, { status: 409 });
            } else if (duplicateField === 'mobileNo' || duplicateField.includes('mobileNo')) {
                return NextResponse.json({
                    message: `A staff member with this mobile number already exists for this ${userType}.`,
                    field: 'mobileNo'
                }, { status: 409 });
            } else {
                return NextResponse.json({
                    message: `A staff member with these details already exists for this ${userType}.`
                }, { status: 409 });
            }
        }
        return NextResponse.json({ message: "Error creating staff", error: error.message }, { status: 500 });
    }
}, ['vendor', 'doctor']);

// PUT (update) a staff member
export const PUT = authMiddlewareCrm(async (req) => {
    try {
        const ownerId = req.user.userId;
        const { _id, ...updateData } = await req.json();

        // DEBUG: Check if schema has commissionRate
        const schemaPaths = Object.keys(StaffModel.schema.paths);
        const hasCommissionRate = schemaPaths.includes('commissionRate');
        console.log(`DEBUG: Schema check - commissionRate exists? ${hasCommissionRate}`);
        console.log(`DEBUG: Schema paths count: ${schemaPaths.length}`);

        console.log('Update Staff Request:', {
            id: _id,
            updateDataKeys: Object.keys(updateData),
            commission: updateData.commission,
            commissionRate: updateData.commissionRate
        });

        if (!_id) {
            return NextResponse.json({ message: "Staff ID is required for update" }, { status: 400 });
        }

        // Find the existing staff member
        const staff = await StaffModel.findOne({ _id: _id, vendorId: ownerId });
        if (!staff) {
            return NextResponse.json({ message: "Staff not found or access denied" }, { status: 404 });
        }

        // Check for email conflicts
        if (updateData.emailAddress && updateData.emailAddress !== staff.emailAddress) {
            const existingEmailStaff = await StaffModel.findOne({
                vendorId: ownerId,
                emailAddress: updateData.emailAddress.trim(),
                _id: { $ne: _id }
            });
            if (existingEmailStaff) {
                return NextResponse.json({ message: "A staff member with this email already exists." }, { status: 409 });
            }
        }

        // Check for mobile number conflicts
        if (updateData.mobileNo && updateData.mobileNo !== staff.mobileNo) {
            const existingMobileStaff = await StaffModel.findOne({
                vendorId: ownerId,
                mobileNo: updateData.mobileNo.trim(),
                _id: { $ne: _id }
            });
            if (existingMobileStaff) {
                return NextResponse.json({ message: "A staff member with this mobile number already exists." }, { status: 409 });
            }
        }

        // Explicitly handle commissionRate to ensure it's a number and saved
        if (updateData.commissionRate !== undefined) {
            updateData.commissionRate = Number(updateData.commissionRate);
            console.log(`DEBUG: Explicitly setting commissionRate to ${updateData.commissionRate}`);
        }

        // Handle commission enabled date change
        if (updateData.commission === true && staff.commission === false) {
            updateData.commissionEnabledDate = new Date();
        } else if (updateData.commission === false && staff.commission === true) {
            updateData.commissionEnabledDate = null;
        }

        // Check if schema has tempPassword, if not add it dynamically (fixes caching issues)
        if (!StaffModel.schema.paths.tempPassword) {
            StaffModel.schema.add({
                tempPassword: { type: String, select: false }
            });
        }

        // Handle password update
        if (updateData.password && updateData.password.trim() !== '') {
            const rawPassword = updateData.password;
            updateData.password = await bcrypt.hash(updateData.password, 10);
            updateData.tempPassword = rawPassword;
        } else {
            delete updateData.password;
        }

        // Handle photo upload if provided
        if (updateData.photo !== undefined) {
            if (updateData.photo) {
                // Upload new image to VPS
                const fileName = `staff-${ownerId}-${Date.now()}`;
                const imageUrl = await uploadBase64(updateData.photo, fileName);

                if (!imageUrl) {
                    return NextResponse.json(
                        { message: "Failed to upload photo" },
                        { status: 500 }
                    );
                }

                // Delete old image from VPS if it exists
                if (staff.photo) {
                    await deleteFile(staff.photo);
                }

                updateData.photo = imageUrl;
            } else {
                // If image is null/empty, remove it
                updateData.photo = null;

                // Delete old image from VPS if it exists
                if (staff.photo) {
                    await deleteFile(staff.photo);
                }
            }
        }

        // Create a temporary staff instance to validate working hours before updating
        // This is necessary because findByIdAndUpdate doesn't trigger pre-save hooks
        const updatedStaffData = {
            ...staff.toObject(),
            ...updateData
        };

        // Only run validation if working hours are being modified
        const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        let needsValidation = false;

        for (const day of dayNames) {
            const dayField = `${day}Slots`;
            if (updateData.hasOwnProperty(dayField)) {
                needsValidation = true;
                break;
            }
        }

        if (needsValidation) {
            // Dynamically import VendorWorkingHours to avoid circular dependency
            const { default: VendorWorkingHours } = await import('@repo/lib/models/Vendor/VendorWorkingHours.model');

            for (const day of dayNames) {
                const dayAvailableField = `${day}Available`;
                const dayField = `${day}Slots`;

                // Check if this day is being updated
                if (updateData.hasOwnProperty(dayField)) {
                    // Only validate if the day is available and has slots defined
                    if (updatedStaffData[dayAvailableField] && updatedStaffData[dayField] && updatedStaffData[dayField].length > 0) {
                        // Get vendor working hours for the specific day
                        const vendorHours = await VendorWorkingHours.getVendorHoursForDay(ownerId, day);

                        // If vendor is closed on this day, staff cannot work
                        if (!vendorHours) {
                            return NextResponse.json({ message: `Vendor is closed on ${day}. Staff cannot be scheduled.` }, { status: 400 });
                        }

                        // Validate each staff slot
                        for (const slot of updatedStaffData[dayField]) {
                            const staffStartMinutes = StaffModel.timeToMinutes(slot.startTime);
                            const staffEndMinutes = StaffModel.timeToMinutes(slot.endTime);

                            // Check if staff hours are within vendor hours
                            if (staffStartMinutes < vendorHours.openMinutes || staffEndMinutes > vendorHours.closeMinutes) {
                                return NextResponse.json({ message: `Staff working hours must be within vendor hours (${vendorHours.openTime} - ${vendorHours.closeTime}) on ${day}` }, { status: 400 });
                            }

                            // Check if staff start time is before end time
                            if (staffStartMinutes >= staffEndMinutes) {
                                return NextResponse.json({ message: `Staff start time must be before end time on ${day}` }, { status: 400 });
                            }
                        }
                    }
                }
            }
        }

        // Update the staff member
        const updatedStaff = await StaffModel.findByIdAndUpdate(_id, updateData, { new: true });

        return NextResponse.json(updatedStaff, { status: 200 });
    } catch (error) {
        console.error('Error updating staff:', error);

        // Handle validation errors
        if (error.name === 'ValidationError' ||
            (error.message && (error.message.includes('Vendor is closed') ||
                error.message.includes('Staff working hours must be within vendor hours')))) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        if (error.code === 11000) {
            return NextResponse.json({ message: "A staff member with these details already exists." }, { status: 409 });
        }
        return NextResponse.json({ message: "Error updating staff", error: error.message }, { status: 500 });
    }
}, ['vendor', 'doctor']);

// DELETE a staff member
export const DELETE = authMiddlewareCrm(async (req) => {
    try {
        const ownerId = req.user.userId;
        const url = new URL(req.url);
        const id = url.searchParams.get('id') || (await req.json()).id;

        if (!id) {
            return NextResponse.json({ message: "Staff ID is required for deletion" }, { status: 400 });
        }

        const deletedStaff = await StaffModel.findOneAndDelete({ _id: id, vendorId: ownerId });

        if (!deletedStaff) {
            return NextResponse.json({ message: "Staff not found or access denied" }, { status: 404 });
        }

        // Delete photo from VPS if it exists
        if (deletedStaff.photo) {
            await deleteFile(deletedStaff.photo);
        }

        return NextResponse.json({ message: "Staff deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error deleting staff", error: error.message }, { status: 500 });
    }
}, ['vendor', 'doctor']);