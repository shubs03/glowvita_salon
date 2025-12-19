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
        
        console.log(`=== STAFF FETCH DEBUG INFO ===`);
        console.log(`User ID: ${ownerId} (type: ${typeof ownerId})`);
        console.log(`User Role: ${userRole}`);
        console.log(`Is valid ObjectId: ${mongoose.Types.ObjectId.isValid(ownerId)}`);
        
        let staff = [];
        let vendorIdToUse = null;
        
        if (userRole === 'vendor') {
            console.log('User is a vendor - using their ID as vendorId');
            // Convert ownerId to ObjectId for consistent querying
            if (typeof ownerId === 'string' && mongoose.Types.ObjectId.isValid(ownerId)) {
                vendorIdToUse = new mongoose.Types.ObjectId(ownerId);
            } else if (ownerId instanceof mongoose.Types.ObjectId) {
                vendorIdToUse = ownerId;
            } else {
                // Fallback - try to convert
                try {
                    vendorIdToUse = new mongoose.Types.ObjectId(ownerId.toString());
                } catch (err) {
                    console.error('Could not convert vendor ID to ObjectId:', err);
                    vendorIdToUse = ownerId;
                }
            }
        } else if (userRole === 'staff') {
            console.log('User is a staff member - finding their vendorId');
            // Find the staff member to get their vendorId
            const staffMember = await StaffModel.findById(ownerId);
            console.log(`Staff member found: ${!!staffMember}`);
            if (staffMember && staffMember.vendorId) {
                console.log(`Staff member vendorId: ${staffMember.vendorId} (type: ${typeof staffMember.vendorId})`);
                // Convert staff member's vendorId to ObjectId for consistent querying
                if (typeof staffMember.vendorId === 'string' && mongoose.Types.ObjectId.isValid(staffMember.vendorId)) {
                    vendorIdToUse = new mongoose.Types.ObjectId(staffMember.vendorId);
                } else if (staffMember.vendorId instanceof mongoose.Types.ObjectId) {
                    vendorIdToUse = staffMember.vendorId;
                } else {
                    // Fallback - try to convert
                    try {
                        vendorIdToUse = new mongoose.Types.ObjectId(staffMember.vendorId.toString());
                    } catch (err) {
                        console.error('Could not convert staff member vendor ID to ObjectId:', err);
                        vendorIdToUse = staffMember.vendorId;
                    }
                }
            } else {
                console.log('Could not find staff member or vendorId');
                // Fallback - try using the ownerId directly
                vendorIdToUse = ownerId;
            }
        }
        
        console.log(`Vendor ID to use for query: ${vendorIdToUse} (type: ${typeof vendorIdToUse})`);
        
        if (vendorIdToUse) {
            // Try multiple query approaches
            console.log('=== TRYING DIFFERENT QUERY APPROACHES ===');
            
            // Approach 1: Direct query with the vendorId
            console.log('Approach 1: Direct query');
            staff = await StaffModel.find({ vendorId: vendorIdToUse });
            console.log(`Found ${staff.length} staff members with direct query`);
            
            // Approach 2: If none found, try with ObjectId conversion
            if (staff.length === 0 && typeof vendorIdToUse === 'string' && mongoose.Types.ObjectId.isValid(vendorIdToUse)) {
                console.log('Approach 2: ObjectId conversion');
                try {
                    const objectIdVersion = new mongoose.Types.ObjectId(vendorIdToUse);
                    staff = await StaffModel.find({ vendorId: objectIdVersion });
                    console.log(`Found ${staff.length} staff members with ObjectId conversion`);
                } catch (err) {
                    console.error('ObjectId conversion failed:', err.message);
                }
            }
            
            // Approach 3: If still none found, try string conversion
            if (staff.length === 0 && typeof vendorIdToUse === 'object') {
                console.log('Approach 3: String conversion');
                try {
                    const stringVersion = vendorIdToUse.toString();
                    staff = await StaffModel.find({ vendorId: stringVersion });
                    console.log(`Found ${staff.length} staff members with string conversion`);
                } catch (err) {
                    console.error('String conversion failed:', err.message);
                }
            }
            
            // Approach 4: Find all staff and manually check (debug only)
            if (staff.length === 0) {
                console.log('Approach 4: Manual check of all staff (DEBUG)');
                const allStaff = await StaffModel.find({});
                console.log(`Total staff in DB: ${allStaff.length}`);
                console.log('All staff vendorIds:');
                allStaff.forEach(s => {
                    console.log(`  - Staff: ${s.fullName} (${s._id}), vendorId: ${s.vendorId} (type: ${typeof s.vendorId})`);
                });
                
                // Try to match manually
                const manualMatch = allStaff.filter(s => {
                    if (!s.vendorId) return false;
                    
                    // Try different comparison methods
                    try {
                        if (s.vendorId.toString() === vendorIdToUse.toString()) return true;
                        if (s.vendorId.equals && s.vendorId.equals(vendorIdToUse)) return true;
                        
                        // If both are ObjectIds, compare them
                        if (s.vendorId instanceof mongoose.Types.ObjectId && vendorIdToUse instanceof mongoose.Types.ObjectId) {
                            return s.vendorId.equals(vendorIdToUse);
                        }
                        
                        // If one is string and other is ObjectId, convert and compare
                        if (typeof s.vendorId === 'string' && mongoose.Types.ObjectId.isValid(s.vendorId) && vendorIdToUse instanceof mongoose.Types.ObjectId) {
                            return new mongoose.Types.ObjectId(s.vendorId).equals(vendorIdToUse);
                        }
                        
                        if (s.vendorId instanceof mongoose.Types.ObjectId && typeof vendorIdToUse === 'string' && mongoose.Types.ObjectId.isValid(vendorIdToUse)) {
                            return s.vendorId.equals(new mongoose.Types.ObjectId(vendorIdToUse));
                        }
                    } catch (err) {
                        console.error('Error in manual comparison:', err);
                    }
                    
                    return false;
                });
                
                console.log(`Manual match found ${manualMatch.length} staff members`);
                if (manualMatch.length > 0) {
                    staff = manualMatch;
                }
            }
        }
        
        console.log(`=== FINAL RESULT ===`);
        console.log(`Found ${staff.length} staff member(s).`);
        if (staff.length > 0) {
            console.log('Staff members:', staff.map(s => ({ 
                id: s._id, 
                fullName: s.fullName, 
                position: s.position, 
                emailAddress: s.emailAddress, 
                vendorId: s.vendorId,
                vendorIdType: typeof s.vendorId
            })));
        }
        
        return NextResponse.json(staff, { status: 200 });
    } catch (error) {
        console.error('Error fetching staff:', error);
        return NextResponse.json({ message: "Error fetching staff", error: error.message }, { status: 500 });
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

        if (!trimmedBody.fullName || !trimmedBody.emailAddress || !trimmedBody.mobileNo || !trimmedBody.position || !trimmedBody.password) {
            return NextResponse.json({ message: "Missing required fields, including password" }, { status: 400 });
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

        const hashedPassword = await bcrypt.hash(trimmedBody.password, 10);
        
        const newStaff = await StaffModel.create({
            ...trimmedBody,
            vendorId: ownerId,
            userType: userType, // Set the userType based on owner's role
            password: hashedPassword,
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
        
        // Handle password update
        if (updateData.password && updateData.password.trim() !== '') {
            updateData.password = await bcrypt.hash(updateData.password, 10);
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