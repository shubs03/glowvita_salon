import { NextResponse } from 'next/server';
import VendorWorkingHours from '@repo/lib/models/vendor/VendorWorkingHours.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm';

await _db();

// GET working hours for the vendor
export const GET = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id;

        // Find or create working hours for the vendor
        let workingHours = await VendorWorkingHours.findOne({ vendor: vendorId });

        if (!workingHours) {
            // Create default working hours if none exist
            workingHours = await VendorWorkingHours.create({ vendor: vendorId });
        }

        return NextResponse.json(workingHours, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error fetching working hours", error: error.message }, { status: 500 });
    }
}, ['vendor']);

// Update working hours
export const PUT = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id;
        const updateData = await req.json();

        // Validate the update data
        if (!updateData.workingHours) {
            return NextResponse.json({ message: "Working hours data is required" }, { status: 400 });
        }

        // Update or create working hours
        const updatedHours = await VendorWorkingHours.findOneAndUpdate(
            { vendor: vendorId },
            { 
                $set: { 
                    workingHours: updateData.workingHours,
                    timezone: updateData.timezone || 'Asia/Kolkata'
                } 
            },
            { 
                new: true,
                upsert: true,
                runValidators: true 
            }
        );

        return NextResponse.json({ 
            message: "Working hours updated successfully", 
            data: updatedHours 
        }, { status: 200 });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return NextResponse.json({ 
                message: "Validation error", 
                error: error.message 
            }, { status: 400 });
        }
        return NextResponse.json({ 
            message: "Error updating working hours", 
            error: error.message 
        }, { status: 500 });
    }
}, ['vendor']);

// Add special hours
export const POST = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id;
        const { date, isOpen, hours, description } = await req.json();

        // Validate the special hours data
        if (!date || !hours || !Array.isArray(hours)) {
            return NextResponse.json({ 
                message: "Date and hours array are required" 
            }, { status: 400 });
        }

        const specialHour = {
            date: new Date(date),
            isOpen: isOpen !== undefined ? isOpen : true,
            hours: hours.map(h => ({
                openTime: h.openTime,
                closeTime: h.closeTime
            })),
            description: description || ''
        };

        // Add to special hours array
        const updatedHours = await VendorWorkingHours.findOneAndUpdate(
            { vendor: vendorId },
            { 
                $push: { 
                    specialHours: specialHour 
                } 
            },
            { 
                new: true,
                upsert: true 
            }
        );

        return NextResponse.json({ 
            message: "Special hours added successfully", 
            data: updatedHours 
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ 
            message: "Error adding special hours", 
            error: error.message 
        }, { status: 500 });
    }
}, ['vendor']);

// Remove special hours
export const DELETE = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id;
        const url = new URL(req.url);
        const specialHourId = url.searchParams.get('id');

        if (!specialHourId) {
            return NextResponse.json({ 
                message: "Special hour ID is required" 
            }, { status: 400 });
        }

        const updatedHours = await VendorWorkingHours.findOneAndUpdate(
            { vendor: vendorId },
            { 
                $pull: { 
                    specialHours: { _id: specialHourId } 
                } 
            },
            { new: true }
        );

        if (!updatedHours) {
            return NextResponse.json({ 
                message: "Working hours not found" 
            }, { status: 404 });
        }

        return NextResponse.json({ 
            message: "Special hours removed successfully", 
            data: updatedHours 
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ 
            message: "Error removing special hours", 
            error: error.message 
        }, { status: 500 });
    }
}, ['vendor']);